const express = require("express");

const {
  createOrUpdateSchedule,
  getDoctorSchedule,
  getAvailableSlots,
} = require("../controllers/scheduleController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// DOCTOR - CREATE/UPDATE
// =========================

router.post(
  "/",
  protect,
  authorize("doctor"),
  createOrUpdateSchedule
);

// =========================
// GET AVAILABLE SLOTS
// =========================

router.get(
  "/doctor/:doctorId/slots",
  getAvailableSlots
);

// =========================
// GET DOCTOR SCHEDULE
// =========================

router.get(
  "/doctor/:doctorId",
  getDoctorSchedule
);

module.exports = router;