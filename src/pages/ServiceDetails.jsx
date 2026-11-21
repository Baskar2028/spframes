import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Gallery from "../components/Gallery";
import SectionTitle from "../components/SectionTitle";
import { SERVICES } from "../data/services";
import { IMG } from "../data/media";
import { supabase } from "../lib/supabase";
import { useBooking } from "../components/BookingModal";
export default function ServiceDetails() {
  const { slug } = useParams();
  const service = SERVICES.find((s) => s.slug === slug);
  const [price, setPrice] = useState(null);
  const { openBooking } = useBooking();
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!supabase) return;
      const { data } = await supabase
        .from("services")
        .select("price")
        .eq("slug", slug)
        .maybeSingle();
      if (alive && data) setPrice(data.price);
    }
    load();
    return () => {
      alive = false;
    };
  }, [slug]);
  if (!service)
    return (
      <section className="container not-found">
        <h1>Service not found</h1>
        <Link to="/">Return home</Link>
      </section>
    );
  const shown = price ?? service.price;
  const images = service.gallery.map((k, i) => ({
    src: IMG[k],
    tag: `${service.name} — ${i + 1}`,
  }));
  return (
    <>
      <section
        className="service-hero"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.78),rgba(0,0,0,.24)),url("${IMG[service.imageKey]}")`,
        }}
      >
        <div className="container">
          <span className="eyebrow">SPFRAMES photography</span>
          <h1>
            {service.name.split(" ").slice(0, -1).join(" ")}{" "}
            <em>{service.name.split(" ").slice(-1)}</em>
          </h1>
          <p>{service.description}</p>
          <button
            className="btn btn-gold"
            type="button"
            onClick={() => openBooking(service.name)}
          >
            Enquire on WhatsApp
          </button>
        </div>
      </section>
      <section>
        <div className="container">
          <SectionTitle
            eyebrow="A closer look"
            title={
              <>
                The art of <em>{service.name.toLowerCase()}.</em>
              </>
            }
          >
            {service.description}
          </SectionTitle>
          <Gallery items={images} />
        </div>
      </section>
      <section className="price-section">
        <div className="container price-card">
          <div>
            <span className="eyebrow">Packages & pricing</span>
            <h2>
              Make the moment <em>yours.</em>
            </h2>
            <p>
              Starting package price. Final quote depends on event details and
              coverage requirements.
            </p>
          </div>
          <div className="price-value">
            <span>Starting from</span>
            <strong>₹{Number(shown).toLocaleString("en-IN")}</strong>
            <button
              className="btn btn-gold"
              type="button"
              onClick={() => openBooking(service.name)}
            >
              Book now <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
