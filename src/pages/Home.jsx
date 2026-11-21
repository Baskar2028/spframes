import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Camera,
  Heart,
  Film,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import Gallery from "../components/Gallery";
import { IMG, WORKS, ORIGINAL_SERVICES } from "../data/media";
import { SERVICES } from "../data/services";
import { useBooking } from "../components/BookingModal";
const slides = [
  ["Wedding", "A lifetime of moments, beautifully preserved.", IMG.wedding],
  ["Prewedding", "A story that begins before the forever.", IMG.preWed],
  ["Postwedding", "Keep the celebration alive, frame by frame.", IMG.couple],
  ["Birthday", "The joy, the laughter, the little details.", IMG.birthday],
  ["Yellow Festival", "Honouring a beautiful family milestone.", IMG.maternity],
  ["Baby Shower", "A new chapter deserves a timeless story.", IMG.baby],
];
export default function Home() {
  const [slide, setSlide] = useState(0),
    [filter, setFilter] = useState("all");
  const { openBooking } = useBooking();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) setSlide((s) => (s + 1) % slides.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);
  const gallery = useMemo(
    () =>
      WORKS.filter((w) => filter === "all" || w.cat === filter).map((w) => ({
        ...w,
        src: IMG[w.src],
      })),
    [filter],
  );
  return (
    <>
      <section className="hero">
        <div
          key={slide}
          className="hero-image"
          style={{ backgroundImage: `url("${slides[slide][2]}")` }}
        />
        <div className="hero-shade" />
        <button
          className="hero-arrow left"
          onClick={() => setSlide((s) => (s + 5) % 6)}
          aria-label="Previous"
        >
          <ChevronLeft />
        </button>
        <div className="hero-content">
          <span className="hero-brand">ATEXRA PHOTOGRAPHY</span>
          <h1>
            {slides[slide][0]}
            <br />
            <em>Stories, forever.</em>
          </h1>
          <p>{slides[slide][1]}</p>
          <div className="gold-line" />
          <div className="hero-actions">
            <button
              className="btn btn-gold"
              type="button"
              onClick={() => openBooking(slides[slide][0])}
            >
              Book your date
            </button>
            <a className="btn" href="#best-works">
              Explore our work
            </a>
          </div>
          <div className="slide-dots">
            {slides.map((s, i) => (
              <button
                key={s[0]}
                className={i === slide ? "active" : ""}
                onClick={() => setSlide(i)}
                aria-label={`Go to ${s[0]}`}
              />
            ))}
          </div>
        </div>
        <button
          className="hero-arrow right"
          onClick={() => setSlide((s) => (s + 1) % 6)}
          aria-label="Next"
        >
          <ChevronRight />
        </button>
        <span className="hero-index">
          0{slide + 1} <i /> 06
        </span>
      </section>
      <section className="why-section">
        <div className="container">
          <SectionTitle
            eyebrow="The Atexra experience"
            title={
              <>
                Moments become <em>memories.</em>
              </>
            }
          >
            We approach every celebration with care, creativity and an eye for
            the moments that matter.
          </SectionTitle>
          <div className="why-grid">
            {[
              [
                Camera,
                "Creative storytelling",
                "We look beyond poses to capture the feeling of every occasion.",
              ],
              [
                Star,
                "Attention to detail",
                "Thoughtful framing, light and composition in every photograph.",
              ],
              [
                Film,
                "Quality editing",
                "A considered finishing touch that keeps your memories timeless.",
              ],
              [
                Heart,
                "Memorable experiences",
                "A comfortable, personal process from planning to delivery.",
              ],
            ].map(([Icon, title, desc]) => (
              <article className="why-card" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="best-frames">
        <div className="container">
          <SectionTitle
            eyebrow="What we capture"
            title={
              <>
                Explore <em>our frames.</em>
              </>
            }
          >
            Every occasion deserves a beautiful frame.
          </SectionTitle>
          <div className="service-grid">
            {ORIGINAL_SERVICES.map((s, i) => (
              <Link
                className="service-card"
                to={`/services/${SERVICES[Math.min(i, 5)].slug}`}
                key={s.t}
              >
                <img src={IMG[s.img]} alt={s.t} loading="lazy" />
                <div>
                  <span>0{i + 1}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  <b>
                    Explore <ArrowUpRight size={16} />
                  </b>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="portfolio-section" id="best-works">
        <div className="container">
          <SectionTitle
            eyebrow="Selected photographs"
            title={
              <>
                Best <em>works.</em>
              </>
            }
          >
            A collection of stories, celebrations and candid moments.
          </SectionTitle>
          <div className="filters">
            {[
              "all",
              "weddings",
              "pre-wedding",
              "portraits",
              "events",
              "cinematography",
            ].map((f) => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f.replace("-", " ")}
              </button>
            ))}
          </div>
          <Gallery items={gallery} />
        </div>
      </section>
      <section className="cta-section">
        <div className="container cta-inner">
          <span className="eyebrow">Your story, our lens</span>
          <h2>
            Let's create something <em>timeless.</em>
          </h2>
          <p>Tell us about your celebration. We would love to be part of it.</p>
          <button
            className="btn btn-gold"
            type="button"
            onClick={() => openBooking()}
          >
            Start a conversation <ArrowUpRight size={16} />
          </button>
        </div>
      </section>
    </>
  );
}
