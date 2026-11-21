import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { useBooking } from "./BookingModal";
const links = [
  ["Home", "/"],
  ["About", "/about"],
];
const services = [
  ["Wedding Photography", "wedding"],
  ["Prewedding Photography", "prewedding"],
  ["Postwedding Photography", "postwedding"],
  ["Birthday Photography", "birthday"],
  ["Yellow Festival Photography", "yellow-festival"],
  ["Baby Shower Photography", "baby-shower"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const navDrop = useRef(null);
  const { openBooking } = useBooking();

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (navDrop.current && !navDrop.current.contains(event.target)) {
        setDrop(false);
      }
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setDrop(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function closeNavigation() {
    setDrop(false);
    setOpen(false);
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="logo" to="/" onClick={closeNavigation}>
          A<span>TEX</span>RA
        </Link>
        <button
          className="burger"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map(([n, p]) => (
            <NavLink key={p} to={p} onClick={closeNavigation}>
              {n}
            </NavLink>
          ))}
          <div
            className="nav-drop"
            ref={navDrop}
            onMouseEnter={() => {
              if (window.matchMedia("(hover: hover)").matches) setDrop(true);
            }}
            onMouseLeave={() => {
              if (window.matchMedia("(hover: hover)").matches) setDrop(false);
            }}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={drop}
              aria-controls="services-menu"
              onClick={() => setDrop(true)}
            >
              Services <ChevronDown size={14} />
            </button>
            <div
              id="services-menu"
              className={drop ? "drop-menu show" : "drop-menu"}
            >
              {services.map(([n, s]) => (
                <Link
                  key={s}
                  to={`/services/${s}`}
                  onClick={closeNavigation}
                >
                  {n}
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/contact" onClick={closeNavigation}>
            Contact
          </NavLink>
          <button
            className="btn btn-gold nav-cta"
            type="button"
            onClick={() => {
              setOpen(false);
              openBooking();
            }}
          >
            Book a session
          </button>
        </nav>
      </div>
    </header>
  );
}
