"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import ListingCard from "@/component/ListingCard";
import { useParallax } from "@/lib/useParallax";

const CATEGORY_CHIPS = [
  "Lumber",
  "Steel",
  "Fixtures",
  "Finishes",
  "Concrete",
  "Reclaimed",
  "Nonprofit priorities",
  "Campus builds",
  "Humanitarian",
  "Fabrication",
];

const FEATURED_STATS = [
  { label: "Materials diverted", value: "2.8M lbs" },
  { label: "Active donors", value: "640" },
  { label: "Avg. pickup time", value: "3.5 days" },
];

const HOW_IT_WORKS = [
  {
    title: "List what you have",
    copy: "Upload photos, add availability windows, and note pickup requirements in minutes.",
  },
  {
    title: "Match with crews",
    copy: "Builders filter by specs or region and save what they need before chatting in-app.",
  },
  {
    title: "Move it to reuse",
    copy: "Coordinate logistics, track diversion metrics, and celebrate the project outcome.",
  },
];

const TRUST_PROPS = [
  {
    title: "Verified nonprofits & partners",
    copy: "All recipients pass compliance checks so donations go to impact-ready teams.",
  },
  {
    title: "Diversion impact tracking",
    copy: "Automatic reporting gives you tonnage, CO₂ savings, and circular stories.",
  },
  {
    title: "Support when you need it",
    copy: "Office hours, response SLAs, and templates keep every handoff smooth.",
  },
];

const PLACEHOLDER_LISTINGS = Array.from({ length: 8 }).map((_, idx) => ({
  id: `placeholder-${idx}`,
  title: `Reclaimed lumber lot ${idx + 1}`,
  image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd",
  tags: ["Wood", "Dimensional"],
  location: "Seattle, WA",
  available: "Pickup in 3 days",
}));

