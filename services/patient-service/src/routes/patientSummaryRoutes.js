const express = require("express");
const { getPatientSummary } = require("../controllers/patientSummaryController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, authorize("patient"), getPatientSummary);

module.exports = router;