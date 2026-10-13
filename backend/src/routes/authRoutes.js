const express = require("express");

const {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
  createAdmin,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Temporary development route
router.post("/create-admin", createAdmin);

// Temporary RBAC test
router.get(
  "/patient-test",
  protect,
  authorize("patient"),
  (req, res) => {
    res.json({
      success: true,
      message: "Patient route accessed successfully",
      user: req.user,
    });
  }
);

module.exports = router;