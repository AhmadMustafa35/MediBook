import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import {
  getDoctorImage,
  getHospitalImage,
  FALLBACK_DOCTOR_IMAGE,
  FALLBACK_HOSPITAL_IMAGE,
} from "../utils/imageHelpers";
import "./DoctorDetails.css";

const AVAILABILITY = [
  { day: "Monday", slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"] },
  { day: "Tuesday", slots: ["09:00 AM", "11:00 AM", "03:00 PM", "05:00 PM"] },
  { day: "Wednesday", slots: ["10:00 AM", "12:00 PM", "02:00 PM"] },
  { day: "Thursday", slots: ["09:00 AM", "10:00 AM", "11:00 AM", "04:00 PM"] },
  { day: "Friday", slots: ["09:00 AM", "02:00 PM", "03:00 PM", "05:00 PM"] },
  { day: "Saturday", slots: ["10:00 AM", "11:00 AM"] },
  { day: "Sunday", slots: [] },
];

const TABS = ["Overview", "Availability", "Hospital"];

function StarRating({ rating = 4.8, count = 124 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="dd-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`dd-star ${i < full ? "dd-star-full" : i === full && half ? "dd-star-half" : "dd-star-empty"}`}>★</span>
      ))}
      <span className="dd-rating-num">{rating}</span>
      <span className="dd-rating-count">({count} reviews)</span>
    </div>
  );
}

