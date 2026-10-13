const Review = require("../models/Review");
const Appointment = require("../models/Appointment");

// =========================
// CREATE REVIEW
// =========================

const createReview = async (req, res) => {
  try {
    const {
      appointment,
      rating,
      comment,
    } = req.body;

    if (!appointment || !rating) {
      return res.status(400).json({
        success: false,
        message: "Appointment and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Find completed appointment belonging to patient
    const appointmentData = await Appointment.findOne({
      _id: appointment,
      patient: req.user._id,
      status: "completed",
    });

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message:
          "Completed appointment not found",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      appointment,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "You have already reviewed this appointment",
      });
    }

    const review = await Review.create({
      patient: req.user._id,
      doctor: appointmentData.doctor,
      appointment: appointmentData._id,
      rating,
      comment: comment || "",
    });

    const populatedReview =
      await Review.findById(review._id)
        .populate("patient", "name")
        .populate(
          "doctor",
          "specialization qualification"
        );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "You have already reviewed this appointment",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET DOCTOR REVIEWS
// =========================

const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      doctor: req.params.doctorId,
    })
      .populate("patient", "name")
      .sort({
        createdAt: -1,
      });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? (
            reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / totalReviews
          ).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      totalReviews,
      averageRating: Number(averageRating),
      reviews,
    });
  } catch (error) {
    console.error(
      "Get doctor reviews error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createReview,
  getDoctorReviews,
};