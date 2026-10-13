
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setSuccess(
        response.data.message || "Account created successfully!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <section className="auth-layout">
        <aside className="auth-showcase">
          <div className="showcase-badge">
            <span className="status-dot" />
            YOUR HEALTH, OUR PRIORITY
          </div>

          <h1>
            Better care
            <br />
            starts <span>here.</span>
          </h1>

          <p className="showcase-description">
            Find trusted doctors, book appointments, and
            manage your healthcare journey — all in one place.
          </p>

          <div className="showcase-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong>Trusted professionals</strong>
                <p>Discover verified healthcare providers.</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">◷</span>
              <div>
                <strong>Effortless scheduling</strong>
                <p>Find a time that works for you.</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">♡</span>
              <div>
                <strong>Care made simple</strong>
                <p>Keep your appointments organized.</p>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <span className="footer-line" />
            <span>Healthcare, with you at every step.</span>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-card-heading">
            <span className="form-eyebrow">GET STARTED — IT'S FREE</span>
            <h2>Create your account</h2>
            <p>Join MediBook and take control of your care.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Umer Ahmed"
                autoComplete="name"
                minLength={2}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>

              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <span className="field-hint">
                Use at least 6 characters.
              </span>
            </div>

            <label className="terms-row">
              <input type="checkbox" required />
              <span>
                I agree to the <a href="#terms">Terms of Service</a>{" "}
                and <a href="#privacy">Privacy Policy</a>.
              </span>
            </label>

            {error && (
              <div className="form-message error-message" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="form-message success-message" role="status">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>

            <div className="form-divider">
              <span />
              <p>ALREADY WITH MEDIBOOK?</p>
              <span />
            </div>

            <p className="auth-switch">
              Have an account? <Link to="/login">Log in</Link>
            </p>
          </form>

          <p className="security-note">
            <span aria-hidden="true">♧</span>
            Your information is handled securely.
          </p>
        </section>
      </section>
    </main>
  );
}

export default Register;