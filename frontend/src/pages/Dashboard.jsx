import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("medibookUser") || "null");
    } catch {
      return null;
    }
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [payingId, setPayingId] = useState(null);

  // Automatically verify payment if redirected back to dashboard with payment=success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appointmentId = params.get("appointment_id");
    const isSuccess = params.get("payment") === "success";

    if (isSuccess && appointmentId) {
      const token =
        localStorage.getItem("medibookToken") || localStorage.getItem("token");
      if (token) {
        api.post(
          `/appointments/${appointmentId}/verify-payment`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
          .then(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            setRetryCount((c) => c + 1);
          })
          .catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const token = localStorage.getItem("medibookToken") || localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const results = await Promise.allSettled([
          api.get("/auth/me", config),
          api.get("/appointments/my", config),
        ]);

        if (cancelled) return;

        const profileResult = results[0];
        const appointmentsResult = results[1];

        if (profileResult.status === "fulfilled") {
          const responseData = profileResult.value.data;
          const currentUser =
            responseData.user || responseData.data || responseData;

          setUser(currentUser);

          localStorage.setItem(
            "medibookUser",
            JSON.stringify(currentUser)
          );
        } else {
          const status = profileResult.reason?.response?.status;

          if (status === 401 || status === 403) {
            localStorage.removeItem("medibookToken");
            localStorage.removeItem("token");
            localStorage.removeItem("medibookUser");
            navigate("/login");
            return;
          }

          setError(
            profileResult.reason?.response?.data?.message ||
              "Unable to load your profile."
          );
        }

        if (appointmentsResult.status === "fulfilled") {
          const responseData = appointmentsResult.value.data;

          const list = Array.isArray(responseData)
            ? responseData
            : responseData.appointments ||
              responseData.data ||
              [];

          setAppointments(Array.isArray(list) ? list : []);
        } else {
          const status =
            appointmentsResult.reason?.response?.status;

          if (status === 401 || status === 403) {
            localStorage.removeItem("medibookToken");
            localStorage.removeItem("token");
            localStorage.removeItem("medibookUser");
            navigate("/login");
            return;
          }

          setError((previousError) =>
            previousError
              ? `${previousError} Appointments could not be loaded.`
              : "Your profile loaded, but appointments could not be loaded."
          );
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong while loading your dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [navigate, retryCount]);

  const handleLogout = async () => {
    const token = localStorage.getItem("medibookToken") || localStorage.getItem("token");

    try {
      setLoggingOut(true);

      if (token) {
        await api.post(
          "/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error(
        "Logout request failed:",
        err.response?.data?.message || err.message
      );
    } finally {
      localStorage.removeItem("medibookToken");
      localStorage.removeItem("token");
      localStorage.removeItem("medibookUser");
      navigate("/login", { replace: true });
    }
  };

  const handlePayAppointment = async (appointmentId) => {
    const token =
      localStorage.getItem("medibookToken") || localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPayingId(appointmentId);
      const res = await api.post(
        `/appointments/${appointmentId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const url = res.data?.url || res.data?.checkoutUrl;
      if (url) {
        window.location.href = url;
      } else {
        navigate(`/checkout/${appointmentId}`);
      }
    } catch (err) {
      navigate(`/checkout/${appointmentId}`);
    } finally {
      setPayingId(null);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment? If you paid, a full refund will be issued.")) return;
    const token = localStorage.getItem("medibookToken") || localStorage.getItem("token");
    if (!token) return;
    try {
      setCancellingId(appointmentId);
      setCancelSuccess("");
      setError("");
      await api.put(`/appointments/${appointmentId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) =>
        prev.map((a) =>
          String(a._id) === String(appointmentId)
            ? { ...a, status: "cancelled" }
            : a
        )
      );
      setCancelSuccess("Appointment cancelled. Refund (if applicable) will be processed within 5-7 business days.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRetryCount((count) => count + 1);
  };

  const getAppointmentStatus = (appointment) => {
    return (
      appointment.status ||
      appointment.appointmentStatus ||
      "pending"
    );
  };

  const getDoctorName = (appointment) => {
    const doctor =
      appointment.doctorId ||
      appointment.doctor ||
      appointment.doctorDetails;

    if (doctor && typeof doctor === "object") {
      return (
        doctor.name ||
        doctor.fullName ||
        doctor.user?.name ||
        "Doctor"
      );
    }

    return appointment.doctorName || "Doctor";
  };

  const getHospitalName = (appointment) => {
    const hospital =
      appointment.hospitalId ||
      appointment.hospital;

    if (hospital && typeof hospital === "object") {
      return hospital.name || "Hospital not specified";
    }

    return appointment.hospitalName || "Hospital not specified";
  };

  const getAppointmentDate = (appointment) => {
    const date =
      appointment.date ||
      appointment.appointmentDate ||
      appointment.startTime;

    if (!date) return "Date not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const normalizedStatus = (appointment) =>
    getAppointmentStatus(appointment).toLowerCase();

  const upcomingAppointments = appointments.filter((appointment) => {
    const status = normalizedStatus(appointment);
    const dateValue =
      appointment.date ||
      appointment.appointmentDate ||
      appointment.startTime;

    const appointmentDate = dateValue ? new Date(dateValue) : null;

    return (
      !["cancelled", "canceled", "completed", "rejected"].includes(
        status
      ) &&
      (!appointmentDate ||
        Number.isNaN(appointmentDate.getTime()) ||
        appointmentDate >= new Date())
    );
  });

  const displayName = user?.name || user?.fullName || "there";
  const role = user?.role || "patient";

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-message">
            <p>Loading your MediBook dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <span className="hospitals-eyebrow">
              MEDIBOOK ACCOUNT
            </span>

            <h1>Welcome back, {displayName}!</h1>

            <p>
              Manage your appointments and personal information in
              one place.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </header>


        {error && (
          <div className="dashboard-message dashboard-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>Reload dashboard</button>
          </div>
        )}

        {cancelSuccess && (
          <div className="dashboard-message" role="status" style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", fontSize: "14px" }}>
            ✅ {cancelSuccess}
          </div>
        )}

        <section className="dashboard-stats">
          <article className="dashboard-stat-card">
            <span>Total appointments</span>
            <strong>{appointments.length}</strong>
            <p>Appointments in your account</p>
          </article>

          <article className="dashboard-stat-card">
            <span>Upcoming appointments</span>
            <strong>{upcomingAppointments.length}</strong>
            <p>Not yet completed or cancelled</p>
          </article>

          <article className="dashboard-stat-card">
            <span>Account type</span>
            <strong className="dashboard-role">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </strong>
            <p>Your MediBook account role</p>
          </article>
        </section>

        <section className="dashboard-main-grid">
          <div className="dashboard-panel dashboard-appointments">
            <div className="dashboard-panel-heading">
              <div>
                <span className="hospitals-eyebrow">
                  YOUR SCHEDULE
                </span>
                <h2>My appointments</h2>
              </div>

              <Link to="/doctors">Book an appointment +</Link>
            </div>

            {appointments.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon" aria-hidden="true">
                  +
                </div>

                <h3>No appointments yet</h3>

                <p>
                  Find a doctor and book your first appointment through
                  MediBook.
                </p>

                <Link to="/doctors" className="dashboard-primary-link">
                  Find a doctor
                </Link>
              </div>
            ) : (
              <div className="dashboard-appointment-list">
                {appointments.map((appointment, index) => {
                  const appointmentId =
                    appointment._id ||
                    appointment.id ||
                    `appointment-${index}`;

                  const status = getAppointmentStatus(appointment);
                  const isPaid = appointment.paymentStatus === "paid";
                  const isCash = appointment.paymentMethod === "cash";

                  return (
                    <article
                      className="dashboard-appointment-card"
                      key={appointmentId}
                    >
                      <div className="dashboard-appointment-icon" aria-hidden="true">
                        +
                      </div>

                      <div className="dashboard-appointment-info">
                        <h3>{getDoctorName(appointment)}</h3>

                        <p>{getHospitalName(appointment)}</p>

                        <span>
                          {getAppointmentDate(appointment)}
                          {appointment.time
                            ? ` · ${appointment.time}`
                            : ""}
                        </span>

                        <div style={{ marginTop: "4px", fontSize: "0.85rem" }}>
                          <span style={{ fontWeight: 600, color: isPaid ? "#16a34a" : "#d97706" }}>
                            {isPaid ? "✓ Paid via Stripe" : isCash ? "💵 Pay at Clinic" : "💳 Payment Pending"}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                        <span
                          className={`dashboard-status status-${String(status).toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {status}
                        </span>

                        {!isPaid && !isCash && status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => handlePayAppointment(appointment._id)}
                            disabled={payingId === appointment._id}
                            className="dashboard-pay-btn"
                          >
                            {payingId === appointment._id ? "Redirecting…" : "Pay Now 💳"}
                          </button>
                        )}

                        {status !== "cancelled" && status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => handleCancelAppointment(appointment._id)}
                            disabled={cancellingId === appointment._id}
                            style={{
                              background: "none",
                              border: "1.5px solid #fca5a5",
                              color: "#ef4444",
                              borderRadius: "8px",
                              padding: "5px 12px",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "background 180ms",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                          >
                            {cancellingId === appointment._id ? "Cancelling…" : "Cancel ✕"}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="dashboard-panel dashboard-profile">
            <div className="dashboard-panel-heading">
              <div>
                <span className="hospitals-eyebrow">
                  PERSONAL INFORMATION
                </span>
                <h2>My profile</h2>
              </div>
            </div>

            <div className="dashboard-profile-avatar" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="dashboard-profile-details">
              <div>
                <span>Full name</span>
                <strong>{user?.name || user?.fullName || "Not provided"}</strong>
              </div>

              <div>
                <span>Email address</span>
                <strong>{user?.email || "Not provided"}</strong>
              </div>

              <div>
                <span>Phone number</span>
                <strong>{user?.phone || "Not provided"}</strong>
              </div>

              <div>
                <span>Account role</span>
                <strong>{role}</strong>
              </div>
            </div>

            <div className="dashboard-profile-actions">
              <Link
                to="/edit-profile"
                className="dashboard-primary-link"
              >
                Edit profile
              </Link>

              <Link
                to="/change-password"
                className="dashboard-secondary-link"
              >
                Change password
              </Link>

              <Link
                to="/delete-account"
                className="dashboard-secondary-link"
                style={{ color: "#e11d48", marginTop: "4px" }}
              >
                Delete account
              </Link>
            </div>
          </aside>
        </section>

        <section className="dashboard-bottom-banner">
          <div>
            <span className="hospitals-eyebrow">
              YOUR HEALTH MATTERS
            </span>

            <h2>Need to see a doctor?</h2>

            <p>
              Explore available healthcare professionals and plan your
              next visit.
            </p>
          </div>

          <Link to="/doctors" className="dashboard-primary-link">
            Explore doctors →
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;