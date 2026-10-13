const nodemailer = require("nodemailer");

const sendAppointmentEmail = async ({
  email,
  patientName,
  doctorName,
  date,
  startTime,
  endTime,
}) => {
  // If SMTP is not configured or using placeholders, log and skip gracefully
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    process.env.SMTP_USER.includes("yourgmail@gmail.com")
  ) {
    console.log(`[Email Notice] Skip sending SMTP email to ${email} (SMTP credentials not configured)`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MediBook" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "MediBook Appointment Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>MediBook Appointment Confirmed</h2>
          <p>Hello ${patientName},</p>
          <p>Your appointment has been successfully booked.</p>
          <h3>Appointment Details</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p>Thank you for using MediBook.</p>
        </div>
      `,
    });

    console.log("Appointment email sent successfully to", email);
  } catch (error) {
    console.error("Email sending error:", error.message);
  }
};

module.exports = {
  sendAppointmentEmail,
};