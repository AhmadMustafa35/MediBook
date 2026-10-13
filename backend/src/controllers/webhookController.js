const Stripe = require("stripe");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleStripeWebhook = async (req, res) => {
  try {
    let event;
    const signature = req.headers["stripe-signature"];

    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("⚠️ Stripe webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook signature error: ${err.message}`);
      }
    } else {
      // Dev mode fallback or direct payload
      try {
        event =
          typeof req.body === "string" || Buffer.isBuffer(req.body)
            ? JSON.parse(req.body.toString())
            : req.body;
      } catch (parseErr) {
        return res.status(400).json({ error: "Invalid webhook payload" });
      }
    }

    if (!event || !event.type) {
      return res.status(400).json({ error: "No event found" });
    }

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const appointmentId = session.metadata?.appointmentId;

        let appointment = null;
        if (appointmentId) {
          appointment = await Appointment.findById(appointmentId);
        }
        if (!appointment && session.id) {
          appointment = await Appointment.findOne({ stripeSessionId: session.id });
        }

        if (appointment) {
          appointment.paymentStatus = "paid";
          appointment.status = "confirmed";
          appointment.paymentMethod = "stripe";
          appointment.stripeSessionId = session.id;
          if (session.payment_intent) {
            appointment.paymentIntentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent.id;
          }
          appointment.amountPaid = (session.amount_total || 0) / 100;
          await appointment.save();

          console.log(`✅ Stripe webhook confirmed payment for appointment ${appointment._id}`);
          break;
        }

        // Handle user subscription if not appointment
        const email = session.customer_details?.email;
        if (!email) break;

        const user = await User.findOne({ email });
        if (!user) break;

        let subscription = await Subscription.findOne({ user: user._id });
        if (!subscription) {
          subscription = await Subscription.create({ user: user._id });
        }

        subscription.plan = "pro";
        subscription.status = "active";
        subscription.stripeCustomerId = session.customer || "";
        subscription.stripeSubscriptionId = session.subscription || "";
        await subscription.save();

        console.log("MediBook Pro subscription activated for", email);
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: stripeSubscription.id,
        });

        if (subscription) {
          subscription.plan = "free";
          subscription.status = "cancelled";
          await subscription.save();
        }

        console.log("MediBook subscription cancelled");
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);
    res.status(400).json({
      success: false,
      message: "Webhook error",
    });
  }
};

module.exports = {
  handleStripeWebhook,
};