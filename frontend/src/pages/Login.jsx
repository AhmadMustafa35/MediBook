
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const { token, user } = response.data;

      if (!token) {
        setError("Login succeeded, but the server did not return a token.");
        return;
      }

      localStorage.setItem("medibookToken", token);

      if (user) {
        localStorage.setItem("medibookUser", JSON.stringify(user));
      }

      navigate("/dashboard");
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
            Welcome
            <br />
            <span>back.</span>
          </h1>

          <p className="showcase-description">
            Your healthcare journey continues here.
            Sign in to manage appointments and stay connected
            with your healthcare providers.
          </p>

          <div className="showcase-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong>Your appointments</strong>
                <p>Keep track of your upcoming visits.</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">◷</span>
              <div>
                <strong>Easy scheduling</strong>
                <p>Manage your healthcare on your schedule.</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">♡</span>
              <div>
                <strong>Care made simple</strong>
                <p>Your healthcare journey, all in one place.</p>
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
            <span className="form-eyebrow">WELCOME BACK</span>
            <h2>Sign in to MediBook</h2>
            <p>Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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
              <div className="login-password-heading">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
            </div>

            {error && (
              <div className="form-message error-message" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>

            <div className="form-divider">
              <span />
              <p>NEW TO MEDIBOOK?</p>
              <span />
            </div>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">Create account</Link>
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

export default Login;