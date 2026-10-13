require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman) or any localhost origin
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev
      }
    },
    credentials: true,
  })
);

// Stripe webhook endpoint requires raw payload Buffer for signature verification
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  require("./routes/webhookRoutes")
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "MediBook API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).send("MediBook API Server is operational");
});

// Routes Mount Point
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/hospitals", require("./routes/hospitalRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));

// 404 Handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// Connect database and start server
async function startServer() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medibook";

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(mongoUri);
    console.log("✅ Database Connection Established Successfully");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 MediBook Backend Server running on port ${PORT}`);
      console.log(`Local Access: http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      console.error("❌ HTTP Server Error:", error);
    });
  } catch (error) {
    console.error("❌ Failed to start MediBook:", error);
    process.exitCode = 1;
  }
}

startServer();