function DoctorDetails() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDay, setSelectedDay] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setImgLoaded(false);

    api
      .get(`/doctors/${id}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        setDoctor(data.doctor || data.data || data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Unable to load doctor profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, retryCount]);

  if (loading) {
    return (
      <main className="dd-page">
        <div className="dd-skeleton">
          <div className="dd-skeleton-hero" />
          <div className="dd-skeleton-content">
            <div className="dd-skeleton-avatar" />
            <div className="dd-skeleton-lines">
              <div className="dd-skeleton-line dd-line-lg" />
              <div className="dd-skeleton-line dd-line-md" />
              <div className="dd-skeleton-line dd-line-sm" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !doctor) {
    return (
      <main className="dd-page">
        <div className="dd-error-state">
          <span className="dd-error-icon">⚠️</span>
          <h2>Doctor profile unavailable</h2>
          <p>{error || "This doctor could not be found."}</p>
          <div className="dd-error-actions">
            <button type="button" className="dd-btn-primary" onClick={() => setRetryCount((c) => c + 1)}>Try again</button>
            <Link to="/doctors" className="dd-btn-outline">Browse all doctors</Link>
          </div>
        </div>
      </main>
    );
  }

  const name = doctor.user?.name || doctor.name || doctor.fullName || "Healthcare Professional";
  const specialty = doctor.specialization || doctor.specialty || "General Practice";
  const qualification = doctor.qualification || "MBBS";
  const experience = doctor.experience ?? null;
  const fee = doctor.fee ?? doctor.consultationFee ?? null;
  const bio = doctor.bio || "";
  const phone = doctor.phone || doctor.user?.phone || "";
  const isVerified = doctor.isVerified;
  const hospitalObj = typeof doctor.hospital === "object" ? doctor.hospital : null;
  const hospitalName = hospitalObj?.name || "MediBook Network Hospital";
  const hospitalCity = hospitalObj?.city || "";
  const hospitalAddress = hospitalObj?.address || "";
  const doctorPhoto = getDoctorImage(doctor);
  const hospitalPhoto = hospitalObj ? getHospitalImage(hospitalObj) : FALLBACK_HOSPITAL_IMAGE;
  const doctorId = doctor._id || doctor.id;

  // Deterministic "rating" based on doctor id for demo
  const ratingBase = doctorId ? (parseInt(doctorId.slice(-2), 16) % 20) / 20 : 0;
  const rating = (4.3 + ratingBase * 0.6).toFixed(1);
  const reviewCount = 80 + (doctorId ? parseInt(doctorId.slice(-3), 16) % 150 : 0);

  return (
    <main className="dd-page">
      {/* ── HERO BANNER ── */}
      <div className="dd-hero">
        <div className="dd-hero-bg" />
        <div className="dd-hero-inner">
          <Link to="/doctors" className="dd-breadcrumb">
            ← All Doctors
          </Link>

          <div className="dd-hero-card">
            {/* Avatar */}
            <div className="dd-avatar-wrap">
              <img
                src={doctorPhoto}
                alt={name}
                className={`dd-avatar ${imgLoaded ? "dd-avatar-loaded" : ""}`}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_DOCTOR_IMAGE; setImgLoaded(true); }}
              />
              {isVerified && (
                <div className="dd-verified-badge" title="Verified Doctor">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="dd-hero-info">
              <div className="dd-specialty-pill">{specialty}</div>
              <h1 className="dd-name">{name}</h1>
              <p className="dd-qual">{qualification}</p>
              <StarRating rating={Number(rating)} count={reviewCount} />

              {/* Quick stats row */}
              <div className="dd-stats-row">
                {experience !== null && (
                  <div className="dd-stat">
                    <strong>{experience}+</strong>
                    <span>Years Exp.</span>
                  </div>
                )}
                {fee !== null && (
                  <div className="dd-stat">
                    <strong>PKR {Number(fee).toLocaleString()}</strong>
                    <span>Per Visit</span>
                  </div>
                )}
                <div className="dd-stat">
                  <strong>{reviewCount}</strong>
                  <span>Reviews</span>
                </div>
                <div className="dd-stat">
                  <strong>{rating}</strong>
                  <span>Rating</span>
                </div>
              </div>

              {/* Hospital quick */}
              {hospitalObj && (
                <div className="dd-hospital-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  {hospitalName}{hospitalCity ? ` · ${hospitalCity}` : ""}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="dd-hero-cta">
              <Link to={`/booking/${doctorId}`} className="dd-book-btn" id="dd-book-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Book Appointment
              </Link>
              {phone && (
                <a href={`tel:${phone}`} className="dd-call-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.1 1.22 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  Call Doctor
                </a>
              )}
              <div className="dd-availability-indicator">
                <span className="dd-avail-dot" />
                Available Today
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="dd-tabs-bar">
        <div className="dd-tabs-inner">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`dd-tab ${activeTab === i ? "dd-tab-active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="dd-content">

        {/* ══ TAB 0: Overview ══ */}
        {activeTab === 0 && (
          <div className="dd-tab-content dd-overview">
            {/* About */}
            <section className="dd-section">
              <div className="dd-section-label">About</div>
              <h2 className="dd-section-title">About {name}</h2>
              <p className="dd-bio">
                {bio ||
                  `${name} is a highly qualified ${specialty} with ${experience ?? "several"} years of clinical experience. Known for a patient-first approach, ${name.split(" ")[0]} combines evidence-based medicine with compassionate care to deliver the best outcomes for every patient.`}
              </p>
            </section>

            {/* Expertise cards */}
            <section className="dd-section">
              <div className="dd-section-label">Details</div>
              <h2 className="dd-section-title">Professional Details</h2>
              <div className="dd-detail-cards">
                <div className="dd-detail-card">
                  <div className="dd-detail-icon">🎓</div>
                  <div>
                    <span>Qualification</span>
                    <strong>{qualification}</strong>
                  </div>
                </div>
                <div className="dd-detail-card">
                  <div className="dd-detail-icon">🩺</div>
                  <div>
                    <span>Specialization</span>
                    <strong>{specialty}</strong>
                  </div>
                </div>
                {experience !== null && (
                  <div className="dd-detail-card">
                    <div className="dd-detail-icon">📅</div>
                    <div>
                      <span>Experience</span>
                      <strong>{experience} Years</strong>
                    </div>
                  </div>
                )}
                {fee !== null && (
                  <div className="dd-detail-card">
                    <div className="dd-detail-icon">💳</div>
                    <div>
                      <span>Consultation Fee</span>
                      <strong>PKR {Number(fee).toLocaleString()}</strong>
                    </div>
                  </div>
                )}
                {phone && (
                  <div className="dd-detail-card">
                    <div className="dd-detail-icon">📞</div>
                    <div>
                      <span>Contact</span>
                      <strong>{phone}</strong>
                    </div>
                  </div>
                )}
                <div className="dd-detail-card">
                  <div className="dd-detail-icon">✅</div>
                  <div>
                    <span>Status</span>
                    <strong style={{ color: isVerified ? "#16a34a" : "#d97706" }}>
                      {isVerified ? "Verified & Trusted" : "Profile Under Review"}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* What to expect */}
            <section className="dd-section">
              <div className="dd-section-label">Clinic</div>
              <h2 className="dd-section-title">What to Expect</h2>
              <div className="dd-expect-grid">
                {[
                  { icon: "🕐", title: "Appointment Duration", desc: "Typical consultations last 20–30 minutes." },
                  { icon: "💊", title: "Prescriptions", desc: "Digital and paper prescriptions available." },
                  { icon: "🔒", title: "Confidential", desc: "All information is kept strictly private." },
                  { icon: "📋", title: "Follow-up", desc: "Follow-up care and referrals as needed." },
                ].map((item) => (
                  <div key={item.title} className="dd-expect-card">
                    <span>{item.icon}</span>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Patient reviews */}
            <section className="dd-section">
              <div className="dd-section-label">Reviews</div>
              <h2 className="dd-section-title">Patient Reviews</h2>
              <div className="dd-reviews-summary">
                <div className="dd-reviews-big-num">{rating}</div>
                <div>
                  <StarRating rating={Number(rating)} count={reviewCount} />
                  <p>Based on {reviewCount} verified patient reviews</p>
                </div>
              </div>
              <div className="dd-reviews-list">
                {[
                  { initials: "SA", name: "Sara A.", date: "2 days ago", text: "Extremely professional and caring. Diagnosed my issue quickly and the treatment worked perfectly.", stars: 5 },
                  { initials: "MK", name: "Muhammad K.", date: "1 week ago", text: "Very knowledgeable doctor. Explained everything clearly and answered all my questions patiently.", stars: 5 },
                  { initials: "FH", name: "Fatima H.", date: "2 weeks ago", text: "Great experience overall. The clinic is clean and the staff is friendly. Highly recommend.", stars: 4 },
                ].map((review) => (
                  <div key={review.name} className="dd-review-card">
                    <div className="dd-review-header">
                      <div className="dd-review-avatar">{review.initials}</div>
                      <div>
                        <strong>{review.name}</strong>
                        <span>{review.date}</span>
                      </div>
                      <div className="dd-review-stars">
                        {Array.from({ length: review.stars }, (_, i) => <span key={i}>★</span>)}
                      </div>
                    </div>
                    <p>{review.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ══ TAB 1: Availability ══ */}
        {activeTab === 1 && (
          <div className="dd-tab-content dd-availability">
            <section className="dd-section">
              <div className="dd-section-label">Schedule</div>
              <h2 className="dd-section-title">Weekly Availability</h2>
              <p className="dd-avail-subtitle">Select a day to see available time slots. Book instantly online.</p>

              {/* Day selector */}
              <div className="dd-day-tabs">
                {AVAILABILITY.map((item, i) => (
                  <button
                    key={item.day}
                    type="button"
                    className={`dd-day-btn ${selectedDay === i ? "dd-day-active" : ""} ${item.slots.length === 0 ? "dd-day-off" : ""}`}
                    onClick={() => setSelectedDay(i)}
                    disabled={item.slots.length === 0}
                  >
                    <span className="dd-day-name">{item.day.slice(0, 3)}</span>
                    <span className="dd-day-slots">
                      {item.slots.length === 0 ? "Off" : `${item.slots.length} slots`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Slots */}
              <div className="dd-slots-heading">
                <h3>{AVAILABILITY[selectedDay].day}</h3>
                {AVAILABILITY[selectedDay].slots.length > 0 ? (
                  <span className="dd-slots-count">{AVAILABILITY[selectedDay].slots.length} slots available</span>
                ) : (
                  <span className="dd-slots-off">Unavailable</span>
                )}
              </div>

              {AVAILABILITY[selectedDay].slots.length > 0 ? (
                <div className="dd-slots-grid">
                  {AVAILABILITY[selectedDay].slots.map((slot) => (
                    <Link
                      key={slot}
                      to={`/booking/${doctorId}`}
                      className="dd-slot"
                    >
                      {slot}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="dd-no-slots">
                  <span>😴</span>
                  <p>No appointments available on this day. Please select another day.</p>
                </div>
              )}

              <div className="dd-book-cta-box">
                <div>
                  <strong>Ready to book?</strong>
                  <p>Choose your preferred date & time during booking.</p>
                </div>
                <Link to={`/booking/${doctorId}`} className="dd-book-btn">
                  Book Now →
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* ══ TAB 2: Hospital ══ */}
        {activeTab === 2 && (
          <div className="dd-tab-content dd-hospital-tab">
            {hospitalObj ? (
              <section className="dd-section">
                <div className="dd-section-label">Facility</div>
                <h2 className="dd-section-title">Hospital & Clinic</h2>

                <div className="dd-hospital-hero">
                  <img
                    src={hospitalPhoto}
                    alt={hospitalName}
                    className="dd-hospital-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_HOSPITAL_IMAGE; }}
                  />
                  <div className="dd-hospital-overlay">
                    <h3>{hospitalName}</h3>
                    {hospitalCity && <p>{hospitalCity}</p>}
                  </div>
                </div>

                <div className="dd-hospital-details">
                  {hospitalAddress && (
                    <div className="dd-hospital-row">
                      <span className="dd-hospital-row-icon">📍</span>
                      <div>
                        <span>Address</span>
                        <strong>{hospitalAddress}{hospitalCity ? `, ${hospitalCity}` : ""}</strong>
                      </div>
                    </div>
                  )}
                  {hospitalObj.phone && (
                    <div className="dd-hospital-row">
                      <span className="dd-hospital-row-icon">📞</span>
                      <div>
                        <span>Phone</span>
                        <strong>{hospitalObj.phone}</strong>
                      </div>
                    </div>
                  )}
                  {hospitalObj.email && (
                    <div className="dd-hospital-row">
                      <span className="dd-hospital-row-icon">✉️</span>
                      <div>
                        <span>Email</span>
                        <strong>{hospitalObj.email}</strong>
                      </div>
                    </div>
                  )}
                  <div className="dd-hospital-row">
                    <span className="dd-hospital-row-icon">⏰</span>
                    <div>
                      <span>Working Hours</span>
                      <strong>Mon – Sat · 9:00 AM – 6:00 PM</strong>
                    </div>
                  </div>
                </div>

                {hospitalObj.description && (
                  <p className="dd-hospital-desc">{hospitalObj.description}</p>
                )}

                <div className="dd-hospital-actions">
                  <Link to={`/hospitals/${hospitalObj._id || hospitalObj.id}`} className="dd-btn-outline">
                    View Full Hospital Profile →
                  </Link>
                  <Link to={`/booking/${doctorId}`} className="dd-book-btn">
                    Book with {name.split(" ")[0]} →
                  </Link>
                </div>
              </section>
            ) : (
              <div className="dd-no-hospital">
                <span>🏥</span>
                <p>Hospital information is not available for this doctor.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── STICKY BOTTOM BAR (mobile) ── */}
      <div className="dd-sticky-bar">
        <div>
          <strong>{name}</strong>
          {fee !== null && <span>PKR {Number(fee).toLocaleString()}</span>}
        </div>
        <Link to={`/booking/${doctorId}`} className="dd-sticky-book">
          Book Appointment
        </Link>
      </div>
    </main>
  );
}

export default DoctorDetails;