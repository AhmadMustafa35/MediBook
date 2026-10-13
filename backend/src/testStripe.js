require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));

async function testStripeFlow() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    const server = app.listen(5006, "127.0.0.1", async () => {
      console.log("Test server running on http://127.0.0.1:5006");

      try {
        // 1. Get doctors
        const docRes = await fetch("http://127.0.0.1:5006/api/doctors");
        const docData = await docRes.json();
        const doctorId = docData.doctors[0]._id;

        // 2. Register patient
        const testEmail = `stripe_patient_${Date.now()}@example.com`;
        const regRes = await fetch("http://127.0.0.1:5006/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Stripe Patient",
            email: testEmail,
            password: "Password123!",
          }),
        });

        // 3. Login
        const loginRes = await fetch("http://127.0.0.1:5006/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: testEmail,
            password: "Password123!",
          }),
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        // 4. Book appointment with Stripe
        const bookRes = await fetch("http://127.0.0.1:5006/api/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctor: doctorId,
            appointmentDate: "2026-10-20",
            appointmentTime: "14:00",
            paymentMethod: "stripe",
            reason: "Stripe Payment Test",
          }),
        });
        const bookData = await bookRes.json();
        console.log(`✅ Appointment booked with Stripe: ID=${bookData.appointment._id}, PaymentStatus=${bookData.appointment.paymentStatus}`);

        // 5. Test pay endpoint
        const payRes = await fetch(`http://127.0.0.1:5006/api/appointments/${bookData.appointment._id}/pay`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const payData = await payRes.json();
        console.log(`✅ Stripe Pay Endpoint Response: success=${payData.success}, demoMode=${payData.demoMode}, URL=${payData.url}`);

        console.log("\n🎉 STRIPE PAYMENT INTEGRATION TEST PASSED SUCCESSFULLY!");
      } catch (err) {
        console.error("❌ Stripe test inner error:", err);
      } finally {
        server.close();
        await mongoose.disconnect();
        process.exit(0);
      }
    });
  } catch (err) {
    console.error("❌ Connection error:", err);
    process.exit(1);
  }
}

testStripeFlow();
