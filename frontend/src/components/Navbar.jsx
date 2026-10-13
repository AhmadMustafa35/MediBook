
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="site-header">
      <nav className="navbar">
        <Link to="/" className="brand">
          <span className="brand-icon" aria-hidden="true">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="2"
                width="36"
                height="36"
                rx="12"
                fill="#D9F5EF"
              />
              <path
                d="M20 9V31M9 20H31"
                stroke="#0D9488"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M7 26H13L17 18L22 25L26 14L30 20H34"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="brand-copy">
            <span className="brand-name">MediBook</span>
            <span className="brand-tagline">CARE MADE SIMPLE</span>
          </span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/doctors">
            Find Doctors
          </NavLink>

          <NavLink to="/hospitals">
            Hospitals
          </NavLink>

          <NavLink to="/dashboard">
            Dashboard
          </NavLink>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="nav-login">
            Log in
          </Link>

          <Link to="/register" className="nav-cta">
            Get Started <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;