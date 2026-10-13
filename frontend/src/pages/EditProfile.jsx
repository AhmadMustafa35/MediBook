
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function EditProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const token = localStorage.getItem("medibookToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) return;

        const data = response.data;
        const user = data.user || data.data || data;

        setName(user.name || "");
        setPhone(user.phone || "");
      } catch (err) {
        if (cancelled) return;

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("medibookToken");
          localStorage.removeItem("medibookUser");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message || "Unable to load your profile."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const token = localStorage.getItem("medibookToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/auth/profile",
        {
          name: name.trim(),
          phone: phone.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      const updatedUser = data.user || data.data;

      if (updatedUser && typeof updatedUser === "object") {
        const previousUser = JSON.parse(
          localStorage.getItem("medibookUser") || "{}"
        );

        localStorage.setItem(
          "medibookUser",
          JSON.stringify({ ...previousUser, ...updatedUser })
        );
      } else {
        const previousUser = JSON.parse(
          localStorage.getItem("medibookUser") || "{}"
        );

        localStorage.setItem(
          "medibookUser",
          JSON.stringify({
            ...previousUser,
            name: name.trim(),
            phone: phone.trim(),
          })
        );
      }

      setMessage(data.message || "Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="auth-page">Loading your profile...</main>;
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card-content">
          <span className="hospitals-eyebrow">ACCOUNT SETTINGS</span>
          <h1>Edit your profile</h1>
          <p>Keep your personal information up to date.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <label htmlFor="profile-phone">Phone number</label>
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
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
              disabled={saving}
            >
              {saving ? "Saving changes..." : "Save changes"}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/dashboard">← Back to dashboard</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default EditProfile;