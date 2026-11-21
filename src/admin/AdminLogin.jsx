import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
export default function AdminLogin() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const nav = useNavigate();
  useEffect(() => {
    let active = true;
    if (!supabase) return () => {
      active = false;
    };
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) nav("/admin/dashboard", { replace: true });
    });
    return () => {
      active = false;
    };
  }, [nav]);
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("Configure Supabase in .env before signing in.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      nav("/admin/dashboard");
    } catch (signInError) {
      setError(signInError.message || "Unable to sign in. Please try again.");
      setBusy(false);
    }
  }
  return (
    <section className="admin-wrap">
      <form className="admin-card" onSubmit={submit}>
        <span className="eyebrow">Private access</span>
        <h1>
          Admin <em>sign in.</em>
        </h1>
        <p>Sign in with an authorised studio administrator account.</p>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="btn btn-gold" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {error && <p className="form-status error">{error}</p>}
        <Link to="/">← Back to website</Link>
      </form>
    </section>
  );
}
