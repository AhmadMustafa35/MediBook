const express = require("express");

const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  createAppointmentCheckoutSession,
  payAppointment,
  verifyAppointmentPayment,
} = require("../controllers/appointmentController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// PATIENT
// =========================

// Book appointment
router.post(
  "/",
  protect,
  authorize("patient"),
  bookAppointment
);

// Get my appointments
router.get(
  "/my",
  protect,
  authorize("patient"),
  getMyAppointments
);

// Cancel appointment
router.put(
  "/:id/cancel",
  protect,
  authorize("patient"),
  cancelAppointment
);

// Create Stripe Checkout Session (returns hosted URL)
router.post(
  "/:id/pay",
  protect,
  authorize("patient"),
  payAppointment
);

router.post(
  "/:id/checkout-session",
  protect,
  authorize("patient"),
  createAppointmentCheckoutSession
);

// Verify Stripe Payment
router.post(
  "/:id/verify-payment",
  protect,
  authorize("patient"),
  verifyAppointmentPayment
);

router.get(
  "/:id/verify-payment",
  protect,
  authorize("patient"),
  verifyAppointmentPayment
);

// =========================
// DOCTOR
// =========================

// Get doctor's appointments
router.get(
  "/doctor/my",
  protect,
  authorize("doctor"),
  getDoctorAppointments
);

// Update appointment status
router.put(
  "/doctor/:id/status",
  protect,
  authorize("doctor"),
  updateAppointmentStatus
);

module.exports = router;