export default function Home() {
  const [material, setMaterial] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [date, setDate] = useState("");

  const heroBgRef = useParallax(0.18);
  const howItWorksRef = useParallax(0.1);
  const materialsRef = useParallax(0.14);

  const heroForm = (
    <form
      className="grid grid-cols-1 divide-y divide-slate-200 text-sm sm:grid-cols-5 sm:divide-y-0 sm:divide-x"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex flex-col gap-1 px-5 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          Material / Category
        </span>
        <input
          className="border-none bg-transparent text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          placeholder="Any material"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          aria-label="Material or category"
        />
      </label>
      <label className="flex flex-col gap-1 px-5 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          Location / Region
        </span>
        <input
          className="border-none bg-transparent text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          placeholder="Near me"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Location or region"
        />
      </label>
      <label className="flex flex-col gap-1 px-5 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          Condition / Quantity
        </span>
        <input
          className="border-none bg-transparent text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          placeholder="Any"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          aria-label="Condition or quantity"
        />
      </label>
      <label className="flex flex-col gap-1 px-5 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          Available by
        </span>
        <input
          type="date"
          className="border-none bg-transparent text-base font-semibold text-slate-900 focus:outline-none"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Available by date"
        />
      </label>
      <div className="flex items-center justify-center px-5 py-4">
        <button
          type="submit"
          className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Search
        </button>
      </div>
    </form>
  );

  return (
    <div className="snap-y snap-mandatory">
      {/* Hero Section */}
      <section className="relative isolate flex min-h-screen w-full flex-col overflow-hidden bg-slate-900 text-white snap-start">
        <div ref={heroBgRef} className="absolute inset-0 -z-10 opacity-80">
          <Image
            src="https://images.unsplash.com/photo-1523419409543-0c1df022bdd1"
            alt="Deconstruction site with reclaimed materials"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60" />
        </div>
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center gap-12 px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Circular materials marketplace
            </span>
            <h1 className="text-[clamp(2.8rem,6vw,4.75rem)] font-extrabold leading-tight">
              Route surplus away from landfill and into the projects that need
              it most.
            </h1>
            <p className="text-lg leading-8 text-emerald-100">
              Discover reuse-ready inventories, list excess materials in
              minutes, and track your diversion impact alongside partners across
              North America.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/90 shadow-2xl backdrop-blur transition hover:shadow-brand">
            {heroForm}
          </div>
          <div className="flex items-center gap-6 text-sm text-emerald-100">
            {FEATURED_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col text-left">
                <span className="text-3xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 bg-white/90 py-3 shadow-inner">
          <div className="mx-auto flex max-w-[1200px] items-center gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {CATEGORY_CHIPS.map((chip) => (
              <button
                key={chip}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600"
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative isolate w-full min-h-[70vh] overflow-hidden bg-white snap-start">
        <div ref={howItWorksRef} className="absolute inset-0 -z-10 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1516239325003-4002c7994185"
            alt="Reclaimed materials texture"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/60" />
        </div>
        <div className="mx-auto flex h-full max-w-[1200px] flex-col justify-center gap-12 px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-600">
              How it works
            </span>
            <h2 className="text-[clamp(2.4rem,4vw,3.6rem)] font-bold text-slate-900">
              Every listing powers a circular success story.
            </h2>
            <p className="text-lg leading-8 text-slate-600">
              From deconstruction crews to studio makerspaces, the platform
              keeps each step transparent so everyone stays aligned.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm text-slate-600 leading-6">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top materials / categories */}
      <section className="relative isolate w-full min-h-screen overflow-hidden bg-slate-900 text-white snap-start">
        <div ref={materialsRef} className="absolute inset-0 -z-10 opacity-70">
          <Image
            src="https://images.unsplash.com/photo-1463100099107-aa0980c362e6"
            alt="Warehouse of reclaimed materials"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/60" />
        </div>
        <div className="mx-auto flex h-full max-w-[1200px] flex-col justify-center gap-8 px-4 py-24 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Browse inventory
            </span>
            <h2 className="text-[clamp(2.4rem,4vw,3.6rem)] font-bold leading-tight">
              Top categories trending with builders this month.
            </h2>
            <p className="text-lg leading-8 text-emerald-100 max-w-3xl">
              New listings drop daily. Browse by material type, region, or
              verified nonprofit needs to see how surplus aligns with current
              demand.
            </p>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto pb-3">
            {CATEGORY_CHIPS.map((chip) => (
              <button
                key={`carousel-${chip}`}
                className="shrink-0 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                type="button"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PLACEHOLDER_LISTINGS.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Impact metrics & trust */}
      <section className="w-full min-h-[60vh] bg-white snap-start">
        <div className="mx-auto flex h-full max-w-[1200px] flex-col justify-center gap-10 px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-600">
              Impact you can measure
            </span>
            <h2 className="text-[clamp(2.3rem,4vw,3.3rem)] font-bold text-slate-900">
              Teams rely on CircularBuild to track diversion and win more work.
            </h2>
            <p className="text-lg leading-8 text-slate-600">
              Each transfer unlocks reporting, storytelling assets, and better
              procurement for the next build.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TRUST_PROPS.map((prop) => (
              <div
                key={prop.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-xl font-semibold text-slate-900">
                  {prop.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-6">
                  {prop.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories & news highlights */}
      <section className="w-full min-h-screen bg-slate-900 text-white snap-start">
        <div className="mx-auto flex h-full max-w-[1200px] flex-col justify-center gap-12 px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-200">
              Stories from the field
            </span>
            <h2 className="text-[clamp(2.3rem,4vw,3.4rem)] font-bold leading-tight">
              Donor and builder spotlights proving circular works at scale.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <article className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1">
              <Image
                src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99"
                alt="Community build"
                width={720}
                height={480}
                className="h-48 w-full rounded-2xl object-cover"
              />
              <div className="mt-4 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  Builder success
                </p>
                <h3 className="text-2xl font-semibold">
                  Salvaged flooring fuels vocational training center, cutting 6
                  months of lead time.
                </h3>
                <p className="text-sm text-emerald-100">
                  Coordinated pickup, logistics templates, and chat transcripts
                  kept 40 students on schedule with nonprofit supervisors.
                </p>
              </div>
            </article>
            <article className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1">
              <Image
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b"
                alt="Donor warehouse"
                width={720}
                height={480}
                className="h-48 w-full rounded-2xl object-cover"
              />
              <div className="mt-4 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  Donor win
                </p>
                <h3 className="text-2xl font-semibold">
                  Deconstruction partner diverts 22 tons of structural timber in
                  one weekend.
                </h3>
                <p className="text-sm text-emerald-100">
                  Verified pickup notes, QR code check-ins, and automated
                  diversion reports streamlined the process for all crews
                  involved.
                </p>
              </div>
            </article>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-emerald-200">
              Latest news
            </h3>
            <p className="mt-2 text-sm text-emerald-100">
              Get deeper with research, policy wins, and platform insights.
            </p>
            <Link
              href="/news"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              Read the briefing room
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="w-full min-h-[60vh] bg-white snap-start">
        <div className="mx-auto flex h-full max-w-[1200px] flex-col justify-center gap-8 px-4 py-24 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-600">
              Ready to start?
            </span>
            <h2 className="text-[clamp(2.2rem,3.5vw,3.2rem)] font-semibold text-slate-900">
              Join the reuse network bridging donors, builders, and community
              wins.
            </h2>
            <p className="text-lg leading-8 text-slate-600 max-w-3xl">
              Create an account to list materials, access marketplace signals,
              and coordinate transfers with verified partners.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/donate"
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
            >
              List materials
            </Link>
            <Link
              href="/search"
              className="rounded-full border border-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
            >
              Explore marketplace
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600"
            >
              Become a partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
