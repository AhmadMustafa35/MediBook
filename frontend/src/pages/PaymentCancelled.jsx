import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./PaymentResult.css";

function PaymentCancelled() {
  const [params] = useSearchParams();
  const appointmentId = params.get("appointment_id");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="pay-result-page">
      <div className={`pay-result-card ${visible ? "pay-result-visible" : ""}`}>
        {/* Icon */}
        <div className="pay-result-icon pay-result-cancel-icon" aria-hidden="true">
          <svg viewBox="0 0 52 52" className="pay-x-mark">
            <circle
              className="pay-x-circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              className="pay-x-path"
              fill="none"
              d="M16 16 36 36 M36 16 16 36"
            />
          </svg>
        </div>

        <div className="pay-result-content">
          <span className="pay-result-eyebrow pay-result-eyebrow-warn">
            PAYMENT CANCELLED
          </span>
          <h1>Payment Not Completed</h1>
          <p>
            Your payment was cancelled and no charge was made. Your appointment
            is still saved — you can complete the payment anytime from your
            dashboard.
          </p>

          <div className="pay-result-notice">
            <span>ℹ️</span>
            <span>
              Your appointment slot is reserved for 24 hours. Please complete
              payment to confirm your booking.
            </span>
          </div>

          <div className="pay-result-actions">
            <Link
              to="/dashboard"
              id="pay-cancel-dashboard-btn"
              className="pay-result-primary"
            >
              Return to Dashboard
            </Link>
            <Link to="/doctors" className="pay-result-secondary">
              Browse Doctors
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PaymentCancelled;
