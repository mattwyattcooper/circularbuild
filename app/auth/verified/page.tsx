"use client";

import Link from "next/link";

export default function EmailVerifiedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-16 text-white">
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold">All set!</h1>
        <p className="text-sm text-emerald-100/80">
          You can now sign in with your Google account to access CircularBuild.
        </p>
        <Link
          href="/auth"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-400"
        >
          Go to sign in
        </Link>
        <p className="text-xs text-emerald-100/60">
          Need help? Contact us via our{" "}
          <Link href="/contact" className="underline">
            Contact page
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
