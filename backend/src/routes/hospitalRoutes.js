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

router.get("/:id", getHospital);

// =========================
// ADMIN HOSPITAL MANAGEMENT
// =========================

// Get all hospitals
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

module.exports = router;