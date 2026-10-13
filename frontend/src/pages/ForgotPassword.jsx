
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setMessage(
        response.data?.message ||
          "If an account exists for this email, reset instructions will be sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card-content">
          <span className="hospitals-eyebrow">MEDIBOOK ACCOUNT</span>
          <h1>Forgot your password?</h1>
          <p>
            Enter the email address associated with your account to request
            password reset instructions.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="forgot-email">Email address</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            {error && (
              <p className="form-message error-message" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="form-message success-message" role="status">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Sending request..." : "Request password reset"}
            </button>
          </form>

          <p className="auth-footer">
            Remembered your password? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;