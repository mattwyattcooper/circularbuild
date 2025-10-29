"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import type { FormEvent } from "react";
import { Suspense, useMemo, useState } from "react";

function AuthPageInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "credentials" | null
  >(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");

  const nextPath = useMemo(() => {
    const value = searchParams?.get("next") || "/";
    return value.startsWith("/") ? value : "/";
  }, [searchParams]);

  const message =
    status === "authenticated"
      ? `Signed in as ${session?.user?.email ?? session?.user?.name ?? "your account"}`
      : "Sign in with Google or use your CircularBuild credentials.";

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loadingProvider) return;
    setFeedback("");
    setLoadingProvider("credentials");

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, nextPath }),
        });
        const data = (await response.json()) as {
          error?: string;
          message?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Signup failed.");
        }
        setFeedback(
          data.message ??
            `Check ${email} for a confirmation link. Once verified, sign in to continue.`,
        );
        setMode("signin");
      } else {
        const result = await signIn("credentials", {
          email,
          password,
          callbackUrl: nextPath,
          redirect: false,
        });
        if (result?.error) {
          throw new Error(result.error);
        }
        setFeedback("Signed in! Redirecting…");
        if (result?.url) {
          router.push(result.url);
        } else {
          router.push(nextPath);
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setFeedback(`Error: ${message}`);
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-bold text-slate-900">
          Account access
        </h1>
        <p className="mb-6 text-sm text-slate-600">{message}</p>

        {status === "authenticated" ? (
          <div className="space-y-3">
            <button
              type="button"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={async () => {
                setLoadingProvider("google");
                try {
                  await signIn("google", {
                    callbackUrl: nextPath,
                  });
                } finally {
                  setLoadingProvider(null);
                }
              }}
              disabled={loadingProvider === "google"}
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
              {loadingProvider === "google"
                ? "Signing in…"
                : "Continue with Google"}
            </button>

            <div className="relative flex items-center">
              <span className="flex-1 border-t border-gray-200" />
              <span className="mx-3 text-xs uppercase tracking-[0.3em] text-gray-400">
                or
              </span>
              <span className="flex-1 border-t border-gray-200" />
            </div>

            <form className="space-y-3" onSubmit={handleEmailSubmit}>
              {mode === "signup" && (
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              )}
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-70"
                disabled={loadingProvider === "credentials"}
              >
                {loadingProvider === "credentials"
                  ? mode === "signup"
                    ? "Creating account…"
                    : "Signing in…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </button>
              <button
                type="button"
                className="w-full rounded-lg border px-4 py-2 text-sm"
                onClick={() => {
                  setFeedback("");
                  setMode(mode === "signup" ? "signin" : "signup");
                }}
              >
                {mode === "signup"
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}
              </button>
            </form>

            {feedback && <p className="text-sm text-slate-600">{feedback}</p>}
          </div>
        )}
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
