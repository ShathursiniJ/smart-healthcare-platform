const express = require("express");
const {
  createMedicalHistory,
  getAllMedicalHistory,
  getMedicalHistoryById,
  updateMedicalHistoryById,
  deleteMedicalHistoryById,
} = require("../controllers/medicalHistoryController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  createMedicalHistoryValidation,
  updateMedicalHistoryValidation,
  validate,
} = require("../validations/medicalHistoryValidation");

const router = express.Router();

router.post("/", protect, authorize("patient"), createMedicalHistoryValidation, validate, createMedicalHistory);
router.get("/", protect, authorize("patient"), getAllMedicalHistory);
router.get("/:id", protect, authorize("patient"), getMedicalHistoryById);
router.put("/:id", protect, authorize("patient"), updateMedicalHistoryValidation, validate, updateMedicalHistoryById);
router.delete("/:id", protect, authorize("patient"), deleteMedicalHistoryById);

module.exports = router;