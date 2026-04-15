import Notification from '../models/Notification.js';
import { sendEmail, appointmentConfirmationEmail } from '../utils/emailService.js';

// POST /api/notifications/send — internal use
export const sendNotification = async (req, res) => {
  try {
    const { userId, role, title, message, type, relatedId } = req.body;

    const notification = await Notification.create({
      userId, role, title, message,
      type:      type || 'system',
      relatedId: relatedId || '',
    });

    res.status(201).json({ success: true, message: 'Notification sent.', data: { notification } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notifications/appointment-confirmed — called after doctor confirms
export const notifyAppointmentConfirmed = async (req, res) => {
  try {
    const {
      patientId, patientName, patientEmail,
      doctorId, doctorName,
      appointmentId, appointmentDate, timeSlot,
    } = req.body;

    // Notify patient
    await Notification.create({
      userId: patientId, role: 'patient',
      title:   'Appointment Confirmed',
      message: `Your appointment with ${doctorName} on ${appointmentDate} at ${timeSlot} has been confirmed.`,
      type: 'appointment', relatedId: appointmentId,
    });

    // Notify doctor
    await Notification.create({
      userId: doctorId, role: 'doctor',
      title:   'New Appointment',
      message: `You have a new confirmed appointment with ${patientName} on ${appointmentDate} at ${timeSlot}.`,
      type: 'appointment', relatedId: appointmentId,
    });

    // Send email to patient
    if (patientEmail) {
      await sendEmail({
        to:      patientEmail,
        subject: 'MediConnect — Appointment Confirmed',
        html:    appointmentConfirmationEmail(patientName, doctorName, appointmentDate, timeSlot),
      });
    }

    res.status(200).json({ success: true, message: 'Notifications sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/notifications — user's notifications
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: { notifications } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/:id/read — mark single as read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/read-all — mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.userId, isRead: false });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
