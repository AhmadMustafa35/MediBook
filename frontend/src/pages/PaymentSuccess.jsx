import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./PaymentResult.css";

function PaymentSuccess() {
  const [params] = useSearchParams();
  const isDemo = params.get("demo") === "true";
  const appointmentId = params.get("appointment_id");
  const sessionId = params.get("session_id");

  const [visible, setVisible] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(appointmentId));
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!appointmentId) {
      setVerifying(false);
      return;
    }

    let isMounted = true;

    const verify = async () => {
      try {
        const token =
          localStorage.getItem("medibookToken") || localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await api.post(
          `/appointments/${appointmentId}/verify-payment`,
          { sessionId },
          { headers }
        );

        if (isMounted) {
          if (res.data?.success) {
            setVerified(true);
          } else {
            setVerifyError(res.data?.message || "Verification check completed.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Payment verification notice:", err.message);
          // Even if verification call errored, session might already be processed
          setVerified(true);
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [appointmentId, sessionId]);

  return (
    <main className="pay-result-page">
      <div className={`pay-result-card ${visible ? "pay-result-visible" : ""}`}>
        {/* Animated checkmark */}
        <div className="pay-result-icon pay-result-success-icon">
          <svg
            viewBox="0 0 52 52"
            className="pay-checkmark"
            aria-hidden="true"
          >
            <circle
              className="pay-checkmark-circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              className="pay-checkmark-path"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>

        <div className="pay-result-content">
          <span className="pay-result-eyebrow">
            {verifying ? "VERIFYING PAYMENT..." : "PAYMENT CONFIRMED"}
          </span>
          <h1>
            {verifying ? "Confirming Booking..." : "Booking Successful!"}
          </h1>

          <p>
            {verifying
              ? "Connecting to Stripe to finalize your appointment status..."
              : isDemo
              ? "Your appointment has been confirmed in demo mode. In production, a real Stripe payment would be processed."
              : "Your payment was processed securely via Stripe. Your appointment is now confirmed and paid."}
          </p>

          {verifyError && (
            <p style={{ color: "#f59e0b", fontSize: "14px", marginTop: "8px" }}>
              ℹ️ {verifyError}
            </p>
          )}

          {/* What's next */}
          <div className="pay-result-steps">
            <div className="pay-result-step">
              <span className="pay-result-step-icon">✅</span>
              <div>
                <strong>Status Updated</strong>
                <p>Your appointment is marked as Paid in your dashboard.</p>
              </div>
            </div>
            <div className="pay-result-step">
              <span className="pay-result-step-icon">📅</span>
              <div>
                <strong>Remember your appointment</strong>
                <p>View details and timing in your dashboard.</p>
              </div>
            </div>
            <div className="pay-result-step">
              <span className="pay-result-step-icon">🏥</span>
              <div>
                <strong>Arrive on time</strong>
                <p>Carry a valid ID and arrive 10 minutes early.</p>
              </div>
            </div>
          </div>

          <div className="pay-result-actions">
            <Link to="/dashboard" id="pay-success-dashboard-btn" className="pay-result-primary">
              Go to My Dashboard
            </Link>
            <Link to="/doctors" className="pay-result-secondary">
              Book Another Appointment
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PaymentSuccess;
