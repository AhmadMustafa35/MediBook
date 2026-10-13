import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getHospitalImage, FALLBACK_HOSPITAL_IMAGE } from "../utils/imageHelpers";

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadHospitals() {
      try {
        const response = await api.get("/hospitals");

        if (cancelled) return;

        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : data.hospitals || data.data || [];

        setHospitals(Array.isArray(list) ? list : []);
        setError("");
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "Unable to load hospitals. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHospitals();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRetryCount((count) => count + 1);
  };

  const filteredHospitals = hospitals.filter((hospital) => {
    const term = search.trim().toLowerCase();
    const name = hospital.name || "";
    const location =
      hospital.city || hospital.location || hospital.address || "";

    return (
      !term ||
      name.toLowerCase().includes(term) ||
      location.toLowerCase().includes(term)
    );
  });

  return (
    <main className="hospitals-page">
      <section className="hospitals-hero">
        <div className="hospitals-hero-content">
          <span className="hospitals-eyebrow">
            QUALITY CARE, CLOSER TO YOU
          </span>

          <h1>
            Find trusted hospitals
            <br />
            <span>for better care.</span>
          </h1>

          <p>
            Explore healthcare facilities and discover a place
            that fits your medical needs.
          </p>

          <div className="hospital-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search hospitals or cities..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search hospitals"
            />
          </div>
        </div>
      </section>

      <section className="hospitals-content">
        <div className="hospitals-heading">
          <div>
            <span className="hospitals-eyebrow">
              MEDIBOOK NETWORK
            </span>
            <h2>Explore hospitals</h2>
            <p>
              Find a healthcare facility for your next appointment.
            </p>
          </div>

          <span className="hospital-count">
            {hospitals.length} facilities
          </span>
        </div>

        {loading && (
          <div className="hospital-message">
            Loading hospitals...
          </div>
        )}

        {!loading && error && (
          <div
            className="hospital-message hospital-error"
            role="alert"
          >
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredHospitals.length === 0 && (
          <div className="hospital-message">
            <h3>No hospitals found</h3>
            <p>
              Try another search, or check back later.
            </p>
          </div>
        )}

        {!loading && !error && filteredHospitals.length > 0 && (
          <div className="hospitals-grid">
            {filteredHospitals.map((hospital, index) => {
              const id = hospital._id || hospital.id;
              const image = getHospitalImage(hospital, index);

              return (
                <article
                  className="hospital-card"
                  key={id || index}
                >
                  <div className="hospital-image">
                    <img
                      src={image}
                      alt={hospital.name || "Hospital building"}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_HOSPITAL_IMAGE;
                      }}
                    />

                    <span className="hospital-image-badge">
                      Healthcare facility
                    </span>
                  </div>

                  <div className="hospital-card-body">
                    <span className="hospitals-eyebrow">
                      MEDIBOOK FACILITY
                    </span>

                    <h3>{hospital.name || "Hospital"}</h3>

                    <p className="hospital-location">
                      <span aria-hidden="true">⌖</span>{" "}
                      {hospital.city ||
                        hospital.location ||
                        hospital.address ||
                        "Location available on request"}
                    </p>

                    {hospital.description && (
                      <p className="hospital-description">
                        {hospital.description}
                      </p>
                    )}

                    <div className="hospital-card-footer">
                      <span>
                        Find care that fits your needs
                      </span>

                      <Link
                        to={`/hospitals/${id}`}
                        className="hospital-details-link"
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className="hospital-care-banner">
          <div>
            <span className="hospitals-eyebrow">
              YOUR HEALTH MATTERS
            </span>

            <h2>
              Take the next step toward better care.
            </h2>

            <p>
              Find a healthcare professional and plan your next visit.
            </p>
          </div>

          <Link to="/doctors" className="hospital-cta">
            Find a doctor →
          </Link>
        </section>
      </section>
    </main>
  );
}

export default Hospitals;