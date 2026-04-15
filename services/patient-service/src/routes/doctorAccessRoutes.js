// services/patient-service/src/routes/doctorAccessRoutes.js
// Allows doctors to view reports and profiles of their patients

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const PatientReport = require('../models/PatientReport');
const PatientProfile = require('../models/PatientProfile');
const MedicalHistory = require('../models/MedicalHistory');

// All routes below require doctor authentication
router.use(protect);
router.use(authorize('doctor'));

// GET /api/doctor-access/patient-reports/:patientAuthUserId
// Doctor views reports uploaded by a specific patient
router.get('/patient-reports/:patientAuthUserId', async (req, res) => {
  try {
    const reports = await PatientReport.find({
      authUserId: req.params.patientAuthUserId,
    }).sort({ createdAt: -1 });

    const profile = await PatientProfile.findOne({
      authUserId: req.params.patientAuthUserId,
    });

    return sendSuccess(res, 200, 'Patient reports fetched.', { reports, profile });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
});

// GET /api/doctor-access/patient-profile/:patientAuthUserId
// Doctor views profile of a specific patient
router.get('/patient-profile/:patientAuthUserId', async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({
      authUserId: req.params.patientAuthUserId,
    });
    const history = await MedicalHistory.find({
      authUserId: req.params.patientAuthUserId,
    }).sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Patient profile fetched.', { profile, history });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
});

module.exports = router;
