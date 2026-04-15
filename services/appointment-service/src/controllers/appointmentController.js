import axios from 'axios';
import Appointment from '../models/Appointment.js';
import { 
  buildAppointmentConfirmedNotification, 
  buildAppointmentCancelledNotifications, 
  buildAppointmentCompletedNotification,
  buildAppointmentBookedNotification,
  sendNotificationViaService 
} from '../../../../shared/utils/notificationHelper.js';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getDoctorServiceUrl = () => process.env.DOCTOR_SERVICE_URL || 'http://localhost:5005';

const parseTimeToMinutes = (value) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();

  const hhmm = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (hhmm) {
    const hours = Number(hhmm[1]);
    const minutes = Number(hhmm[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return (hours * 60) + minutes;
    }
  }

  const ampm = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
  if (ampm) {
    let hours = Number(ampm[1]);
    const minutes = Number(ampm[2]);
    const period = ampm[3].toUpperCase();
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
    if (period === 'AM') {
      if (hours === 12) hours = 0;
    } else if (hours !== 12) {
      hours += 12;
    }
    return (hours * 60) + minutes;
  }

  return null;
};

const validateDoctorAndAvailability = async ({ doctorId, appointmentDate, timeSlot }) => {
  try {
    const DOCTOR_SERVICE_URL = getDoctorServiceUrl();
    console.log(`[Validation] Checking doctor ${doctorId} at ${DOCTOR_SERVICE_URL}`);
    
    const doctorRes = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`);
    console.log('[Doctor Response]', doctorRes.data);
    
    const doctor = doctorRes?.data?.data?.doctor;
    if (!doctor) {
      console.log('[Validation] Doctor not found in response');
      return { ok: false, status: 404, message: 'Doctor not found' };
    }
    if (doctor.approvalStatus !== 'approved') {
      console.log(`[Validation] Doctor not approved: ${doctor.approvalStatus}`);
      return { ok: false, status: 400, message: 'Selected doctor is not approved for bookings.' };
    }
    if (doctor.isActive === false) {
      console.log('[Validation] Doctor is inactive');
      return { ok: false, status: 400, message: 'Selected doctor is not active.' };
    }

    console.log(`[Validation] Getting availability for doctor ${doctorId}`);
    const availabilityRes = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}/availability`);
    console.log('[Availability Response]', availabilityRes.data);
    
    const availabilityDoctor = availabilityRes?.data?.data?.doctor;
    const availability = availabilityDoctor?.availability || [];
    if (!Array.isArray(availability) || availability.length === 0) {
      console.log('[Validation] No availability found');
      return { ok: false, status: 400, message: 'Doctor has not published availability yet.' };
    }

    const appointmentDay = dayNames[new Date(appointmentDate).getDay()];
    console.log(`[Validation] Appointment day: ${appointmentDay}`);
    
    const selectedMinutes = parseTimeToMinutes(timeSlot);
    if (selectedMinutes === null) {
      console.log(`[Validation] Invalid time slot: ${timeSlot}`);
      return { ok: false, status: 400, message: 'Invalid time slot format.' };
    }

    const daySlot = availability.find((slot) => slot.day === appointmentDay);
    if (!daySlot) {
      console.log(`[Validation] Doctor not available on ${appointmentDay}. Available: ${availability.map(s => s.day).join(', ')}`);
      return { ok: false, status: 400, message: `Doctor is not available on ${appointmentDay}.` };
    }

    const startMinutes = parseTimeToMinutes(daySlot.startTime);
    const endMinutes = parseTimeToMinutes(daySlot.endTime);
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      console.log('[Validation] Invalid availability times');
      return { ok: false, status: 400, message: 'Doctor availability configuration is invalid.' };
    }

    if (selectedMinutes < startMinutes || selectedMinutes >= endMinutes) {
      console.log(`[Validation] Slot ${timeSlot} (${selectedMinutes}min) outside range ${daySlot.startTime}-${daySlot.endTime} (${startMinutes}-${endMinutes}min)`);
      return {
        ok: false,
        status: 400,
        message: `Selected slot is outside doctor availability (${daySlot.startTime} - ${daySlot.endTime}).`,
      };
    }

    console.log('[Validation] ✓ Doctor and availability validated');
    return { ok: true, doctor };
  } catch (error) {
    console.error('[Validation Error]', error.message);
    console.error('[Validation Error Stack]', error.stack);
    if (error.response) {
      console.error('[Validation Error Response]', error.response.status, error.response.data);
      return {
        ok: false,
        status: 400,
        message: `Doctor service error: ${error.response.data?.message || error.message}`,
      };
    }
    return {
      ok: false,
      status: 500,
      message: `Cannot reach doctor service at ${DOCTOR_SERVICE_URL}: ${error.message}`,
    };
  }
};

