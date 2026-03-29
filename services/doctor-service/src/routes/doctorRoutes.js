import express from 'express';
import {
  createDoctorProfile, getDoctorProfile, updateDoctorProfile,
  setAvailability, getAllApprovedDoctors, getDoctorById, getDoctorAvailability
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllApprovedDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);
router.post('/profile/create', protect, authorize('doctor'), createDoctorProfile);
router.get('/profile/me', protect, authorize('doctor'), getDoctorProfile);
router.put('/profile/update', protect, authorize('doctor'), updateDoctorProfile);
router.put('/availability', protect, authorize('doctor'), setAvailability);

export default router;