import { useState } from "react";
import { Mail, Phone, MapPin, Instagram, Send } from "lucide-react";
import { siteConfig, whatsappUrl } from "../config/siteConfig";
import { supabase } from "../lib/supabase";
export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    event_date: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setStatus("");
    if (
      form.name.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
      form.phone.replace(/\D/g, "").length < 10 ||
      form.message.trim().length < 10
    ) {
      setStatus("Please complete all fields with valid details.");
      return;
    }
    setBusy(true);
    try {
      if (!supabase)
        throw new Error(
          "Supabase is not configured. Please contact us directly on WhatsApp.",
        );
      const { error } = await supabase
        .from("enquiries")
        .insert([
          {
            customer_name: form.name,
            phone: form.phone,
            email: form.email,
            service: form.service,
            event_date: form.event_date || null,
            message: form.message,
          },
        ]);
      if (error) throw error;
      setStatus("Thank you. Your enquiry has been received.");
      setForm({
        name: "",
        phone: "",
        email: "",
        service: "",
        event_date: "",
        message: "",
      });
    } catch (err) {
      setStatus(
        err.message || "Could not submit your enquiry. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Let's connect</span>
          <h1>
            Every great story
            <br />
            <em>starts with hello.</em>
          </h1>
          <p>
            Tell us what you are celebrating. We will help you plan the frames.
          </p>
        </div>
      </section>
      <section>
        <div className="container contact-grid">
          <div>
            <span className="eyebrow">Contact details</span>
            <h2>
              We'd love to <em>hear from you.</em>
            </h2>
            <div className="contact-info">
              <a href={`tel:${siteConfig.whatsappNumber}`}>
                <Phone />
                <span>
                  <small>Call us</small>
                  {siteConfig.phoneDisplay}
                </span>
              </a>
              <a href={`mailto:${siteConfig.email}`}>
                <Mail />
                <span>
                  <small>Email</small>
                  {siteConfig.email}
                </span>
              </a>
              <div>
                <MapPin />
                <span>
                  <small>Studio</small>
                  {siteConfig.address}
                </span>
              </div>
              <a href={siteConfig.instagram} target="_blank" rel="noreferrer">
                <Instagram />
                <span>
                  <small>Instagram</small>@spframes
                </span>
              </a>
            </div>
            <a
              className="btn btn-gold"
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </a>
          </div>
          <form className="contact-form" onSubmit={submit}>
            <span className="eyebrow">Send an enquiry</span>
            <h2>
              Tell us about <em>your event.</em>
            </h2>
            <div className="form-grid">
              {[
                ["name", "Your name", "text"],
                ["phone", "Phone number", "tel"],
                ["email", "Email address", "email"],
              ].map(([n, l, type]) => (
                <label key={n}>
                  {l}
                  <input
                    name={n}
                    type={type}
                    value={form[n]}
                    onChange={update}
                    required
                  />
                </label>
              ))}
              <label>
                Photography service
                <select
                  name="service"
                  value={form.service}
                  onChange={update}
                  required
                >
                  <option value="">Select a service</option>
                  {[
                    "Wedding",
                    "Prewedding",
                    "Postwedding",
                    "Birthday",
                    "Yellow Festival",
                    "Baby Shower",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Event date
                <input
                  type="date"
                  name="event_date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.event_date}
                  onChange={update}
                />
              </label>
              <label className="full">
                Message
                <textarea
                  name="message"
                  rows="4"
                  minLength="10"
                  value={form.message}
                  onChange={update}
                  required
                />
              </label>
            </div>
            <button className="btn btn-gold" disabled={busy}>
              {busy ? "Sending…" : "Send enquiry"} <Send size={16} />
            </button>
            {status && (
              <p className="form-status" role="status">
                {status}
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
