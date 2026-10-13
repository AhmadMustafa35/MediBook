const Stripe = require("stripe");
const Subscription = require("../models/Subscription");

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

// =========================
// CREATE CHECKOUT SESSION
// =========================

const createCheckoutSession = async (req, res) => {
  try {
    const user = req.user;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      customer_email: user.email,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      success_url:
        `${process.env.FRONTEND_URL}/subscription/success`,

      cancel_url:
        `${process.env.FRONTEND_URL}/subscription/cancel`,
    });

    res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error(
      "Stripe checkout error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Unable to create checkout session",
    });
  }
};

// =========================
// GET MY SUBSCRIPTION
// =========================

const getMySubscription = async (req, res) => {
  try {
    let subscription =
      await Subscription.findOne({
        user: req.user._id,
      });

    // Create free subscription if none exists
    if (!subscription) {
      subscription =
        await Subscription.create({
          user: req.user._id,
          plan: "free",
          status: "active",
        });
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error(
      "Get subscription error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCheckoutSession,
  getMySubscription,
};