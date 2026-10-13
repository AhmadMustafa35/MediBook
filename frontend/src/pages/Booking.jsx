import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getDoctorImage, FALLBACK_DOCTOR_IMAGE } from "../utils/imageHelpers";
import "./Booking.css";

function Booking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    paymentMethod: "stripe",
  });

  // Calculate today's date using local time.
  const today = new Date();

  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  // Fetch doctor information.
  useEffect(() => {
    if (!doctorId) {
      return;
    }

    let cancelled = false;

    const fetchDoctor = async () => {
      try {
        const response = await api.get(`/doctors/${doctorId}`);
        const result = response.data;

        const doctorData =
          result.doctor || result.data || result;

        if (!doctorData || !doctorData._id) {
          throw new Error("Doctor information was not found.");
        }

        if (!cancelled) {
          setDoctor(doctorData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load doctor details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDoctor();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  // Handle changes in form fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit the appointment request.
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("medibookToken") || localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/booking/${doctorId}`,
        },
      });
      return;
    }

    if (!formData.appointmentDate || !formData.appointmentTime) {
      setError("Please select an appointment date and time.");
      return;
    }

    if (formData.appointmentDate < localToday) {
      setError("Please select today or a future date.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/appointments", {
        doctor: doctorId,
        doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason.trim(),
        paymentMethod: formData.paymentMethod,
      });

      if (response.data?.success === false) {
        throw new Error(
          response.data.message ||
            "Unable to book your appointment."
        );
      }

      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
        return;
      }

      setSuccess(
        response.data?.message ||
          "Appointment booked successfully!"
      );

      setFormData({
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        paymentMethod: "stripe",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to book appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle a missing doctor ID without setting state in an effect.
  if (!doctorId) {
    return (
      <main className="booking-page">
        <div className="booking-message booking-error">
          Doctor ID is missing.
          <p>
            <Link to="/doctors">Back to doctors</Link>
          </p>
        </div>
      </main>
    );
  }

  // Loading state.
  if (loading) {
    return (
      <main className="booking-page">
        <div className="booking-message">
          Loading doctor details...
        </div>
      </main>
    );
  }

  // Doctor not found or API request failed.
  if (!doctor) {
    return (
      <main className="booking-page">
        <div className="booking-message booking-error">
          {error || "Doctor not found."}
          <p>
            <Link to="/doctors">Back to doctors</Link>
          </p>
        </div>
      </main>
    );
  }

  const doctorName =
    doctor.user?.name || doctor.name || "Doctor";

  const hospitalName =
    typeof doctor.hospital === "object"
      ? doctor.hospital?.name
      : "";

  const doctorPhoto = getDoctorImage(doctor);

  return (
    <main className="booking-page">
      <div className="booking-container">
        {/* Page heading */}
        <div className="booking-heading">
          <span className="booking-eyebrow">
            MEDIBOOK APPOINTMENTS
          </span>

          <h1>Book Your Appointment</h1>

          <p>
            Choose a convenient date and time to request your
            consultation.
          </p>
        </div>

        <div className="booking-layout">
          {/* Selected doctor card */}
          <section className="booking-doctor-card">
            <div className="booking-doctor-image">
              <img
                src={doctorPhoto}
                alt={doctorName}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_DOCTOR_IMAGE;
                }}
              />
            </div>

            <div className="booking-doctor-info">
              <span className="booking-label">
                YOUR SELECTED DOCTOR
              </span>

              <h2>{doctorName}</h2>

              <p className="booking-specialty">
                {doctor.specialization || "Medical Specialist"}
              </p>

              {doctor.qualification && (
                <p>{doctor.qualification}</p>
              )}

              {doctor.experience !== undefined && (
                <p>
                  {doctor.experience} years of experience
                </p>
              )}

              {hospitalName && (
                <p className="booking-hospital">
                  <span>Hospital</span>
                  {hospitalName}
                </p>
              )}

              <div className="booking-fee">
                <span>Consultation fee</span>

                <strong>
                  PKR{" "}
                  {Number(doctor.fee || 0).toLocaleString()}
                </strong>
              </div>
            </div>
          </section>

          {/* Appointment form */}
          <section className="booking-form-card">
            <h2>Appointment Details</h2>

            <p className="booking-form-subtitle">
              Fill in the details below to continue.
            </p>

            {error && (
              <div
                className="booking-alert booking-alert-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="booking-alert booking-alert-success"
                role="status"
              >
                {success}

                <p>
                  <Link to="/dashboard">
                    View your dashboard
                  </Link>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Appointment date */}
              <div className="booking-field">
                <label htmlFor="appointmentDate">
                  Appointment Date
                </label>

                <input
                  id="appointmentDate"
                  type="date"
                  name="appointmentDate"
                  min={localToday}
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Appointment time */}
              <div className="booking-field">
                <label htmlFor="appointmentTime">
                  Preferred Time
                </label>

                <select
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>

              {/* Reason for appointment */}
              <div className="booking-field">
                <label htmlFor="reason">
                  Reason for Visit
                  <span className="booking-optional">
                    {" "}
                    (optional)
                  </span>
                </label>

                <textarea
                  id="reason"
                  name="reason"
                  rows="4"
                  maxLength="500"
                  placeholder="Briefly describe why you need a consultation..."
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>

              {/* Payment Method */}
              <div className="booking-field">
                <label htmlFor="paymentMethod">
                  Payment Method
                </label>

                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="stripe">💳 Pay Online via Stripe (Card)</option>
                  <option value="cash">💵 Pay at Clinic (Cash)</option>
                </select>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="booking-submit"
                disabled={submitting}
              >
                {submitting
                  ? "Processing..."
                  : formData.paymentMethod === "stripe"
                  ? "Proceed to Stripe Payment →"
                  : "Confirm Appointment"}
              </button>

              <p className="booking-note">
                Your request is subject to the availability and
                confirmation rules configured by the clinic.
              </p>
            </form>
          </section>
        </div>

        {/* Back link */}
        <Link
          to={`/doctors/${doctorId}`}
          className="booking-back-link"
        >
          ← Back to doctor details
        </Link>
      </div>
    </main>
  );
}

export default Booking;
