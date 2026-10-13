import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getDoctorImage, FALLBACK_DOCTOR_IMAGE } from "../utils/imageHelpers";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All specialties");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchDoctors = async () => {
      try {
        const response = await api.get("/doctors");

        if (cancelled) return;

        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : data.doctors || data.data || [];

        setDoctors(Array.isArray(list) ? list : []);
        setError("");
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "Unable to load doctors. Please check your backend database connection."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const getDoctorName = (doctor) =>
    doctor.name ||
    doctor.user?.name ||
    doctor.fullName ||
    "Healthcare Professional";

  const getSpecialty = (doctor) =>
    doctor.specialty ||
    doctor.specialization ||
    doctor.department ||
    "General Practice";

  const getHospital = (doctor) =>
    typeof doctor.hospital === "object"
      ? doctor.hospital?.name || ""
      : doctor.hospitalName || "";

  const getDoctorId = (doctor) => doctor._id || doctor.id;

  const specialties = useMemo(
    () => [
      "All specialties",
      ...new Set(doctors.map(getSpecialty).filter(Boolean)),
    ],
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    const term = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !term ||
        getDoctorName(doctor).toLowerCase().includes(term) ||
        getSpecialty(doctor).toLowerCase().includes(term) ||
        getHospital(doctor).toLowerCase().includes(term);

      const matchesSpecialty =
        specialty === "All specialties" ||
        getSpecialty(doctor) === specialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialty]);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRetryCount((count) => count + 1);
  };

  return (
    <main className="doctors-page">
      <section className="doctors-hero">
        <div className="doctors-hero-inner">
          <span className="doctors-eyebrow">
            YOUR HEALTH STARTS HERE
          </span>

          <h1>
            Find the right doctor.
            <br />
            <span>Feel better, sooner.</span>
          </h1>

          <p>
            Discover healthcare professionals and find the care
            you need, all in one place.
          </p>

          <div className="doctor-search-bar">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search by doctor, specialty, or hospital..."
              aria-label="Search doctors"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <span className="doctor-search-label">
              {doctors.length} doctors
            </span>
          </div>
        </div>
      </section>

      <section className="doctors-content">
        <div className="doctors-section-heading">
          <div>
            <span className="doctors-eyebrow">OUR NETWORK</span>
            <h2>Meet our doctors</h2>
            <p>
              Browse professionals to find the right fit for your needs.
            </p>
          </div>

          <label className="specialty-filter">
            <span>Specialty</span>

            <select
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            >
              {specialties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && (
          <div className="doctors-message">
            <div className="doctors-spinner" />
            <p>Finding the right doctors for you...</p>
          </div>
        )}

        {!loading && error && (
          <div className="doctors-message doctors-error" role="alert">
            <h3>We couldn't load the doctors</h3>
            <p>{error}</p>

            <button type="button" onClick={handleRetry}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredDoctors.length === 0 && (
          <div className="doctors-message">
            <span className="doctors-empty-icon">⌕</span>
            <h3>No doctors found</h3>
            <p>
              Try another search term or choose a different specialty.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSpecialty("All specialties");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filteredDoctors.length > 0 && (
          <div className="doctors-grid">
            {filteredDoctors.map((doctor, idx) => {
              const name = getDoctorName(doctor);
              const id = getDoctorId(doctor);
              const photo = getDoctorImage(doctor, idx);

              return (
                <article
                  className="doctor-card"
                  key={id || name || idx}
                >
                  <div className="doctor-card-top">
                    <div className="doctor-avatar">
                      <img
                        src={photo}
                        alt={name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_DOCTOR_IMAGE;
                        }}
                      />
                    </div>

                    <span className="doctor-verified">
                      Healthcare professional
                    </span>
                  </div>

                  <div className="doctor-card-body">
                    <span className="doctor-specialty">
                      {getSpecialty(doctor)}
                    </span>

                    <h3>{name}</h3>

                    <p className="doctor-hospital">
                      <span aria-hidden="true">⌖</span>{" "}
                      {getHospital(doctor) || "MediBook Network"}
                    </p>

                    <div className="doctor-card-divider" />

                    <div className="doctor-card-meta">
                      <div>
                        <span>Consultation</span>
                        <strong>
                          {doctor.consultationFee != null
                            ? `Rs. ${doctor.consultationFee}`
                            : doctor.fee != null
                              ? `Rs. ${doctor.fee}`
                              : "Contact for fee"}
                        </strong>
                      </div>

                      <div>
                        <span>Experience</span>
                        <strong>
                          {doctor.experience != null
                            ? `${doctor.experience} years`
                            : "Not specified"}
                        </strong>
                      </div>
                    </div>

                    <div className="doctor-card-actions">
                      <Link
                        to={`/doctors/${id}`}
                        className="doctor-view-link"
                      >
                        View profile
                      </Link>

                      <Link
                        to={`/booking/${id}`}
                        className="doctor-book-link"
                      >
                        Book now →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Doctors;