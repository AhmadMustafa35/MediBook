const express = require("express");

const {
  createHospital,
  getHospitals,
  getHospital,
  getAllHospitalsAdmin,
  verifyHospital,
  updateHospitalStatus,
} = require("../controllers/hospitalController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// =========================
// ADMIN - CREATE HOSPITAL
// =========================

router.post(
  "/",
  protect,
  authorize("admin"),
  createHospital
);

// =========================
// PUBLIC HOSPITAL ROUTES
// =========================

router.get("/", getHospitals);

// =========================
// ADMIN HOSPITAL MANAGEMENT
// =========================

// Get all hospitals (must be before /:id to avoid route conflict)
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllHospitalsAdmin
);

// Verify hospital
router.put(
  "/admin/:id/verify",
  protect,
  authorize("admin"),
  verifyHospital
);

// Activate / suspend hospital
router.put(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  updateHospitalStatus
);

// =========================
// PUBLIC - SINGLE HOSPITAL (must be last to avoid catching admin routes)
// =========================

router.get("/:id", getHospital);

module.exports = router;