const Schedule = require("../models/Schedule");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// =========================
// CREATE / UPDATE SCHEDULE
// =========================

const createOrUpdateSchedule = async (req, res) => {
  try {
    const { weeklySchedule } = req.body;

    if (
      !weeklySchedule ||
      !Array.isArray(weeklySchedule)
    ) {
      return res.status(400).json({
        success: false,
        message: "weeklySchedule must be an array",
      });
    }

    const doctor = await Doctor.findOne({
      user: req.user._id,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    let schedule = await Schedule.findOne({
      doctor: doctor._id,
    });

    if (schedule) {
      schedule.weeklySchedule = weeklySchedule;

      await schedule.save();
    } else {
      schedule = await Schedule.create({
        doctor: doctor._id,
        weeklySchedule,
      });
    }

    res.status(200).json({
      success: true,
      message: "Schedule saved successfully",
      schedule,
    });
  } catch (error) {
    console.error(
      "Schedule error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET DOCTOR SCHEDULE
// =========================

const getDoctorSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      doctor: req.params.doctorId,
    }).populate(
      "doctor",
      "specialization qualification experience fee"
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    console.error(
      "Get schedule error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// GET AVAILABLE SLOTS
// =========================

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    // Validate date
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // Find doctor
    const doctor = await Doctor.findOne({
      _id: doctorId,
      isActive: true,
      isVerified: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Find schedule or use default
    const schedule = await Schedule.findOne({
      doctor: doctorId,
    });

    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const dayName = days[selectedDate.getDay()];

    let daySchedule = null;

    if (schedule && Array.isArray(schedule.weeklySchedule)) {
      daySchedule = schedule.weeklySchedule.find((item) => item.day === dayName);
    }

    if (!daySchedule) {
      // Default working hours for doctors without custom schedule
      daySchedule = {
        day: dayName,
        isAvailable: dayName !== "sunday", // Default closed on Sundays
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
      };
    }

    // Doctor unavailable
    if (!daySchedule.isAvailable) {
      return res.status(200).json({
        success: true,
        date,
        day: dayName,
        slots: [],
      });
    }

    // Convert working hours to minutes
    let currentMinutes =
      timeToMinutes(
        daySchedule.startTime
      );

    const endMinutes =
      timeToMinutes(
        daySchedule.endTime
      );

    const slots = [];

    // Generate slots
    while (
      currentMinutes +
        daySchedule.slotDuration <=
      endMinutes
    ) {
      const startTime =
        minutesToTime(currentMinutes);

      const endTime =
        minutesToTime(
          currentMinutes +
            daySchedule.slotDuration
        );

      slots.push({
        startTime,
        endTime,
      });

      currentMinutes +=
        daySchedule.slotDuration;
    }

    // Find booked appointments
    const bookedAppointments =
      await Appointment.find({
        doctor: doctorId,
        date,
        status: {
          $in: [
            "pending",
            "confirmed",
          ],
        },
      });

    // Remove booked slots
    const availableSlots =
      slots.filter((slot) => {
        return !bookedAppointments.some(
          (appointment) =>
            appointment.startTime ===
            slot.startTime
        );
      });

    res.status(200).json({
      success: true,
      date,
      day: dayName,
      slots: availableSlots,
    });
  } catch (error) {
    console.error(
      "Available slots error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// =========================
// TIME HELPER
// HH:MM → MINUTES
// =========================

const timeToMinutes = (time) => {
  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;
};

// =========================
// TIME HELPER
// MINUTES → HH:MM
// =========================

const minutesToTime = (minutes) => {
  const hours = Math.floor(
    minutes / 60
  );

  const mins = minutes % 60;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${String(mins).padStart(
    2,
    "0"
  )}`;
};

// =========================
// EXPORTS
// =========================

module.exports = {
  createOrUpdateSchedule,
  getDoctorSchedule,
  getAvailableSlots,
};