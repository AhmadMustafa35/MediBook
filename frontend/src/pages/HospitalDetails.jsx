import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import {
  getHospitalImage,
  getDoctorImage,
  FALLBACK_HOSPITAL_IMAGE,
  FALLBACK_DOCTOR_IMAGE,
} from "../utils/imageHelpers";

function HospitalDetails() {
  const { id } = useParams();

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadHospitalDetails() {
      setLoading(true);
      setError("");

      try {
        const [hospitalResponse, doctorsResponse] = await Promise.all([
          api.get(`/hospitals/${id}`),
          api.get("/doctors"),
        ]);

        if (cancelled) return;

        const hospitalData = hospitalResponse.data;
        const hospitalRecord =
          hospitalData.hospital || hospitalData.data || hospitalData;

        const doctorData = doctorsResponse.data;
        const doctorList = Array.isArray(doctorData)
          ? doctorData
          : doctorData.doctors || doctorData.data || [];

        setHospital(hospitalRecord);
        setDoctors(
          Array.isArray(doctorList)
            ? doctorList.filter((doctor) => {
                const docHospId =
                  doctor.hospital?._id ||
                  doctor.hospital?.id ||
                  doctor.hospitalId?._id ||
                  doctor.hospitalId?.id ||
                  doctor.hospitalId ||
                  doctor.hospital;

                return String(docHospId || "") === String(id);
              })
            : []
        );
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "Unable to load hospital details. Please try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHospitalDetails();

    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

  if (loading) {
    return (
      <main className="hospital-details-page">
        <div className="hospital-details-message">
          Loading hospital details...
        </div>
      </main>
    );
  }

  if (error || !hospital) {
    return (
      <main className="hospital-details-page">
        <div className="hospital-details-message">
          <h2>Hospital details unavailable</h2>
          <p>{error || "This hospital could not be found."}</p>
          <button type="button" onClick={handleRetry}>
            Try again
          </button>
          <Link to="/hospitals">Back to hospitals</Link>
        </div>
      </main>
    );
  }

  const hospitalName = hospital.name || "Hospital";
  const hospitalLocation =
    hospital.city || hospital.location || hospital.address || "Location not available";
  const hospitalImage = getHospitalImage(hospital);

  return (
    <main className="hospital-details-page">
      <section className="hospital-details-hero">
        <img
          src={hospitalImage}
          alt={hospitalName}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_HOSPITAL_IMAGE;
          }}
        />

        <div className="hospital-details-overlay">
          <Link to="/hospitals" className="hospital-back-link">
            ← All hospitals
          </Link>

          <span className="hospitals-eyebrow">MEDIBOOK HEALTHCARE NETWORK</span>

          <h1>{hospitalName}</h1>

          <p>
            <span aria-hidden="true">⌖</span> {hospitalLocation}
          </p>
        </div>
      </section>

      <section className="hospital-details-content">
        <div className="hospital-information">
          <span className="hospitals-eyebrow">ABOUT THE FACILITY</span>
          <h2>Hospital overview</h2>

          <p>
            {hospital.description ||
              `Explore healthcare services and discover doctors associated with ${hospitalName}.`}
          </p>

          <div className="hospital-information-grid">
            <article>
              <span>Location</span>
              <strong>{hospitalLocation}</strong>
            </article>

            <article>
              <span>Available doctors</span>
              <strong>{doctors.length}</strong>
            </article>

            {hospital.phone && (
              <article>
                <span>Contact number</span>
                <strong>{hospital.phone}</strong>
              </article>
            )}

            {hospital.email && (
              <article>
                <span>Email</span>
                <strong>{hospital.email}</strong>
              </article>
            )}
          </div>
        </div>

        <section className="hospital-doctors-section">
          <div className="hospital-doctors-heading">
            <div>
              <span className="hospitals-eyebrow">MEDICAL PROFESSIONALS</span>
              <h2>Doctors at this hospital</h2>
              <p>Explore doctors and continue to their profiles.</p>
            </div>

            <Link to="/doctors" className="hospital-all-doctors-link">
              All doctors →
            </Link>
          </div>

          {doctors.length === 0 ? (
            <div className="hospital-details-message">
              <h3>No doctors listed yet</h3>
              <p>
                There are currently no doctors linked to this hospital.
              </p>
              <Link to="/doctors">Browse all doctors →</Link>
            </div>
          ) : (
            <div className="hospital-doctors-grid">
              {doctors.map((doctor, index) => {
                const doctorId = doctor._id || doctor.id;
                const doctorName =
                  doctor.name || doctor.user?.name || doctor.fullName || "Medical professional";
                const doctorPhoto = getDoctorImage(doctor, index);

                return (
                  <article
                    className="hospital-doctor-card"
                    key={doctorId || index}
                  >
                    <div className="hospital-doctor-avatar">
                      <img
                        src={doctorPhoto}
                        alt={doctorName}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_DOCTOR_IMAGE;
                        }}
                      />
                    </div>

                    <div className="hospital-doctor-card-body">
                      <h3>{doctorName}</h3>

                      <p>
                        {doctor.specialty ||
                          doctor.specialization ||
                          "General physician"}
                      </p>

                      {doctor.experience != null && (
                        <span>
                          {doctor.experience} years of experience
                        </span>
                      )}

                      <Link to={`/doctors/${doctorId}`}>
                        View doctor profile →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default HospitalDetails;