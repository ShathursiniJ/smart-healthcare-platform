import express from 'express';
import {
  getPendingDoctors, getAllDoctors,
  approveDoctor, rejectDoctor, deactivateDoctor, activateDoctor
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/doctors/pending', protect, authorize('admin'), getPendingDoctors);
router.get('/doctors', protect, authorize('admin'), getAllDoctors);
router.patch('/doctors/:id/approve', protect, authorize('admin'), approveDoctor);
router.patch('/doctors/:id/reject', protect, authorize('admin'), rejectDoctor);
router.patch('/doctors/:id/deactivate', protect, authorize('admin'), deactivateDoctor);
router.patch('/doctors/:id/activate', protect, authorize('admin'), activateDoctor);

export default router;