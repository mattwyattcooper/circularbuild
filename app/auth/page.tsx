"use client";

import type { Session } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [msg, setMsg] = useState("");
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => {
    const value = searchParams?.get("next") || "/";
    return value.startsWith("/") ? value : "/";
  }, [searchParams]);

  async function handleSubmit() {
    setMsg("");
    try {
      const baseUrl = (
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      ).replace(/\/$/, "");
      const redirectSuffix =
        nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : "";
      const emailRedirectTo = `${baseUrl}/auth${redirectSuffix}`;

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo,
            data: name.trim() ? { full_name: name.trim() } : undefined,
          },
        });
        if (error) throw error;
        const user = data.user;
        if (user) {
          try {
            await fetch("/api/profile/init", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: user.id, name }),
            });
          } catch (profileError) {
            console.error("Profile init failed", profileError);
          }
        }
        setMsg(
          `Check ${email} for a confirmation link. Once verified, sign in to continue.`,
        );
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMsg("Signed in! Redirecting...");
        window.location.href = nextPath;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setMsg(`Error: ${message}`);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMsg("Signed out.");
  }

  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 rounded-2xl bg-white shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Account</h1>

        {session ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Signed in as {session.user.email}
            </div>
            <button
              type="button"
              className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === "signup" && (
              <input
                className="w-full px-3 py-2 rounded-lg border"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              className="w-full px-3 py-2 rounded-lg border"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 rounded-lg border"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="w-full px-4 py-2 rounded-lg bg-emerald-600 text-white"
              onClick={handleSubmit}
            >
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 rounded-lg border"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup"
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </button>
          </div>
        )}

        {msg && <div className="text-sm text-gray-700 mt-3">{msg}</div>}
      </div>
    </main>
  );
}
