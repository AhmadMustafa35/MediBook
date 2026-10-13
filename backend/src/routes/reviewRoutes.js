const express = require("express");

const {
  createReview,
  getDoctorReviews,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// PATIENT
// =========================

// Submit review
router.post(
  "/",
  protect,
  authorize("patient"),
  createReview
);

// =========================
// PUBLIC
// =========================

// Get reviews for a doctor
router.get(
  "/doctor/:doctorId",
  getDoctorReviews
);

module.exports = router;