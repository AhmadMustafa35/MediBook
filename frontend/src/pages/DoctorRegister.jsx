import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./DoctorRegister.css";

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Gynecologist",
  "Oncologist",
  "Psychiatrist",
  "ENT Specialist",
  "Ophthalmologist",
  "Urologist",
  "Endocrinologist",
  "Gastroenterologist",
  "Pulmonologist",
  "Radiologist",
  "Nephrologist",
  "Rheumatologist",
  "Dentist",
  "Other",
];

const STEPS = ["Account", "Professional Info", "Review & Submit"];

function DoctorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isLoggedIn = !!(
    localStorage.getItem("medibookToken") || localStorage.getItem("token")
  );

  const [form, setForm] = useState({
    // Step 0 — Account (only if not logged in)
    name: "",
    email: "",
    password: "",
    // Step 1 — Professional
    hospital: "",
    specialization: "",
    qualification: "",
    experience: "",
    fee: "",
    bio: "",
    phone: "",
  });

  useEffect(() => {
    api
      .get("/hospitals")
      .then((res) => {
        const list = res.data.hospitals || res.data.data || res.data || [];
        setHospitals(Array.isArray(list) ? list : []);
      })
      .catch(() => setHospitals([]))
      .finally(() => setHospitalsLoading(false));

    // If logged in, skip to step 1
    if (isLoggedIn) setStep(1);
  }, [isLoggedIn]);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) return "Full name is required.";
      if (!form.email.trim()) return "Email is required.";
      if (form.password.length < 6) return "Password must be at least 6 characters.";
    }
    if (step === 1) {
      if (!form.hospital) return "Please select a hospital.";
      if (!form.specialization) return "Please select your specialization.";
      if (!form.qualification.trim()) return "Qualification is required.";
      if (!form.fee || Number(form.fee) <= 0) return "Please enter a valid consultation fee.";
    }
    return null;
  };

  const handleNext = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }

    // If on account step, register the user first
    if (step === 0) {
      setSubmitting(true);
      try {
        const res = await api.post("/auth/register", {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: "doctor",
        });
        // Auto-login
        const loginRes = await api.post("/auth/login", {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });
        const { token, user } = loginRes.data;
        localStorage.setItem("medibookToken", token);
        localStorage.setItem("medibookUser", JSON.stringify(user));
        setStep(1);
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(isLoggedIn ? 1 : 0, s - 1));
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/doctors/register", {
        hospital: form.hospital,
        specialization: form.specialization,
        qualification: form.qualification.trim(),
        experience: Number(form.experience) || 0,
        fee: Number(form.fee),
        bio: form.bio.trim(),
        phone: form.phone.trim(),
      });

      navigate("/doctor-dashboard?registered=true");
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedHospital = hospitals.find((h) => h._id === form.hospital);

  return (
    <main className="dreg-page">
      {/* Background decoration */}
      <div className="dreg-bg-circle dreg-bg-circle-1" />
      <div className="dreg-bg-circle dreg-bg-circle-2" />

      <div className="dreg-container">
        {/* Header */}
        <div className="dreg-header">
          <Link to="/" className="dreg-back">← Back to Home</Link>
          <div className="dreg-badge">
            <span className="dreg-badge-dot" />
            Join as a Doctor
          </div>
        </div>

        {/* Hero */}
        <div className="dreg-hero">
          <h1>
            Start Your Practice <span>on MediBook</span>
          </h1>
          <p>
            Reach thousands of patients looking for trusted healthcare. Set up your professional profile in minutes.
          </p>
        </div>

        {/* Progress stepper */}
        <div className="dreg-stepper">
          {STEPS.map((label, i) => (
            <div key={i} className={`dreg-step ${i === step ? "dreg-step-active" : ""} ${i < step ? "dreg-step-done" : ""}`}>
              <div className="dreg-step-circle">
                {i < step ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span>{label}</span>
              {i < STEPS.length - 1 && <div className="dreg-step-line" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="dreg-card">
          {error && (
            <div className="dreg-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          {/* ─── STEP 0: Account ─── */}
          {step === 0 && (
            <div className="dreg-form-section">
              <div className="dreg-form-heading">
                <span className="dreg-eyebrow">STEP 1</span>
                <h2>Create Your Account</h2>
                <p>Already have an account? <Link to="/login">Log in instead</Link></p>
              </div>

              <div className="dreg-fields">
                <div className="dreg-field">
                  <label htmlFor="dreg-name">Full Name</label>
                  <input id="dreg-name" name="name" type="text" placeholder="Dr. Sarah Khan" value={form.name} onChange={update} required />
                </div>
                <div className="dreg-field">
                  <label htmlFor="dreg-email">Email Address</label>
                  <input id="dreg-email" name="email" type="email" placeholder="doctor@example.com" value={form.email} onChange={update} required />
                </div>
                <div className="dreg-field">
                  <label htmlFor="dreg-password">Password</label>
                  <div className="dreg-password-wrap">
                    <input
                      id="dreg-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={update}
                      required
                    />
                    <button type="button" className="dreg-show-pw" onClick={() => setShowPassword((p) => !p)}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 1: Professional Info ─── */}
          {step === 1 && (
            <div className="dreg-form-section">
              <div className="dreg-form-heading">
                <span className="dreg-eyebrow">{isLoggedIn ? "STEP 1" : "STEP 2"}</span>
                <h2>Professional Details</h2>
                <p>Tell patients about your expertise and where you practice.</p>
              </div>

              <div className="dreg-fields dreg-fields-grid">
                <div className="dreg-field dreg-field-full">
                  <label htmlFor="dreg-hospital">Hospital / Clinic <span className="dreg-req">*</span></label>
                  {hospitalsLoading ? (
                    <div className="dreg-loading-select">Loading hospitals…</div>
                  ) : (
                    <select id="dreg-hospital" name="hospital" value={form.hospital} onChange={update} required>
                      <option value="">— Select your hospital —</option>
                      {hospitals.map((h) => (
                        <option key={h._id} value={h._id}>{h.name} — {h.city}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="dreg-field dreg-field-full">
                  <label htmlFor="dreg-spec">Specialization <span className="dreg-req">*</span></label>
                  <select id="dreg-spec" name="specialization" value={form.specialization} onChange={update} required>
                    <option value="">— Select specialization —</option>
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="dreg-field">
                  <label htmlFor="dreg-qual">Qualification <span className="dreg-req">*</span></label>
                  <input id="dreg-qual" name="qualification" type="text" placeholder="e.g. MBBS, FCPS" value={form.qualification} onChange={update} required />
                </div>

                <div className="dreg-field">
                  <label htmlFor="dreg-exp">Years of Experience</label>
                  <input id="dreg-exp" name="experience" type="number" min="0" max="60" placeholder="e.g. 10" value={form.experience} onChange={update} />
                </div>

                <div className="dreg-field">
                  <label htmlFor="dreg-fee">Consultation Fee (PKR) <span className="dreg-req">*</span></label>
                  <input id="dreg-fee" name="fee" type="number" min="0" placeholder="e.g. 2000" value={form.fee} onChange={update} required />
                </div>

                <div className="dreg-field">
                  <label htmlFor="dreg-phone">Contact Phone</label>
                  <input id="dreg-phone" name="phone" type="tel" placeholder="+92 300 1234567" value={form.phone} onChange={update} />
                </div>

                <div className="dreg-field dreg-field-full">
                  <label htmlFor="dreg-bio">Professional Bio <span className="dreg-optional">(optional)</span></label>
                  <textarea
                    id="dreg-bio"
                    name="bio"
                    rows="4"
                    maxLength="600"
                    placeholder="Briefly describe your background, expertise, and approach to patient care..."
                    value={form.bio}
                    onChange={update}
                  />
                  <span className="dreg-char-count">{form.bio.length}/600</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Review ─── */}
          {step === 2 && (
            <div className="dreg-form-section">
              <div className="dreg-form-heading">
                <span className="dreg-eyebrow">STEP 3</span>
                <h2>Review & Submit</h2>
                <p>Please confirm your details before submitting your application.</p>
              </div>

              <div className="dreg-review">
                <div className="dreg-review-section">
                  <h3>Professional Profile</h3>
                  <div className="dreg-review-grid">
                    <div className="dreg-review-item">
                      <span>Hospital</span>
                      <strong>{selectedHospital ? `${selectedHospital.name} — ${selectedHospital.city}` : "—"}</strong>
                    </div>
                    <div className="dreg-review-item">
                      <span>Specialization</span>
                      <strong>{form.specialization || "—"}</strong>
                    </div>
                    <div className="dreg-review-item">
                      <span>Qualification</span>
                      <strong>{form.qualification || "—"}</strong>
                    </div>
                    <div className="dreg-review-item">
                      <span>Experience</span>
                      <strong>{form.experience ? `${form.experience} years` : "Not specified"}</strong>
                    </div>
                    <div className="dreg-review-item">
                      <span>Consultation Fee</span>
                      <strong>PKR {Number(form.fee || 0).toLocaleString()}</strong>
                    </div>
                    <div className="dreg-review-item">
                      <span>Phone</span>
                      <strong>{form.phone || "Not provided"}</strong>
                    </div>
                  </div>
                  {form.bio && (
                    <div className="dreg-review-bio">
                      <span>Bio</span>
                      <p>{form.bio}</p>
                    </div>
                  )}
                </div>

                <div className="dreg-review-notice">
                  <span>ℹ️</span>
                  <div>
                    <strong>Pending Review</strong>
                    <p>Your profile will be reviewed by our team. You'll appear in search results once verified. This typically takes 1–2 business days.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="dreg-nav">
            {step > (isLoggedIn ? 1 : 0) && (
              <button type="button" className="dreg-btn-back" onClick={handleBack} disabled={submitting}>
                ← Back
              </button>
            )}

            {step < 2 ? (
              <button type="button" className="dreg-btn-next" onClick={handleNext} disabled={submitting}>
                {submitting ? (
                  <><span className="dreg-spinner" /> Processing…</>
                ) : (
                  <>Continue →</>
                )}
              </button>
            ) : (
              <button type="button" id="dreg-submit-btn" className="dreg-btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <><span className="dreg-spinner" /> Submitting…</>
                ) : (
                  <>Submit Application ✓</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Why MediBook */}
        <div className="dreg-benefits">
          {[
            { icon: "👥", title: "Reach More Patients", desc: "Thousands of patients search for doctors on MediBook every day." },
            { icon: "📅", title: "Smart Scheduling", desc: "Manage your availability and appointments from one dashboard." },
            { icon: "💳", title: "Secure Payments", desc: "Receive consultation fees directly through Stripe." },
            { icon: "🏥", title: "Build Your Reputation", desc: "Collect verified reviews and grow your online presence." },
          ].map((b) => (
            <div key={b.title} className="dreg-benefit-card">
              <span>{b.icon}</span>
              <strong>{b.title}</strong>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default DoctorRegister;
