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
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
        const data = (await response.json()) as {
          error?: string;
          message?: string;
        };
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

  async function handleGoogleSignIn() {
    setMsg("");
    try {
      setGoogleLoading(true);
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const redirectTo = origin
        ? `${origin}/auth${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`
        : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google sign-in failed.";
      setMsg(`Error: ${message}`);
    } finally {
      setGoogleLoading(false);
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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
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
                required
              />
            )}
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input
                className="w-full rounded-lg border px-3 py-2 pr-10"
                type={passwordVisible ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setPasswordVisible((prev) => !prev)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
            </div>
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

            <div className="relative my-4 flex items-center">
              <span className="flex-1 border-t border-gray-200" />
              <span className="mx-3 text-xs uppercase tracking-[0.3em] text-gray-400">
                or
              </span>
              <span className="flex-1 border-t border-gray-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-900 disabled:opacity-70"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-5 w-5"
                aria-hidden
              >
                <title>Google logo</title>
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6 1.54 7.38 2.83l5.04-5.04C33.9 3.58 29.41 1.5 24 1.5 14.71 1.5 6.73 7.79 3.69 16.17l6.66 5.18C11.64 14.5 17.18 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.5c0-1.78-.15-3.5-.43-5.17h-22v9.79h12.67c-.55 2.91-2.21 5.39-4.67 7.05l7.12 5.52C43.85 37.88 46.5 31.73 46.5 24.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.35 28.35c-.5-1.45-.79-3-.79-4.6 0-1.61.29-3.15.78-4.6l-6.66-5.18C1.74 17.32.5 20.56.5 24c0 3.44 1.23 6.68 3.18 9.43l6.67-5.08z"
                />
                <path
                  fill="#34A853"
                  d="M24 46.5c6.33 0 11.66-2.09 15.55-5.69l-7.12-5.52c-2 1.36-4.55 2.18-7.43 2.18-5.82 0-10.66-3.93-12.41-9.17l-6.67 5.08C6.73 40.21 14.71 46.5 24 46.5z"
                />
              </svg>
              {googleLoading ? "Signing in…" : "Continue with Google"}
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
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
          Loading account tools…
        </main>
      }
    >
      <AuthPageInner />
    </Suspense>
  );
}
