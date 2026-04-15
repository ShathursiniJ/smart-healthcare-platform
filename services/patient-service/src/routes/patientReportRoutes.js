const express = require("express");
const {
  createPatientReport,
  getAllPatientReports,
  getPatientReportById,
  updatePatientReportById,
  replacePatientReportFile,
  deletePatientReportById,
} = require("../controllers/patientReportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadReport } = require("../middleware/uploadMiddleware");
const {
  createPatientReportValidation,
  updatePatientReportValidation,
  validate,
} = require("../validations/patientReportValidation");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("patient"),
  uploadReport.single("reportFile"),
  createPatientReportValidation,
  validate,
  createPatientReport
);

router.get("/", protect, authorize("patient"), getAllPatientReports);
router.get("/:id", protect, authorize("patient"), getPatientReportById);
router.put("/:id", protect, authorize("patient"), updatePatientReportValidation, validate, updatePatientReportById);
router.put("/:id/file", protect, authorize("patient"), uploadReport.single("reportFile"), replacePatientReportFile);
router.delete("/:id", protect, authorize("patient"), deletePatientReportById);

module.exports = router;