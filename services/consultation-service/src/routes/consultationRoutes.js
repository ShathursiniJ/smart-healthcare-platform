import express from 'express';
import {
  startConsultation, getConsultationByAppointment,
  endConsultation, getDoctorConsultations, getPatientConsultations,
} from '../controllers/consultationController.js';
import {
  createPrescription, getPatientPrescriptions,
  getDoctorPrescriptions, getPrescriptionById,
} from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Consultation routes
router.post('/consultations/start',                     protect, authorize('doctor'), startConsultation);
router.get('/consultations/doctor',                     protect, authorize('doctor'), getDoctorConsultations);
router.get('/consultations/patient',                    protect, authorize('patient'), getPatientConsultations);
router.get('/consultations/appointment/:appointmentId', protect, getConsultationByAppointment);
router.patch('/consultations/:id/end',                  protect, authorize('doctor'), endConsultation);

// Prescription routes
router.post('/prescriptions',          protect, authorize('doctor'), createPrescription);
router.get('/prescriptions/patient',   protect, authorize('patient'), getPatientPrescriptions);
router.get('/prescriptions/doctor',    protect, authorize('doctor'), getDoctorPrescriptions);
router.get('/prescriptions/:id',       protect, getPrescriptionById);

export default router;
