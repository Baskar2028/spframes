import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, ArrowUpRight } from "lucide-react";
import { siteConfig, whatsappUrl } from "../config/siteConfig";
export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link className="logo" to="/">
              A<span>TEX</span>RA
            </Link>
            <p>Capturing moments. Creating timeless memories.</p>
            <div className="socials">
              <a href={siteConfig.instagram} aria-label="Instagram">
                <Instagram />
              </a>
              <a href={siteConfig.facebook} aria-label="Facebook">
                <Facebook />
              </a>
              <a href={siteConfig.youtube} aria-label="YouTube">
                <Youtube />
              </a>
            </div>
          </div>
          <div>
            <h5>Explore</h5>
            <Link to="/">Home</Link>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h5>Photography</h5>
            {[
              "wedding",
              "prewedding",
              "postwedding",
              "birthday",
              "yellow-festival",
              "baby-shower",
            ].map((s) => (
              <Link key={s} to={`/services/${s}`}>
                {s.replace("-", " ")}
              </Link>
            ))}
          </div>
          <div>
            <h5>Get in touch</h5>
            <a href={`tel:${siteConfig.whatsappNumber}`}>
              {siteConfig.phoneDisplay}
            </a>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer">
              WhatsApp <ArrowUpRight size={14} />
            </a>
            <p>{siteConfig.address}</p>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} ATEXRA. All rights reserved.</span>
          <span>Designed with passion.</span>
        </div>
      </div>
    </footer>
  );
}
