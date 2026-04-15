import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { sendEmail, paymentConfirmationEmail } from '../utils/emailService.js';

// POST /api/payments/initiate — patient initiates payment
export const initiatePayment = async (req, res) => {
  try {
    const {
      appointmentId, doctorId, doctorName, amount, currency,
      paymentMethod, patientName, patientEmail,
    } = req.body;

    // Check no duplicate payment for same appointment
    const existing = await Payment.findOne({ appointmentId, status: 'completed' });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Payment already completed for this appointment.' });
    }

    const payment = await Payment.create({
      appointmentId,
      patientId:   req.user.userId,
      patientName: patientName || req.user.name || 'Patient',
      doctorId,
      doctorName,
      amount,
      currency:      currency || 'LKR',
      paymentMethod: paymentMethod || 'payhere',
      status: 'pending',
    });

    // For sandbox / PayHere — return payment data for frontend to submit
    const payhereData = {
      merchant_id:   process.env.PAYHERE_MERCHANT_ID || 'SANDBOX_MERCHANT',
      return_url:    'http://localhost:5173/patient/payments',
      cancel_url:    'http://localhost:5173/patient/payments',
      notify_url:    `http://localhost:5006/api/payments/notify`,
      order_id:      payment._id.toString(),
      items:         `Consultation with ${doctorName}`,
      currency:      currency || 'LKR',
      amount:        amount.toFixed(2),
      first_name:    patientName?.split(' ')[0] || 'Patient',
      last_name:     patientName?.split(' ').slice(1).join(' ') || '',
      email:         patientEmail || '',
      phone:         '0771234567',
      address:       'Colombo',
      city:          'Colombo',
      country:       'Sri Lanka',
    };

    res.status(201).json({
      success: true,
      message: 'Payment initiated.',
      data: { payment, payhereData, sandbox: true },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/confirm — manual confirmation (sandbox / cash)
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId, transactionId, patientEmail } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });

    payment.status        = 'completed';
    payment.transactionId = transactionId || `TXN-${Date.now()}`;
    payment.paidAt        = new Date();
    await payment.save();

    // Create notification
    await Notification.create({
      userId:    payment.patientId,
      role:      'patient',
      title:     'Payment Successful',
      message:   `Your payment of LKR ${payment.amount} for consultation with ${payment.doctorName} was successful.`,
      type:      'payment',
      relatedId: payment._id.toString(),
    });

    // Send email receipt
    if (patientEmail) {
      await sendEmail({
        to:      patientEmail,
        subject: 'MediConnect — Payment Receipt',
        html:    paymentConfirmationEmail(payment.patientName, payment.doctorName, payment.amount, payment.transactionId),
      });
    }

    res.status(200).json({ success: true, message: 'Payment confirmed.', data: { payment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/notify — PayHere server-side notification
export const payhereNotify = async (req, res) => {
  try {
    const { order_id, status_code, payment_id } = req.body;

    if (status_code === '2') {
      // PayHere success code
      await Payment.findByIdAndUpdate(order_id, {
        status: 'completed',
        transactionId: payment_id,
        paidAt: new Date(),
      });
    } else if (status_code === '-1' || status_code === '-2') {
      await Payment.findByIdAndUpdate(order_id, { status: 'failed' });
    }

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error');
  }
};

// GET /api/payments/patient — patient payment history
export const getPatientPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patientId: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { payments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/admin — all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: { payments, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/admin/stats
export const getPaymentStats = async (req, res) => {
  try {
    const [total, completed, pending, failed] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'failed' }),
    ]);
    const revenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    res.status(200).json({
      success: true,
      data: { stats: { total, completed, pending, failed, revenue: revenue[0]?.total || 0 } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
