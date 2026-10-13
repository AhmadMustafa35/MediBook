const express = require("express");

const {
  createCheckoutSession,
  getMySubscription,
} = require("../controllers/subscriptionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get current subscription
router.get(
  "/me",
  protect,
  getMySubscription
);

// Create Stripe checkout
router.post(
  "/checkout",
  protect,
  createCheckoutSession
);

module.exports = router;