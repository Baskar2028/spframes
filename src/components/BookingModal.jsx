import { createContext, useContext, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { buildBookingMessage, siteConfig, whatsappUrl } from "../config/siteConfig";
import { supabase } from "../lib/supabase";

const BookingContext = createContext(null);
const bookingServices = [
  "Wedding",
  "Prewedding",
  "Postwedding",
  "Birthday",
  "Yellow Festival",
  "Baby Shower",
  "Engagement",
  "Maternity",
  "Baby & Kids",
  "Event",
  "Cinematography",
];
const emptyForm = {
  name: "",
  phone: "",
  email: "",
  service: "",
  eventDate: "",
  location: "",
  guests: "",
  budget: "",
  details: "",
};

function normalizeService(service) {
  if (!service) return "";
  const value = service.toLowerCase();
  if (value.includes("wedding") && value.includes("pre")) return "Prewedding";
  if (value.includes("wedding") && value.includes("post")) return "Postwedding";
  if (value.includes("wedding")) return "Wedding";
  if (value.includes("yellow")) return "Yellow Festival";
  if (value.includes("baby shower")) return "Baby Shower";
  if (value.includes("birthday")) return "Birthday";
  if (value.includes("engagement")) return "Engagement";
  if (value.includes("maternity")) return "Maternity";
  if (value.includes("baby") || value.includes("kids")) return "Baby & Kids";
  if (value.includes("cinematography")) return "Cinematography";
  if (value.includes("event")) return "Event";
  return bookingServices.includes(service) ? service : "";
}

function localDateValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used within BookingProvider.");
  return context;
}

export function BookingProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const closeButton = useRef(null);
  const noticeTimer = useRef(null);

  function showNotice(message) {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 6000);
  }

  function openBooking(service = "") {
    setForm({ ...emptyForm, service: normalizeService(service) });
    setErrors({});
    setSubmitting(false);
    setIsOpen(true);
  }

  function closeBooking() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") closeBooking();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(
    () => () => window.clearTimeout(noticeTimer.current),
    [],
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (form.name.trim().length < 2)
      nextErrors.name = "Enter your name (at least 2 characters).";
    if (form.phone.replace(/\D/g, "").length < 10)
      nextErrors.phone = "Enter a phone number with at least 10 digits.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = "Enter a valid email address.";
    if (!form.service) nextErrors.service = "Choose a service.";
    if (form.eventDate && form.eventDate < localDateValue())
      nextErrors.eventDate = "Event date cannot be in the past.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveEnquiry(message) {
    if (!supabase) return;
    const { error } = await supabase.from("enquiries").insert({
      customer_name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      service: form.service,
      event_date: form.eventDate || null,
      message,
    });
    if (error) {
      showNotice(
        "Thank you! WhatsApp is ready, but we could not save the enquiry online.",
      );
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);

    const details = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      service: form.service,
      eventDate: form.eventDate,
      location: form.location.trim(),
      guests: form.guests.trim(),
      budget: form.budget.trim(),
      details: form.details.trim(),
    };
    const message = buildBookingMessage(details);
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    closeBooking();
    showNotice("Thank you! Your booking details are ready in WhatsApp.");
    try {
      await saveEnquiry(message);
    } catch {
      showNotice(
        "Thank you! WhatsApp is ready, but we could not save the enquiry online.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BookingContext.Provider value={{ openBooking }}>
      {children}
      {isOpen && (
        <div
          className="booking-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeBooking();
          }}
        >
          <section
            className="booking-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
          >
            <header className="booking-header">
              <div>
                <span className="eyebrow">Let's plan your moments</span>
                <h2 id="booking-title">
                  Book your <em>session.</em>
                </h2>
                <p>Share a few details and continue in WhatsApp.</p>
              </div>
              <button
                className="booking-close"
                type="button"
                aria-label="Close booking form"
                onClick={closeBooking}
                ref={closeButton}
              >
                <X />
              </button>
            </header>
            <form className="booking-form" onSubmit={submit} noValidate>
              <label>
                Full name
                <input
                  autoComplete="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={updateField}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "booking-name-error" : undefined}
                />
                {errors.name && (
                  <span className="field-error" id="booking-name-error">
                    {errors.name}
                  </span>
                )}
              </label>
              <label>
                Phone number
                <input
                  autoComplete="tel"
                  inputMode="tel"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={updateField}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={
                    errors.phone ? "booking-phone-error" : undefined
                  }
                />
                {errors.phone && (
                  <span className="field-error" id="booking-phone-error">
                    {errors.phone}
                  </span>
                )}
              </label>
              <label>
                Email <span className="optional-label">Optional</span>
                <input
                  autoComplete="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={updateField}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "booking-email-error" : undefined
                  }
                />
                {errors.email && (
                  <span className="field-error" id="booking-email-error">
                    {errors.email}
                  </span>
                )}
              </label>
              <label>
                Service
                <select
                  name="service"
                  value={form.service}
                  onChange={updateField}
                  aria-invalid={Boolean(errors.service)}
                  aria-describedby={
                    errors.service ? "booking-service-error" : undefined
                  }
                >
                  <option value="">Select a service</option>
                  {bookingServices.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                {errors.service && (
                  <span className="field-error" id="booking-service-error">
                    {errors.service}
                  </span>
                )}
              </label>
              <label>
                Event date
                <input
                  name="eventDate"
                  type="date"
                  min={localDateValue()}
                  value={form.eventDate}
                  onChange={updateField}
                  aria-invalid={Boolean(errors.eventDate)}
                  aria-describedby={
                    errors.eventDate ? "booking-date-error" : undefined
                  }
                />
                {errors.eventDate && (
                  <span className="field-error" id="booking-date-error">
                    {errors.eventDate}
                  </span>
                )}
              </label>
              <label>
                Event location / venue
                <input
                  name="location"
                  placeholder="City, venue or area"
                  value={form.location}
                  onChange={updateField}
                />
              </label>
              <label>
                Expected number of guests
                <input
                  name="guests"
                  type="number"
                  min="1"
                  placeholder="e.g. 150"
                  value={form.guests}
                  onChange={updateField}
                />
              </label>
              <label>
                Package or budget range
                <input
                  name="budget"
                  placeholder="Your preferred range"
                  value={form.budget}
                  onChange={updateField}
                />
              </label>
              <label className="booking-field-full">
                Message / extra details
                <textarea
                  name="details"
                  rows="3"
                  placeholder="Tell us about your event, schedule or vision"
                  value={form.details}
                  onChange={updateField}
                />
              </label>
              <button className="btn btn-gold booking-submit" type="submit" disabled={submitting}>
                {submitting ? "Preparing your enquiry…" : "Continue to WhatsApp"}
              </button>
            </form>
          </section>
        </div>
      )}
      {notice && (
        <div className="booking-toast" role="status">
          {notice}
        </div>
      )}
    </BookingContext.Provider>
  );
}