// POST /api/appointments — patient books
export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId, doctorAuthId, doctorName, specialization, hospital,
      appointmentDate, timeSlot, reason, type, consultationFee,
      patientName, patientEmail, patientPhone,
    } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({ success: false, message: 'Missing required appointment fields.' });
    }

    const requestedDate = new Date(appointmentDate);
    if (Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid appointment date.' });
    }
    if (requestedDate.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Appointment date must be in the future.' });
    }

    const doctorValidation = await validateDoctorAndAvailability({ doctorId, appointmentDate: requestedDate, timeSlot });
    if (!doctorValidation.ok) {
      return res.status(doctorValidation.status).json({ success: false, message: doctorValidation.message });
    }

    const dayStart = new Date(requestedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate: { $gte: dayStart, $lte: dayEnd },
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked.' });
    }

    const appt = await Appointment.create({
      patientId:    req.user.userId,
      patientName:  patientName || req.user.name || 'Patient',
      patientEmail: patientEmail || req.user.email || '',
      patientPhone: patientPhone || (req.user && req.user.phone) || '',
      doctorId, doctorAuthId, doctorName, specialization,
      hospital: hospital || '',
      appointmentDate: requestedDate,
      timeSlot, reason, type: type || 'video',
      consultationFee: consultationFee || 0,
      status: 'pending',
    });

    // Send notification to doctor about booking (async, non-blocking)
    const notificationData = buildAppointmentBookedNotification(appt, doctorValidation.doctor);
    sendNotificationViaService(axios, '/notifications/appointment-booked', notificationData, req.user.token);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: { appointment: appt },
    });
  } catch (error) {
    if (error?.response?.status === 404) {
      return res.status(400).json({ success: false, message: 'Selected doctor is not available for booking.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/patient — patient's appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { patientId: req.user.userId };
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter).sort({ appointmentDate: -1 });
    res.status(200).json({
      success: true,
      message: 'Appointments fetched.',
      data: { appointments },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/doctor — doctor's appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { doctorAuthId: req.user.userId };
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter).sort({ appointmentDate: 1 });
    res.status(200).json({
      success: true,
      message: 'Appointments fetched.',
      data: { appointments },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/:id — single appointment
export const getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    // Only patient or doctor can view
    const isOwner = appt.patientId === req.user.userId || appt.doctorAuthId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: { appointment: appt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/appointments/:id/confirm — doctor confirms
export const confirmAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    if (appt.doctorAuthId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can confirm.' });
    }
    if (appt.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot confirm a ${appt.status} appointment.` });
    }

    appt.status = 'confirmed';
    await appt.save();

    // Send notifications (async, non-blocking)
    const notificationData = buildAppointmentConfirmedNotification(appt);
    sendNotificationViaService(axios, '/notifications/appointment-confirmed', notificationData, req.user.token);

    res.status(200).json({ success: true, message: 'Appointment confirmed.', data: { appointment: appt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/appointments/:id/cancel — patient or doctor cancels
export const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    const isPatient = appt.patientId === req.user.userId;
    const isDoctor  = appt.doctorAuthId === req.user.userId;
    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (appt.status === 'completed' || appt.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Appointment is already ${appt.status}.` });
    }

    appt.status = 'cancelled';
    appt.cancelledBy = req.user.role;
    appt.cancellationReason = req.body.reason || '';
    await appt.save();

    // Send notifications (async, non-blocking)
    const notificationDataList = buildAppointmentCancelledNotifications(appt);
    notificationDataList.forEach(notifData => {
      sendNotificationViaService(axios, '/notifications/send', notifData, req.user.token);
    });

    res.status(200).json({ success: true, message: 'Appointment cancelled.', data: { appointment: appt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/appointments/:id/complete — doctor marks complete
export const completeAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    if (appt.doctorAuthId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can complete.' });
    }

    appt.status = 'completed';
    if (req.body.notes) appt.doctorNotes = req.body.notes;
    await appt.save();

    // Send notifications (async, non-blocking)
    const notificationData = buildAppointmentCompletedNotification(appt);
    sendNotificationViaService(axios, '/notifications/send', notificationData, req.user.token);

    res.status(200).json({ success: true, message: 'Appointment completed.', data: { appointment: appt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/appointments/:id/room — set Jitsi room name (called by consultation-service)
export const setRoomName = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { roomName: req.body.roomName },
      { new: true }
    );
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.status(200).json({ success: true, data: { appointment: appt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/appointments/:id/payment-status — update appointment payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, paymentStatus } = req.body;
    
    if (!paymentStatus || !['unpaid', 'paid', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status.' });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    // Only patient who booked or admin can update payment status
    const isPatient = appt.patientId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isPatient && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    appt.paymentStatus = paymentStatus;
    if (paymentId) appt.paymentId = paymentId;
    await appt.save();

    res.status(200).json({ 
      success: true, 
      message: 'Payment status updated.',
      data: { appointment: appt } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/admin/all — admin sees all
export const getAllAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
      Appointment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Appointment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { appointments, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/appointments/admin/stats
export const getStats = async (req, res) => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
    ]);
    res.status(200).json({ success: true, data: { stats: { total, pending, confirmed, completed, cancelled } } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
