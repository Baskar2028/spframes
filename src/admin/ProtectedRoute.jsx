import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
export default function ProtectedRoute({ children }) {
  const [state, setState] = useState("loading");
  useEffect(() => {
    let live = true;
    async function check() {
      if (!supabase) {
        setState("login");
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (live) setState("login");
        return;
      }
      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (live) setState(!error && data ? "allowed" : "login");
    }
    check();
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange(() => check()) || {
      data: { subscription: null },
    };
    return () => {
      live = false;
      subscription?.unsubscribe();
    };
  }, []);
  if (state === "loading")
    return <div className="admin-wrap">Checking access…</div>;
  return state === "allowed" ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
}
