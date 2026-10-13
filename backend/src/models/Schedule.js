const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },

    // Doctor's weekly schedule
    weeklySchedule: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          required: true,
        },

        isAvailable: {
          type: Boolean,
          default: true,
        },

        startTime: {
          type: String,
          default: "09:00",
        },

        endTime: {
          type: String,
          default: "17:00",
        },

        slotDuration: {
          type: Number,
          default: 30,
          min: 5,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;