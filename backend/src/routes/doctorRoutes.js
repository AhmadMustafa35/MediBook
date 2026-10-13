const express = require("express");

const {
  createDoctor,
  getDoctors,
  getDoctor,
  getAllDoctorsAdmin,
  verifyDoctor,
  updateDoctorStatus,
  registerDoctorProfile,
  getMyDoctorProfile,
  updateMyDoctorProfile,
} = require("../controllers/doctorController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// ADMIN - CREATE DOCTOR
// =========================

router.post(
  "/",
  protect,
  authorize("admin"),
  createDoctor
);

// =========================
// PUBLIC - GET DOCTORS
// =========================

router.get("/", getDoctors);

// =========================
// ADMIN - GET ALL DOCTORS
// =========================

router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllDoctorsAdmin
);

// =========================
// ADMIN - VERIFY DOCTOR
// =========================

router.put(
  "/admin/:id/verify",
  protect,
  authorize("admin"),
  verifyDoctor
);

// =========================
// ADMIN - ACTIVATE/SUSPEND
// =========================

router.put(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  updateDoctorStatus
);

// =========================
// DOCTOR - SELF-REGISTER PROFILE
// =========================

router.post("/register", protect, registerDoctorProfile);

// =========================
// DOCTOR - MY PROFILE
// =========================

router.get("/me", protect, getMyDoctorProfile);

router.put("/me", protect, updateMyDoctorProfile);

// =========================
// PUBLIC - SINGLE DOCTOR
// =========================

router.get("/:id", getDoctor);

module.exports = router;