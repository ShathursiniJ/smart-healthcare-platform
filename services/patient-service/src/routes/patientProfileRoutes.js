const express = require("express");
const {
  createPatientProfile,
  getCurrentPatientProfile,
  updateCurrentPatientProfile,
  uploadPatientProfileAvatar,
} = require("../controllers/patientProfileController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadAvatar } = require("../middleware/uploadMiddleware");
const {
  createPatientProfileValidation,
  updatePatientProfileValidation,
  validate,
} = require("../validations/patientProfileValidation");

const router = express.Router();

router.put("/profile/avatar", protect, authorize("patient"), uploadAvatar.single("avatar"), uploadPatientProfileAvatar);

router.post("/profile", protect, authorize("patient"), createPatientProfileValidation, validate, createPatientProfile);
router.get("/profile", protect, authorize("patient"), getCurrentPatientProfile);
router.put("/profile", protect, authorize("patient"), updatePatientProfileValidation, validate, updateCurrentPatientProfile);

module.exports = router;