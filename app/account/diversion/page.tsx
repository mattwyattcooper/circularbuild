"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AuthWall from "@/component/AuthWall";
import { getOrganizationBySlug } from "@/lib/organizations";
import { useRequireAuth } from "@/lib/useRequireAuth";

type DiversionSummary = {
  personal: {
    donated: { units: number; listings: number };
    accepted: { units: number; listings: number };
    totalUnits: number;
  };
  organization: {
    slug: string;
    name: string;
    memberCount: number;
    donated: { units: number; listings: number };
    accepted: { units: number; listings: number };
    totalUnits: number;
  } | null;
};

export default function DiversionStatsPage() {
  const authStatus = useRequireAuth();
  const [summary, setSummary] = useState<DiversionSummary | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    setLoading(true);
    (async () => {
      try {
        const response = await fetch("/api/account/diversion", {
          cache: "no-store",
        });
        const data = (await response.json()) as DiversionSummary & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to load stats");
        }
        setSummary(data);
        setMsg("");
      } catch (error) {
        console.error(error);
        const message =
          error instanceof Error ? error.message : "Unable to load stats";
        setMsg(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [authStatus]);

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-emerald-100">
        Loading diversion stats…
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)]" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <AuthWall message="Sign in to view your diversion stats." />
          </div>
        </div>
      </main>
    );
  }

  const personal = summary?.personal;
  const organization = summary?.organization;
  const organizationMeta = getOrganizationBySlug(organization?.slug);

  return (
    <main className="flex flex-col text-white">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(74,222,128,0.35),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Waste diversion
          </span>
          <h1 className="text-[clamp(2.2rem,4vw,3.8rem)] font-extrabold leading-tight">
            Celebrate how much material you and your partners kept in motion.
          </h1>
          <p className="max-w-3xl text-sm text-emerald-100/85 sm:text-base">
            Numbers update each time a listing is marked as procured. Invite
            teammates to affiliate with the same organization to unlock shared
            impact totals.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-emerald-100/80">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-white hover:text-white"
            >
              Update affiliation
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-white hover:text-white"
            >
              Find more materials
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.28),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
          {loading ? (
            <div className="rounded-3xl border border-white/15 bg-white/5 px-6 py-10 text-center text-emerald-100/80 shadow-xl backdrop-blur">
              Crunching the latest diversion data…
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur">
                <h2 className="text-lg font-semibold text-white">
                  Your personal impact
                </h2>
                <p className="mt-2 text-sm text-emerald-100/80">
                  Based on donations you marked procured and materials you’ve
                  accepted through chats.
                </p>
                <dl className="mt-6 space-y-4 text-emerald-100">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <dt className="text-sm">Donations diverted</dt>
                    <dd className="text-xl font-semibold text-white">
                      {personal?.donated.units ?? 0}
                      <span className="ml-1 text-xs text-emerald-100/70">
                        units · {personal?.donated.listings ?? 0} listings
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <dt className="text-sm">Materials accepted</dt>
                    <dd className="text-xl font-semibold text-white">
                      {personal?.accepted.units ?? 0}
                      <span className="ml-1 text-xs text-emerald-100/70">
                        units · {personal?.accepted.listings ?? 0} listings
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                    <dt className="text-sm">Total diversion</dt>
                    <dd className="text-2xl font-bold text-white">
                      {personal?.totalUnits ?? 0} units
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur">
                {organization ? (
                  <>
                    <h2 className="text-lg font-semibold text-white">
                      {organization.name}
                    </h2>
                    <p className="mt-2 text-sm text-emerald-100/80">
                      {organizationMeta?.description ?? "Partner organization"}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.3em] text-emerald-200">
                      {organization.memberCount} members reporting
                    </p>
                    <dl className="mt-6 space-y-4 text-emerald-100">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <dt className="text-sm">Donations diverted</dt>
                        <dd className="text-xl font-semibold text-white">
                          {organization.donated.units}
                          <span className="ml-1 text-xs text-emerald-100/70">
                            units · {organization.donated.listings} listings
                          </span>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <dt className="text-sm">Materials accepted</dt>
                        <dd className="text-xl font-semibold text-white">
                          {organization.accepted.units}
                          <span className="ml-1 text-xs text-emerald-100/70">
                            units · {organization.accepted.listings} listings
                          </span>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                        <dt className="text-sm">Network total</dt>
                        <dd className="text-2xl font-bold text-white">
                          {organization.totalUnits} units
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <div className="flex h-full flex-col gap-4">
                    <h2 className="text-lg font-semibold text-white">
                      Join an organization
                    </h2>
                    <p className="text-sm text-emerald-100/80">
                      Affiliate with a reuse partner to contribute your
                      diversion data toward their collective goals.
                    </p>
                    <Link
                      href="/account"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-white hover:text-white"
                    >
                      Choose affiliation
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {msg && (
            <div className="rounded-3xl border border-rose-200/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-100">
              {msg}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
