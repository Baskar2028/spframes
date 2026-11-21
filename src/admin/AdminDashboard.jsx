import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  BadgeDollarSign,
  CalendarDays,
  CheckCheck,
  Clock3,
  KeyRound,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
export default function AdminDashboard() {
  const [rows, setRows] = useState([]),
    [values, setValues] = useState({}),
    [msg, setMsg] = useState("Loading prices…"),
    [enquiries, setEnquiries] = useState([]),
    [enquiryMsg, setEnquiryMsg] = useState("Loading bookings…"),
    [enquiriesLoading, setEnquiriesLoading] = useState(true),
    [section, setSection] = useState("pricing"),
    [account, setAccount] = useState({
      email: "",
      emailOriginal: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }),
    [accountMessage, setAccountMessage] = useState(""),
    [accountError, setAccountError] = useState(""),
    [accountBusy, setAccountBusy] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    load();
    loadEnquiries();
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        setAccountError(error.message);
        return;
      }
      setAccount((current) => ({
        ...current,
        email: data.user?.email || "",
        emailOriginal: data.user?.email || "",
      }));
    });
  }, []);
  async function load() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("service_name");
    if (error) {
      setMsg(error.message);
      return;
    }
    setRows(data || []);
    setValues(
      Object.fromEntries((data || []).map((r) => [r.slug, String(r.price)])),
    );
    setMsg("");
  }
  async function loadEnquiries() {
    setEnquiriesLoading(true);
    const { data, error } = await supabase
      .from("enquiries")
      .select(
        "id, customer_name, phone, email, service, event_date, message, created_at, status",
      )
      .order("created_at", { ascending: false });
    if (error) {
      setEnquiriesLoading(false);
      setEnquiryMsg(
        `Could not load bookings: ${error.message}. Run the updated supabase/schema.sql to enable booking tracking.`,
      );
      return;
    }
    setEnquiries(data || []);
    setEnquiriesLoading(false);
    setEnquiryMsg("");
  }
  async function save(row) {
    const amount = Number(values[row.slug]);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMsg("Enter a valid price greater than zero.");
      return;
    }
    if (
      !window.confirm(
        `Update ${row.service_name} from ₹${Number(row.price).toLocaleString("en-IN")} to ₹${amount.toLocaleString("en-IN")}?`,
      )
    ) {
      return;
    }
    const { error } = await supabase
      .from("services")
      .update({ price: amount, updated_at: new Date().toISOString() })
      .eq("slug", row.slug);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg(`${row.service_name} price updated.`);
    load();
  }
  async function setBookingStatus(booking, status) {
    const { error } = await supabase
      .from("enquiries")
      .update({ status })
      .eq("id", booking.id);
    if (error) {
      setEnquiryMsg(`Could not update booking: ${error.message}`);
      return;
    }
    setEnquiries((current) =>
      current.map((item) =>
        item.id === booking.id ? { ...item, status } : item,
      ),
    );
    setEnquiryMsg(
      status === "completed"
        ? `${booking.customer_name}'s booking was moved to Completed.`
        : `${booking.customer_name}'s booking was reopened.`,
    );
  }
  async function updateAccount(event) {
    event.preventDefault();
    setAccountMessage("");
    setAccountError("");

    const newEmail = account.email.trim();
    const changeEmail = newEmail !== (account.emailOriginal || "");
    const changePassword = Boolean(account.newPassword);
    if (!changeEmail && !changePassword) {
      setAccountError("Enter a new email address or password to update.");
      return;
    }
    if (!account.currentPassword) {
      setAccountError("Enter your current password to confirm this change.");
      return;
    }
    if (changePassword && account.newPassword.length < 6) {
      setAccountError("Your new password must be at least 6 characters.");
      return;
    }
    if (changePassword && account.newPassword !== account.confirmPassword) {
      setAccountError("The new password and confirmation do not match.");
      return;
    }

    setAccountBusy(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user?.email) {
        throw new Error("Could not verify the signed-in admin account.");
      }
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: account.currentPassword,
      });
      if (verifyError) throw new Error("Current password is incorrect.");

      const updates = {};
      if (changeEmail) updates.email = newEmail;
      if (changePassword) updates.password = account.newPassword;
      const { error: updateError } = await supabase.auth.updateUser(updates);
      if (updateError) throw updateError;

      setAccount((current) => ({
        ...current,
        email: newEmail,
        emailOriginal: newEmail,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setAccountMessage(
        changeEmail
          ? `${changePassword ? "Password updated. " : ""}Check your email inboxes to confirm the address change.`
          : "Password updated successfully.",
      );
    } catch (error) {
      setAccountError(error.message || "Could not update your account. Please try again.");
    } finally {
      setAccountBusy(false);
    }
  }
  async function logoutLocal() {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      setMsg(error.message);
      return;
    }
    nav("/admin/login");
  }
  async function signOutEverywhere() {
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) console.warn("Global sign-out failed:", error.message);
    } catch (error) {
      console.warn("Global sign-out failed:", error);
    }
    clearSupabaseStorage("localStorage");
    clearSupabaseStorage("sessionStorage");
    nav("/admin/login");
  }
  function clearSupabaseStorage(storageName) {
    try {
      const storage = window[storageName];
      const keys = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith("sb-")) keys.push(key);
      }
      keys.forEach((key) => storage.removeItem(key));
    } catch (error) {
      console.warn(`Could not clear Supabase keys from ${storageName}:`, error);
    }
  }
  const visibleBookings = enquiries.filter((item) =>
    section === "completed"
      ? item.status === "completed"
      : item.status !== "completed",
  );
  return (
    <section className="admin-dashboard">
      <div className="container">
        <div className="admin-head">
          <div>
            <span className="eyebrow">Atexra control room</span>
            <h1>
              Studio <em>admin.</em>
            </h1>
            <p>
              Manage service packages and your administrator account.
            </p>
          </div>
          <div className="admin-head-actions">
            <button className="btn" onClick={logoutLocal}>
              Log out
            </button>
            <button className="btn" onClick={signOutEverywhere}>
              Sign out
            </button>
          </div>
        </div>
        <div className="admin-workspace">
          <aside className="admin-sidebar" aria-label="Admin menu">
            <span className="admin-sidebar-label">Workspace</span>
            <button
              className={section === "bookings" ? "active" : ""}
              onClick={() => setSection("bookings")}
            >
              <CalendarDays size={18} />
              Bookings
            </button>
            <button
              className={section === "completed" ? "active" : ""}
              onClick={() => setSection("completed")}
            >
              <CheckCheck size={18} />
              Completed
            </button>
            <button
              className={section === "pricing" ? "active" : ""}
              onClick={() => setSection("pricing")}
            >
              <BadgeDollarSign size={18} />
              Service pricing
            </button>
            <button
              className={section === "account" ? "active" : ""}
              onClick={() => setSection("account")}
            >
              <KeyRound size={18} />
              Account & security
            </button>
            <div className="admin-sidebar-note">
              <ShieldCheck size={17} />
              <span>Protected admin area</span>
            </div>
          </aside>
          <div className="admin-content">
            {section === "pricing" ? (
              <>
                <div className="admin-section-heading">
                  <div>
                    <span className="eyebrow">Manage your packages</span>
                    <h2>Service pricing</h2>
                    <p>Changes appear on the corresponding public service page.</p>
                  </div>
                </div>
                {msg && <p className="form-status">{msg}</p>}
                <div className="admin-table">
                  {rows.length === 0 && !msg
                    ? "No services found. Run supabase/schema.sql first."
                    : rows.map((row) => (
                        <article key={row.slug}>
                          <div className="service-price-summary">
                            <h3>{row.service_name}</h3>
                            <span className="service-current-price">
                              <small>Current price</small>
                              <strong>₹{Number(row.price).toLocaleString("en-IN")}</strong>
                            </span>
                            <small>
                              Last updated:{" "}
                              {row.updated_at
                                ? new Date(row.updated_at).toLocaleString()
                                : "—"}
                            </small>
                          </div>
                          <div className="service-price-edit">
                            <label>
                              New price
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={values[row.slug] || ""}
                                onChange={(e) =>
                                  setValues((v) => ({ ...v, [row.slug]: e.target.value }))
                                }
                              />
                            </label>
                            <button className="btn btn-gold" onClick={() => save(row)}>
                              Save changes
                            </button>
                          </div>
                        </article>
                      ))}
                </div>
              </>
            ) : section === "account" ? (
              <section className="admin-account-panel">
                <div className="admin-section-heading">
                  <div>
                    <span className="eyebrow">Your administrator login</span>
                    <h2>Account & security</h2>
                    <p>Update your own sign-in email or password. No new admin accounts can be registered here.</p>
                  </div>
                </div>
                <form className="admin-account-form" onSubmit={updateAccount}>
                  <label>
                    Admin email
                    <input
                      type="email"
                      autoComplete="email"
                      value={account.email}
                      onChange={(event) =>
                        setAccount((current) => ({ ...current, email: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <div className="admin-account-divider">
                    <span>Change password</span>
                    <small>Leave both fields empty to keep your current password.</small>
                  </div>
                  <label>
                    New password
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={account.newPassword}
                      onChange={(event) =>
                        setAccount((current) => ({ ...current, newPassword: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Confirm new password
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={account.confirmPassword}
                      onChange={(event) =>
                        setAccount((current) => ({ ...current, confirmPassword: event.target.value }))
                      }
                    />
                  </label>
                  <label className="admin-account-confirm">
                    Current password
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={account.currentPassword}
                      onChange={(event) =>
                        setAccount((current) => ({ ...current, currentPassword: event.target.value }))
                      }
                      required
                    />
                    <small>Required to verify your identity before saving.</small>
                  </label>
                  {accountError && <p className="form-status error" role="alert">{accountError}</p>}
                  {accountMessage && <p className="form-status" role="status">{accountMessage}</p>}
                  <button className="btn btn-gold" type="submit" disabled={accountBusy}>
                    {accountBusy ? "Updating account…" : "Update account"}
                  </button>
                </form>
              </section>
            ) : (
              <section className="admin-booking-section">
                <div className="admin-section-heading">
                  <div>
                    <span className="eyebrow">
                      {section === "completed" ? "Your finished work" : "New enquiries"}
                    </span>
                    <h2>{section === "completed" ? "Completed bookings" : "Bookings"}</h2>
                    <p>
                      {section === "completed"
                        ? "A record of bookings you have marked as complete."
                        : "Booking requests submitted through the website. WhatsApp continues to open for customers as before."}
                    </p>
                  </div>
                  <div className="admin-booking-heading-actions">
                    <span className="booking-count">
                      {visibleBookings.length}{" "}
                      {section === "completed" ? "completed" : "open"}
                    </span>
                    <button
                      className="admin-refresh-button"
                      type="button"
                      aria-label="Refresh bookings"
                      title="Refresh bookings"
                      onClick={loadEnquiries}
                      disabled={enquiriesLoading}
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
                {enquiryMsg && <p className="form-status">{enquiryMsg}</p>}
                {!enquiriesLoading &&
                  visibleBookings.length === 0 &&
                  !enquiryMsg.startsWith("Could not") && (
                    <div className="admin-empty-state">
                      <CalendarDays size={26} />
                      <h3>No {section === "completed" ? "completed bookings" : "bookings"} yet</h3>
                      <p>
                        {section === "completed"
                          ? "Bookings marked complete will be kept here for tracking."
                          : "Website booking requests will appear here after they are submitted."}
                      </p>
                    </div>
                )}
                <div className="admin-booking-list">
                  {visibleBookings.map((booking) => (
                  <article className="admin-booking-card" key={booking.id}>
                        <div className="admin-booking-top">
                          <div>
                            <span className={`booking-status ${booking.status === "completed" ? "complete" : ""}`}>
                              {booking.status === "completed" ? (
                                <CheckCheck size={14} />
                              ) : (
                                <Clock3 size={14} />
                              )}
                              {booking.status === "completed" ? "Completed" : "Open"}
                            </span>
                            <h3>{booking.customer_name}</h3>
                            <p>{booking.service}</p>
                          </div>
                          <time dateTime={booking.created_at}>
                            {new Date(booking.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </time>
                        </div>
                        <div className="admin-booking-meta">
                          <a href={`tel:${booking.phone}`}>
                            <Phone size={15} /> {booking.phone}
                          </a>
                          {booking.email && (
                            <a href={`mailto:${booking.email}`}>
                              <Mail size={15} /> {booking.email}
                            </a>
                          )}
                          {booking.event_date && (
                            <span>
                              <CalendarDays size={15} />
                              Event: {new Date(`${booking.event_date}T00:00:00`).toLocaleDateString("en-IN")}
                            </span>
                          )}
                        </div>
                        <details className="admin-booking-details">
                          <summary>View booking details</summary>
                          <p>{booking.message}</p>
                        </details>
                        <div className="admin-booking-actions">
                          <button
                            className={booking.status === "completed" ? "btn" : "btn btn-gold"}
                            onClick={() =>
                              setBookingStatus(
                                booking,
                                booking.status === "completed" ? "pending" : "completed",
                              )
                            }
                          >
                            {booking.status === "completed" ? "Reopen booking" : "Mark complete"}
                          </button>
                        </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
