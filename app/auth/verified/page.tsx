"use client";

import Link from "next/link";
import { useEffect } from "react";

import { supabase } from "@/lib/supabaseClient";

export default function EmailVerifiedPage() {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const next = currentUrl.searchParams.get("next");
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
      `${window.location.pathname}${next?.startsWith("/") ? `?next=${encodeURIComponent(next)}` : ""}`,
    );
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-16 text-white">
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold">Email verified!</h1>
        <p className="text-sm text-emerald-100/80">
          Thanks for confirming your email. You&apos;re all set to explore
          CircularBuild, connect with donors, and keep materials moving.
        </p>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-400"
        >
          Return to homepage
        </Link>
        <p className="text-xs text-emerald-100/60">
          Need help? Contact us via our{" "}
          <a href="/contact" className="underline">
            Contact page
          </a>
          .
        </p>
      </div>
    </main>
  );
}
