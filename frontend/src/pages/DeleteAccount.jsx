
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function DeleteAccount() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (confirmation !== "DELETE") {
      setError('Please type "DELETE" to confirm account deletion.');
      return;
    }

    const token = localStorage.getItem("medibookToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      await api.delete("/auth/account", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { password },
      });

      localStorage.removeItem("medibookToken");
      localStorage.removeItem("medibookUser");

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card-content">
          <span className="hospitals-eyebrow">ACCOUNT SETTINGS</span>
          <h1>Delete your account</h1>

          <p>
            This action may permanently remove your account and associated
            information. Make sure you understand the consequences before
            continuing.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="delete-password">Current password</label>
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <label htmlFor="delete-confirmation">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirmation"
              type="text"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="DELETE"
              required
            />

            {error && (
              <p className="form-message error-message" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="delete-account-button"
              disabled={loading}
            >
              {loading ? "Deleting account..." : "Permanently delete account"}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/dashboard">Cancel and return to dashboard</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default DeleteAccount;