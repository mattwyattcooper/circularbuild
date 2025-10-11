"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

export default function EmailVerifiedPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/");

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const next = currentUrl.searchParams.get("next");
    if (next && next.startsWith("/")) {
      setNextPath(next);
    }
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (accessToken && refreshToken) {
      void supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${next && next.startsWith("/") ? `?next=${encodeURIComponent(next)}` : ""}`,
    );
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-16 text-white">
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold">Email verified!</h1>
        <p className="text-sm text-emerald-100/80">
          Thanks for confirming your email. You can now sign in and start using
          CircularBuild to browse materials, create listings, and coordinate
          pickups.
        </p>
        <div className="space-y-3">
          <Link
            href="/auth"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-400"
          >
            Go to sign in
          </Link>
          <button
            type="button"
            className="w-full rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-emerald-100/90 transition hover:border-white hover:text-white"
            onClick={() => {
              if (window.opener) {
                window.close();
              } else {
                router.push(nextPath || "/");
              }
            }}
          >
            Close this window
          </button>
        </div>
        <p className="text-xs text-emerald-100/60">
          Need help? Contact us via our <a href="/contact" className="underline">Contact page</a>.
        </p>
      </div>
    </main>
  );
}
