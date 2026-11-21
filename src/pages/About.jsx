import SectionTitle from "../components/SectionTitle";
import { siteConfig } from "../config/siteConfig";
import { IMG } from "../data/media";
import { useEffect, useRef, useState } from "react";

function CountUp({ value, suffix = "" }) {
  const [display, setDisplay] = useState("0");
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    let started = false;
    let frame;

    function runCount() {
      if (started) return;
      started = true;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        setDisplay(String(value));
        return;
      }
      const startedAt = performance.now();
      const duration = 1200;
      function tick(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(String(Math.round(value * eased)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runCount();
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <strong ref={elementRef}>
      {value >= 1000 ? `${display}${suffix}` : `${display}${suffix}`}
    </strong>
  );
}

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <h1>
            Behind every frame,
            <br />
            <em>there is a story.</em>
          </h1>
          <p>Photography is how we hold on to the moments that matter.</p>
        </div>
      </section>
      <section>
        <div className="container owner-grid">
          <div className="owner-photo">
            <img
              src={siteConfig.ownerPhoto || IMG.portrait1}
              alt="SPFRAMES studio owner"
            />
          </div>
          <div>
            <span className="eyebrow">The person behind the lens</span>
            <h2>{siteConfig.ownerName}</h2>
            <p className="lead">A photographer's eye, a storyteller's heart.</p>
            <p className="body-copy">
              The person behind SPFRAMES believes in creating honest,
              expressive images that preserve the feeling of a moment. Add the
              owner's personal introduction, photography journey and creative
              vision here.
            </p>
            <p className="editable-note">
              Owner introduction is an editable placeholder until the studio
              profile is confirmed.
            </p>
          </div>
        </div>
      </section>
      <section className="about-studio">
        <div className="container">
          <SectionTitle
            eyebrow="About SPFRAMES"
            title={
              <>
                More than pictures. <em>Stories that stay.</em>
              </>
            }
            center={false}
          />
          <div className="studio-card">
            <p>
              At SP FRAMES, we believe photography is more than capturing an
              image. It is about preserving emotions, celebrating relationships,
              and creating memories that last a lifetime. With creativity,
              passion, and attention to every detail, we transform your special
              occasions into timeless visual stories.
            </p>
            <div className="stats">
              <div>
                <CountUp value={8} suffix="+" />
                <span>Years of experience</span>
              </div>
              <div>
                <CountUp value={450} suffix="+" />
                <span>Events captured</span>
              </div>
              <div>
                <CountUp value={380} suffix="+" />
                <span>Happy clients</span>
              </div>
              <div>
                <CountUp value={12} suffix="K+" />
                <span>Memories created</span>
              </div>
            </div>
            <p className="editable-note">
              Studio history and figures are carried over from the supplied
              website; please verify before publishing.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
