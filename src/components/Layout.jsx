import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { whatsappUrl } from "../config/siteConfig";
import { BookingProvider } from "./BookingModal";
import whatsappIcon from "../assets/wp.png";
export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    const revealItems = document.querySelectorAll(
      "main section, main article, main .studio-card, main .contact-form, main .price-card",
    );
    revealItems.forEach((item) => item.classList.add("reveal-ready"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealItems.forEach((item) => item.classList.add("revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" },
    );
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <BookingProvider>
      <Navbar />
      <div className="ambient-stars" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <main key={location.pathname} className="route-page">
        <Outlet />
      </main>
      <Footer />
      <a
        className="whatsapp-fab"
        href={whatsappUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <img src={whatsappIcon} alt="" />
      </a>
    </BookingProvider>
  );
}
