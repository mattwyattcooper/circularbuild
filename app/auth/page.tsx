"use client";

import type { Session } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { supabase } from "../../lib/supabaseClient";

function AuthPageInner() {
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
      if (mode === "signup") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name,
            nextPath,
          }),
        });
        const data = (await response.json()) as { error?: string; message?: string };
        if (!response.ok) {
          throw new Error(data?.error || "Sign up failed.");
        }
        setMsg(
          data?.message ||
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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 text-slate-800">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-bold text-slate-900">Account</h1>

        {session ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Signed in as {session.user.email}
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === "signup" && (
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white"
              onClick={handleSubmit}
            >
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
            <button
              type="button"
              className="w-full rounded-lg border px-4 py-2"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup"
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </button>
          </div>
        )}

        {msg && <div className="mt-3 text-sm text-gray-700">{msg}</div>}
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50 text-slate-600">
          Loading account tools…
        </main>
      }
    >
      <AuthPageInner />
    </Suspense>
  );
}
