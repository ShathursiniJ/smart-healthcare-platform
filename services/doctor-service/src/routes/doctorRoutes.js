import express from 'express';
import {
  createDoctorProfile, getDoctorProfile, updateDoctorProfile,
  setAvailability, getAllApprovedDoctors, getDoctorById,
  getDoctorAvailability, uploadProfileImage
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllApprovedDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

// Doctor only routes
router.post('/profile/create', protect, authorize('doctor'), createDoctorProfile);
router.get('/profile/me', protect, authorize('doctor'), getDoctorProfile);
router.put('/profile/update', protect, authorize('doctor'), updateDoctorProfile);
router.put('/availability', protect, authorize('doctor'), setAvailability);
router.post('/profile/upload-image', protect, authorize('doctor'), upload.single('profileImage'), uploadProfileImage);

export default router;