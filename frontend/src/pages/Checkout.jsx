import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { getDoctorImage, FALLBACK_DOCTOR_IMAGE } from "../utils/imageHelpers";
import "./Checkout.css";

function Checkout() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("medibookToken") || localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    let cancelled = false;

    const init = async () => {
      try {
        // Fetch appointments to find this appointment
        const res = await api.get("/appointments/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.appointments || res.data.data || [];

        const found = list.find((a) => String(a._id) === String(appointmentId));
        if (!found) {
          setError("Appointment not found.");
          setLoading(false);
          return;
        }

        if (cancelled) return;
        setAppointment(found);

        // If already paid, stop here
        if (found.paymentStatus === "paid") {
          setLoading(false);
          return;
        }

        // Request Stripe Hosted Checkout URL
        const payRes = await api.post(
          `/appointments/${appointmentId}/pay`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (cancelled) return;

        const hostedUrl = payRes.data?.url || payRes.data?.checkoutUrl;

        if (hostedUrl) {
          setCheckoutUrl(hostedUrl);
        } else if (payRes.data?.demoMode) {
          navigate(`/payment/success?demo=true&appointment_id=${appointmentId}`);
        } else {
          setError("Unable to initialize Stripe payment. Please try again.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Failed to initialize Stripe checkout. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [appointmentId, navigate, token]);

  const handleProceedToStripe = () => {
    if (checkoutUrl) {
      setRedirecting(true);
      window.location.href = checkoutUrl;
    }
  };

  const getDoctorName = (appt) => {
    const doc = appt?.doctor || appt?.doctorId;
    return (
      (typeof doc === "object" && (doc?.user?.name || doc?.name)) ||
      "Your Doctor"
    );
  };

  const getHospitalName = (appt) => {
    const h = appt?.hospital || appt?.hospitalId;
    return (typeof h === "object" && h?.name) || "";
  };

  const formatDate = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d)
      ? s
      : d.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${
      h >= 12 ? "PM" : "AM"
    }`;
  };

  if (loading) {
    return (
      <main className="checkout-page">
        <div className="checkout-loading">
          <div className="checkout-spinner" />
          <p>Preparing Stripe Hosted Checkout…</p>
        </div>
      </main>
    );
  }

  if (error && !appointment) {
    return (
      <main className="checkout-page">
        <div className="checkout-error-state">
          <span className="checkout-error-icon">⚠️</span>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <Link to="/dashboard" className="checkout-btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const doc = appointment?.doctor || appointment?.doctorId || {};
  const fee = Number(doc.fee || appointment?.amountPaid || 0);
  const specialization = doc.specialization || "Medical Specialist";
  const doctorPhoto = getDoctorImage(doc);
  const doctorName = getDoctorName(appointment);
  const hospitalName = getHospitalName(appointment);
  const isPaid = appointment?.paymentStatus === "paid";
  const appointmentDate = appointment?.date || appointment?.appointmentDate;
  const startTime = appointment?.startTime || appointment?.appointmentTime;

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <Link to="/dashboard" className="checkout-back">
            ← Back to Dashboard
          </Link>
          <div className="checkout-secure-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            Secure Checkout · SSL Encrypted
          </div>
        </div>

        <div className="checkout-layout">
          {/* ── Left: Order Summary ── */}
          <div className="checkout-summary">
            <div className="checkout-summary-header">
              <span className="checkout-eyebrow">ORDER SUMMARY</span>
              <h1>Confirm &amp; Pay</h1>
              <p>Review your appointment details before proceeding to Stripe.</p>
            </div>

            <div className="checkout-doctor-card">
              <img
                src={doctorPhoto}
                alt={doctorName}
                className="checkout-doctor-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_DOCTOR_IMAGE;
                }}
              />
              <div className="checkout-doctor-info">
                <span className="checkout-doctor-label">CONSULTING WITH</span>
                <h2>{doctorName}</h2>
                <p className="checkout-doctor-spec">{specialization}</p>
                {hospitalName && (
                  <p className="checkout-doctor-hospital">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    {hospitalName}
                  </p>
                )}
              </div>
            </div>

            <div className="checkout-detail-rows">
              <div className="checkout-detail-row">
                <span className="checkout-detail-icon">📅</span>
                <div>
                  <span className="checkout-detail-label">Appointment Date</span>
                  <strong>{formatDate(appointmentDate)}</strong>
                </div>
              </div>
              {startTime && (
                <div className="checkout-detail-row">
                  <span className="checkout-detail-icon">🕐</span>
                  <div>
                    <span className="checkout-detail-label">Time Slot</span>
                    <strong>{formatTime(startTime)}</strong>
                  </div>
                </div>
              )}
              {appointment?.reason && (
                <div className="checkout-detail-row">
                  <span className="checkout-detail-icon">📝</span>
                  <div>
                    <span className="checkout-detail-label">Reason for Visit</span>
                    <strong>{appointment.reason}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="checkout-price-breakdown">
              <div className="checkout-price-row">
                <span>Consultation Fee</span>
                <span>PKR {fee.toLocaleString()}</span>
              </div>
              <div className="checkout-price-row">
                <span>Processing Fee</span>
                <span className="checkout-free">FREE</span>
              </div>
              <div className="checkout-price-total">
                <span>Total Due</span>
                <strong>PKR {fee.toLocaleString()}</strong>
              </div>
            </div>

            <div className="checkout-trust">
              <div className="checkout-trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="checkout-trust-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>PCI DSS Compliant</span>
              </div>
              <div className="checkout-trust-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Instant Confirmation</span>
              </div>
            </div>
          </div>

          {/* ── Right: Payment Panel ── */}
          <div className="checkout-payment-panel">
            <div className="checkout-payment-header">
              <span className="checkout-eyebrow">STRIPE HOSTED CHECKOUT</span>
              <h2>Pay Securely with Stripe</h2>
              <p>You will complete payment on Stripe's official encrypted page.</p>
            </div>

            {/* Stripe logo card */}
            <div className="checkout-stripe-card">
              <div className="checkout-stripe-logo">
                <svg viewBox="0 0 60 25" fill="none" height="22">
                  <path
                    d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.23c0-1.85-1.07-2.58-2.06-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 2.98-1.41 3.54-1.22v3.79c-.31-.05-1.49-.29-2.24.06zm-9.5 4.23c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v4.44zM4.1 18.48c-1.08 0-2.11-.28-2.86-.68l.01 5.4-4.12.87.01-18.2 3.7-.05.12 1.19C1.84 5.98 3.16 5.3 4.53 5.3c2.9 0 5.62 2.6 5.62 7.4-.01 5.24-2.72 7.78-6.05 7.78zm.85-9.54c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84z"
                    fill="#635BFF"
                  />
                </svg>
              </div>
              <div className="checkout-stripe-info">
                <p>Hosted by Stripe</p>
                <p className="checkout-stripe-sub">Credit / Debit Card · Apple Pay · Google Pay</p>
              </div>
              <div className="checkout-stripe-cards">
                <span className="checkout-card-badge visa">VISA</span>
                <span className="checkout-card-badge mc">MC</span>
                <span className="checkout-card-badge amex">AMEX</span>
              </div>
            </div>

            {error && (
              <div className="checkout-inline-error" role="alert">
                ⚠️ {error}
              </div>
            )}

            {isPaid ? (
              <div className="checkout-paid-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This appointment has already been paid
              </div>
            ) : (
              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  id="checkout-pay-btn"
                  className="checkout-pay-btn"
                  onClick={handleProceedToStripe}
                  disabled={!checkoutUrl || redirecting}
                >
                  {redirecting ? (
                    <>
                      <span className="checkout-btn-spinner" />
                      Redirecting to Stripe…
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                      </svg>
                      Proceed to Stripe Checkout →
                    </>
                  )}
                </button>

                <p className="checkout-disclaimer">
                  You will be securely redirected to Stripe's hosted payment page to enter your card details. MediBook never stores your card information.
                </p>
              </div>
            )}

            {!isPaid && (
              <p className="checkout-cancel-link">
                Not ready?{" "}
                <Link to="/dashboard">Pay later from your Dashboard</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
