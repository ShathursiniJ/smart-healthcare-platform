import express from 'express';
import {
  bookAppointment, getPatientAppointments, getDoctorAppointments,
  getAppointmentById, confirmAppointment, cancelAppointment,
  completeAppointment, setRoomName, getAllAppointments, getStats, updatePaymentStatus,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin
router.get('/admin/all',   protect, authorize('admin'), getAllAppointments);
router.get('/admin/stats', protect, authorize('admin'), getStats);

// Patient
router.post('/',              protect, authorize('patient'), bookAppointment);
router.get('/patient',        protect, authorize('patient'), getPatientAppointments);

// Doctor
router.get('/doctor',         protect, authorize('doctor'), getDoctorAppointments);
router.patch('/:id/confirm',  protect, authorize('doctor'), confirmAppointment);
router.patch('/:id/complete', protect, authorize('doctor'), completeAppointment);

// Shared (patient or doctor)
router.get('/:id',            protect, getAppointmentById);
router.patch('/:id/cancel',   protect, cancelAppointment);
router.patch('/:id/room',     protect, setRoomName);
router.patch('/:id/payment-status', protect, updatePaymentStatus);

export default router;
