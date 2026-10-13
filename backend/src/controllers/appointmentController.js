const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Schedule = require("../models/Schedule");
const {
  sendAppointmentEmail,
} = require("../config/email");

// =========================
// BOOK APPOINTMENT
// =========================

const bookAppointment = async (req, res) => {
  try {
    const doctorId = req.body.doctor || req.body.doctorId;
    const date = req.body.date || req.body.appointmentDate;
    const startTime = req.body.startTime || req.body.appointmentTime;
    let endTime = req.body.endTime;
    const reason = req.body.reason;

    if (!doctorId || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date, and startTime (or appointmentTime) are required",
      });
    }

    // Auto calculate endTime if missing
    if (!endTime) {
      const [h, m] = startTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const totalMin = h * 60 + m + 30;
        const endH = Math.floor(totalMin / 60) % 24;
        const endM = totalMin % 60;
        endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
      } else {
        endTime = startTime;
      }
    }

    // Find doctor
    const doctorData = await Doctor.findOne({
      _id: doctorId,
      isActive: { $ne: false },
    }).populate("user", "name email");

    if (!doctorData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or unavailable",
      });
    }

    // Find schedule if present
    const schedule = await Schedule.findOne({
      doctor: doctorId,
    });

    // If doctor has an explicit weekly schedule, validate against it
    if (schedule && Array.isArray(schedule.weeklySchedule) && schedule.weeklySchedule.length > 0) {
      const selectedDate = new Date(date);
      if (!isNaN(selectedDate.getTime())) {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayName = days[selectedDate.getDay()];
        const daySchedule = schedule.weeklySchedule.find((item) => item.day === dayName);

        if (daySchedule && !daySchedule.isAvailable) {
          return res.status(400).json({
            success: false,
            message: "Doctor is not available on this day",
          });
        }
      }
    }

    // Check existing appointment
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      startTime,
      status: {
        $in: ["pending", "confirmed"],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is already booked",
      });
    }

    const paymentMethod = req.body.paymentMethod || "stripe";

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorData._id,
      hospital: doctorData.hospital,
      date,
      startTime,
      endTime,
      reason: reason || "",
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "unpaid" : "pending",
    });

    // Get patient information
    const patient = req.user;

    // Send confirmation email
    await sendAppointmentEmail({
      email: patient.email,
      patientName: patient.name,
      doctorName: doctorData.user?.name || "Doctor",
      date,
      startTime,
      endTime,
    });

    // Generate Stripe checkout session URL if requested or paying online
    let stripeCheckoutUrl = null;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (paymentMethod === "stripe") {
      if (stripeKey && !stripeKey.includes("your_stripe_secret_key")) {
        try {
          const Stripe = require("stripe");
          const stripe = new Stripe(stripeKey);

          const fee = doctorData.fee || 2000;
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email: patient.email,
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: `Consultation with Dr. ${doctorData.user?.name || "Doctor"}`,
                    description: `Appointment on ${date} at ${startTime}`,
                  },
                  unit_amount: Math.round(fee * 100),
                },
                quantity: 1,
              },
            ],
            metadata: {
              type: "appointment",
              appointmentId: String(appointment._id),
              patientId: String(patient._id),
            },
            success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment._id}`,
            cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/cancelled?appointment_id=${appointment._id}`,
          });

          appointment.stripeSessionId = session.id;
          await appointment.save();
          stripeCheckoutUrl = session.url;
        } catch (stripeErr) {
          console.error("Stripe Checkout Session error:", stripeErr.message);
        }
      }
    }

    // Populate appointment
    const populatedAppointment =
      await Appointment.findById(appointment._id)
        .populate("patient", "name email")
        .populate("doctor", "specialization qualification fee user")
        .populate("hospital", "name city address");

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
      checkoutUrl: stripeCheckoutUrl,
    });
  } catch (error) {
    console.error(
      "Book appointment error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot is already booked",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET MY APPOINTMENTS
// =========================

const getMyAppointments = async (req, res) => {
  try {
    const appointments =
      await Appointment.find({
        patient: req.user._id,
      })
        .populate(
          "doctor",
          "specialization qualification fee"
        )
        .populate(
          "hospital",
          "name city address"
        )
        .sort({
          date: 1,
          startTime: 1,
        });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// CANCEL APPOINTMENT
// =========================

const cancelAppointment = async (req, res) => {
  try {
    const appointment =
      await Appointment.findOne({
        _id: req.params.id,
        patient: req.user._id,
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment cannot be cancelled",
      });
    }

    // Mark appointment as cancelled
    appointment.status = "cancelled";

    // If paid via Stripe, create a refund
    if (appointment.paymentMethod === "stripe" && (appointment.paymentIntentId || appointment.stripeSessionId)) {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey && !stripeKey.includes("your_stripe_secret_key")) {
        try {
          const Stripe = require("stripe");
          const stripe = new Stripe(stripeKey);

          let paymentIntentId = appointment.paymentIntentId;

          // If paymentIntentId is missing but stripeSessionId exists, retrieve session to find payment_intent
          if (!paymentIntentId && appointment.stripeSessionId) {
            try {
              const session = await stripe.checkout.sessions.retrieve(appointment.stripeSessionId);
              if (session.payment_intent) {
                paymentIntentId =
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent.id;
                appointment.paymentIntentId = paymentIntentId;
              }
            } catch (sessErr) {
              console.error("Could not retrieve session for refund:", sessErr.message);
            }
          }

          if (paymentIntentId) {
            const refund = await stripe.refunds.create({
              payment_intent: paymentIntentId,
            });
            appointment.refundId = refund.id;
          }
          appointment.paymentStatus = "refunded";
        } catch (stripeErr) {
          if (
            stripeErr.code === "charge_already_refunded" ||
            stripeErr.raw?.code === "charge_already_refunded"
          ) {
            console.log("Stripe charge was already refunded:", stripeErr.message);
            appointment.paymentStatus = "refunded";
          } else {
            console.error("Stripe refund error during cancellation:", stripeErr.message);
            appointment.paymentStatus = "refunded";
          }
        }
      } else {
        appointment.paymentStatus = "refunded";
      }
    }

    // Save updates
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error(
      "Cancel appointment error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET DOCTOR APPOINTMENTS
// =========================

const getDoctorAppointments = async (
  req,
  res
) => {
  try {
    const doctor =
      await Doctor.findOne({
        user: req.user._id,
      });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor profile not found",
      });
    }

    const appointments =
      await Appointment.find({
        doctor: doctor._id,
      })
        .populate(
          "patient",
          "name email"
        )
        .populate(
          "hospital",
          "name city"
        )
        .sort({
          date: 1,
          startTime: 1,
        });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error(
      "Get doctor appointments error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// UPDATE APPOINTMENT STATUS
// =========================

const updateAppointmentStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "confirmed",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment status",
      });
    }

    const doctor =
      await Doctor.findOne({
        user: req.user._id,
      });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor profile not found",
      });
    }

    const appointment =
      await Appointment.findOne({
        _id: req.params.id,
        doctor: doctor._id,
      }).populate(
        "patient",
        "name email"
      );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;

    await appointment.save();

    res.status(200).json({
      success: true,
      message:
        `Appointment ${status} successfully`,
      appointment,
    });
  } catch (error) {
    console.error(
      "Update appointment status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// CREATE APPOINTMENT STRIPE CHECKOUT (Hosted Page)
// =========================

const createAppointmentCheckoutSession = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user._id,
    }).populate({
      path: "doctor",
      populate: { path: "user", select: "name" },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already paid",
      });
    }

    const doctorName = appointment.doctor?.user?.name || "Healthcare Professional";
    const fee = appointment.doctor?.fee || 2000;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (stripeKey && !stripeKey.includes("your_stripe_secret_key")) {
      const Stripe = require("stripe");
      const stripe = new Stripe(stripeKey);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: req.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Consultation with Dr. ${doctorName}`,
                description: `Appointment on ${appointment.date} at ${appointment.startTime}`,
              },
              unit_amount: Math.round(fee * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "appointment",
          appointmentId: String(appointment._id),
          patientId: String(req.user._id),
        },
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointment._id}`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/cancelled?appointment_id=${appointment._id}`,
      });

      appointment.stripeSessionId = session.id;
      appointment.paymentMethod = "stripe";
      await appointment.save();

      return res.status(200).json({
        success: true,
        url: session.url,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } else {
      // Demo fallback when Stripe live/test key is placeholder
      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
      appointment.paymentMethod = "stripe";
      appointment.amountPaid = fee;
      await appointment.save();

      return res.status(200).json({
        success: true,
        demoMode: true,
        message: "Stripe payment simulated successfully!",
        url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success?demo=true&appointment_id=${appointment._id}`,
      });
    }
  } catch (error) {
    console.error("Appointment stripe checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to create Stripe checkout session",
      error: error.message,
    });
  }
};

const payAppointment = createAppointmentCheckoutSession;

// =========================
// VERIFY APPOINTMENT PAYMENT
// =========================

const verifyAppointmentPayment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const sessionId = req.body.sessionId || req.query.sessionId;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        verified: true,
        message: "Appointment is already verified as paid",
        appointment,
      });
    }

    const sid = sessionId || appointment.stripeSessionId;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (sid && stripeKey && !stripeKey.includes("your_stripe_secret_key")) {
      const Stripe = require("stripe");
      const stripe = new Stripe(stripeKey);
      const session = await stripe.checkout.sessions.retrieve(sid);

      if (session.payment_status === "paid") {
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

        console.log(`✅ Appointment ${appointment._id} verified as paid via Stripe session`);

        return res.status(200).json({
          success: true,
          verified: true,
          message: "Payment successfully verified and appointment confirmed",
          appointment,
        });
      }
    }

    return res.status(200).json({
      success: true,
      verified: appointment.paymentStatus === "paid",
      appointment,
    });
  } catch (error) {
    console.error("Verify appointment payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment status",
      error: error.message,
    });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  createAppointmentCheckoutSession,
  payAppointment,
  verifyAppointmentPayment,
};