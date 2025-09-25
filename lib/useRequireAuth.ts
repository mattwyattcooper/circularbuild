"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export function useRequireAuth() {
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setStatus(data.session ? "authenticated" : "unauthenticated");
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setStatus(session ? "authenticated" : "unauthenticated");
      },
    );

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  return status;
}
