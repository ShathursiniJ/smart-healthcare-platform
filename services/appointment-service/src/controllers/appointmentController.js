import axios from 'axios';
import Appointment from '../models/Appointment.js';

const DOCTOR_SERVICE_URL = process.env.DOCTOR_SERVICE_URL || 'http://localhost:5003';
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
  const doctorRes = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`);
  const doctor = doctorRes?.data?.data?.doctor;
  if (!doctor || doctor.approvalStatus !== 'approved' || doctor.isActive === false) {
    return { ok: false, status: 400, message: 'Selected doctor is not approved for bookings.' };
  }

  const availabilityRes = await axios.get(`${DOCTOR_SERVICE_URL}/api/doctors/${doctorId}/availability`);
  const availabilityDoctor = availabilityRes?.data?.data?.doctor;
  const availability = availabilityDoctor?.availability || [];
  if (!Array.isArray(availability) || availability.length === 0) {
    return { ok: false, status: 400, message: 'Doctor has not published availability yet.' };
  }

  const appointmentDay = dayNames[new Date(appointmentDate).getDay()];
  const selectedMinutes = parseTimeToMinutes(timeSlot);
  if (selectedMinutes === null) {
    return { ok: false, status: 400, message: 'Invalid time slot format.' };
  }

  const daySlot = availability.find((slot) => slot.day === appointmentDay);
  if (!daySlot) {
    return { ok: false, status: 400, message: `Doctor is not available on ${appointmentDay}.` };
  }

  const startMinutes = parseTimeToMinutes(daySlot.startTime);
  const endMinutes = parseTimeToMinutes(daySlot.endTime);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return { ok: false, status: 400, message: 'Doctor availability configuration is invalid.' };
  }

  if (selectedMinutes < startMinutes || selectedMinutes >= endMinutes) {
    return {
      ok: false,
      status: 400,
      message: `Selected slot is outside doctor availability (${daySlot.startTime} - ${daySlot.endTime}).`,
    };
  }

  return { ok: true };
};

// POST /api/appointments — patient books
export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId, doctorAuthId, doctorName, specialization, hospital,
      appointmentDate, timeSlot, reason, type, consultationFee,
      patientName, patientEmail,
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
      doctorId, doctorAuthId, doctorName, specialization,
      hospital: hospital || '',
      appointmentDate: requestedDate,
      timeSlot, reason, type: type || 'video',
      consultationFee: consultationFee || 0,
      status: 'pending',
    });

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
