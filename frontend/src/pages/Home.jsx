import { Link } from "react-router-dom";

const services = [
  {
    icon: "▦",
    color: "teal",
    title: "Book Appointments",
    description:
      "Schedule appointments with doctors in just a few simple steps.",
    link: "/doctors",
    action: "Book a visit",
  },
  {
    icon: "⚕",
    color: "blue",
    title: "Find Doctors",
    description:
      "Explore doctors by specialty and find the right care for you.",
    link: "/doctors",
    action: "Explore doctors",
  },
  {
    icon: "▤",
    color: "purple",
    title: "Trusted Hospitals",
    description:
      "Discover hospitals and healthcare facilities in our network.",
    link: "/hospitals",
    action: "Explore hospitals",
  },
  {
    icon: "♡",
    color: "orange",
    title: "Your Health Journey",
    description:
      "Keep track of your appointments and manage your account in one place.",
    link: "/dashboard",
    action: "Open dashboard",
  },
];

const benefits = [
  {
    icon: "✓",
    title: "Easy Booking",
    description: "Book appointments in a few simple steps.",
  },
  {
    icon: "✚",
    title: "Quality Care",
    description: "Discover healthcare providers for your needs.",
  },
  {
    icon: "⌑",
    title: "Secure Platform",
    description: "Access your account and manage your appointments.",
  },
  {
    icon: "♡",
    title: "Care That Fits You",
    description: "Explore doctors and hospitals in one place.",
  },
];

const stats = [
  { value: "24/7", label: "Online Access" },
  { value: "Easy", label: "Appointment Booking" },
  { value: "One", label: "Healthcare Platform" },
  { value: "Simple", label: "Patient Experience" },
];

function Home() {
  return (
    <main className="home-page">
      {/* Hero section */}
      <section className="home-hero">
        <div className="home-hero-decoration home-decoration-one" />
        <div className="home-hero-decoration home-decoration-two" />

        <div className="home-hero-container">
          <div className="home-hero-content">
            <div className="home-trust-label">
              <span className="home-trust-dot" />
              YOUR HEALTHCARE, SIMPLIFIED
            </div>

            <h1>
              Your Health,
              <br />
              <span>Our Priority.</span>
            </h1>

            <p className="home-hero-description">
              Take control of your healthcare journey. Find doctors,
              explore hospitals, and book appointments — all from one
              convenient platform.
            </p>

            <div className="home-hero-actions">
              <Link to="/doctors" className="home-button home-button-primary">
                <span>＋</span> Find a Doctor
                <span className="home-button-arrow">→</span>
              </Link>

              <Link
                to="/hospitals"
                className="home-button home-button-secondary"
              >
                Explore Hospitals <span>↗</span>
              </Link>
            </div>

            <div className="home-trust-points">
              <div className="home-trust-point">
                <span className="home-check-icon">✓</span>
                <div>
                  <strong>Simple Booking</strong>
                  <small>Save time online</small>
                </div>
              </div>

              <div className="home-trust-point">
                <span className="home-check-icon">✓</span>
                <div>
                  <strong>One Platform</strong>
                  <small>Doctors and hospitals</small>
                </div>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-image-backdrop" />

            <div className="home-image-frame">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=85"
                alt="Doctor ready to help patients"
              />
            </div>

            <div className="home-floating-card home-doctor-card">
              <div className="home-floating-icon">✚</div>
              <div>
                <strong>Find Your Doctor</strong>
                <span>Care starts here</span>
              </div>
            </div>

            <div className="home-floating-card home-booking-card">
              <div className="home-booking-icon">✓</div>
              <div>
                <strong>Ready to book?</strong>
                <span>Your next step to better care</span>
              </div>
            </div>

            <div className="home-circle-decoration" />
          </div>
        </div>

        <div className="home-stats">
          {stats.map((stat) => (
            <div className="home-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services section */}
      <section className="home-services section-container" id="services">
        <div className="home-section-heading">
          <span className="home-section-eyebrow">WHAT WE OFFER</span>
          <h2>
            Healthcare made <span>easier.</span>
          </h2>
          <p>
            Everything you need to manage your healthcare journey,
            thoughtfully brought together.
          </p>
        </div>

        <div className="home-services-grid">
          {services.map((service, index) => (
            <article
              className="home-service-card"
              key={service.title}
              style={{ "--card-index": index }}
            >
              <div
                className={`home-service-icon ${service.color}`}
                aria-hidden="true"
              >
                {service.icon}
              </div>

              <h3>{service.title}</h3>
              <p>{service.description}</p>

              <Link to={service.link} className="home-service-link">
                {service.action}
                <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Why MediBook section */}
      <section className="home-why-section">
        <div className="section-container home-why-container">
          <div className="home-why-heading">
            <span className="home-section-eyebrow">THE MEDIBOOK DIFFERENCE</span>
            <h2>
              Better care starts with
              <br />
              <span>a simpler experience.</span>
            </h2>
            <p>
              Spend less time navigating healthcare and more time focusing
              on what matters: your well-being.
            </p>

            <Link to="/register" className="home-button home-button-primary">
              Get Started <span className="home-button-arrow">→</span>
            </Link>
          </div>

          <div className="home-benefits-grid">
            {benefits.map((benefit) => (
              <div className="home-benefit" key={benefit.title}>
                <div className="home-benefit-icon">{benefit.icon}</div>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="home-cta-section section-container">
        <div className="home-cta-card">
          <div className="home-cta-decoration" />
          <div className="home-cta-content">
            <span>YOUR HEALTH JOURNEY STARTS HERE</span>
            <h2>Ready to put your health first?</h2>
            <p>
              Discover doctors, explore hospitals, and make your next
              appointment with MediBook.
            </p>
          </div>

          <div className="home-cta-actions">
            <Link
              to="/register"
              className="home-button home-button-light"
            >
              Create Your Account <span>→</span>
            </Link>
            <Link to="/doctors" className="home-cta-text-link">
              Browse doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="section-container home-footer-content">
          <Link to="/" className="home-footer-brand">
            <span className="home-footer-logo">✚</span>
            <span>
              <strong>MediBook</strong>
              <small>CARE MADE SIMPLE</small>
            </span>
          </Link>

          <p>Making healthcare easier, one appointment at a time.</p>

          <div className="home-footer-links">
            <Link to="/doctors">Doctors</Link>
            <Link to="/hospitals">Hospitals</Link>
            <Link to="/login">Login</Link>
          </div>

          <span className="home-copyright">
            © {new Date().getFullYear()} MediBook
          </span>
        </div>
      </footer>
    </main>
  );
}

export default Home;
