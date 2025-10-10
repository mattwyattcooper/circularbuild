import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";

import HeroSection from "@/component/HeroSection";
import ListingCard, { type ListingCardData } from "@/component/ListingCard";
import ParallaxSection from "@/component/ParallaxSection";

const QUICK_NAV = [
  {
    label: "Explore marketplace",
    description: "Preview reuse-ready materials before you create an account.",
    href: "/search",
  },
  {
    label: "Donate materials",
    description: "List surplus and coordinate pickups in minutes.",
    href: "/donate",
  },
  {
    label: "Read the briefing room",
    description: "Policy wins, project spotlights, and platform data.",
    href: "/news",
  },
  {
    label: "Get support",
    description: "FAQs, guidelines, and direct contact with our team.",
    href: "/faqs",
  },
];

const FEATURED_STATS = [
  { label: "Materials diverted", value: "2.8M lbs" },
  { label: "Active donors", value: "640" },
  { label: "Avg. pickup time", value: "3.5 days" },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72";

const PLACEHOLDER_CARDS: ListingCardData[] = [
  {
    id: "placeholder-a",
    title: "Reclaimed lumber bundle",
    image: FALLBACK_IMAGE,
    tags: ["Wood"],
    location: "Join to view",
    availableLabel: "Availability shared after sign in",
  },
  {
    id: "placeholder-b",
    title: "Steel beams, assorted",
    image: FALLBACK_IMAGE,
    tags: ["Steel"],
    location: "Join to view",
    availableLabel: "Availability shared after sign in",
  },
  {
    id: "placeholder-c",
    title: "Fixtures & lighting lot",
    image: FALLBACK_IMAGE,
    tags: ["Fixtures"],
    location: "Join to view",
    availableLabel: "Availability shared after sign in",
  },
  {
    id: "placeholder-d",
    title: "Composite decking surplus",
    image: FALLBACK_IMAGE,
    tags: ["Decking"],
    location: "Join to view",
    availableLabel: "Availability shared after sign in",
  },
];

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, title, type, shape, location_text, available_until, photos, owner:profiles(id,name,avatar_url)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);

  const cards: ListingCardData[] = (listings ?? []).map((listing) => ({
    id: listing.id,
    title: listing.title,
    image: listing.photos?.[0] ?? FALLBACK_IMAGE,
    tags: [listing.type, listing.shape].filter(Boolean),
    location: listing.location_text,
    availableLabel: listing.available_until
      ? `Available until ${listing.available_until}`
      : undefined,
    owner: listing.owner
      ? {
          id: listing.owner.id,
          name: listing.owner.name,
          avatarUrl: listing.owner.avatar_url,
        }
      : undefined,
  }));

  const hasLiveListings = cards.length > 0;

  return (
    <main className="flex flex-col">
      <HeroSection stats={FEATURED_STATS} />

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-tr from-emerald-900 via-emerald-800 to-slate-900 py-12 text-white sm:py-14 lg:py-16">
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
          <div className="space-y-5">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Navigate the platform
            </span>
            <h2 className="text-[clamp(2.25rem,3vw,3.5rem)] font-bold leading-tight">
              Where do you want to go next?
            </h2>
            <p className="max-w-xl text-base text-emerald-100 sm:text-lg">
              Move seamlessly between marketplace browsing, donor tools, and
              learning resources with a single account.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {QUICK_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-5 transition duration-200 hover:border-white/25 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              >
                <div className="flex h-full flex-col gap-3">
                  <span className="text-base font-semibold text-white sm:text-lg">
                    {item.label}
                  </span>
                  <p className="text-sm text-emerald-100 leading-6">
                    {item.description}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200 transition group-hover:translate-x-1">
                    Explore
                    <span aria-hidden>→</span>
                  </span>
                </div>
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Stacks of reclaimed timber organized inside a warehouse"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.2}
        maxOffset={180}
      >
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center gap-8 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="space-y-3 text-white">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Marketplace preview
            </span>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold">
              Explore reuse-ready materials across the network.
            </h2>
            <p className="text-sm text-emerald-100 sm:text-base">
              Preview a handful of active donations below. Sign in when
              you&apos;re ready to save listings, chat with donors, or
              coordinate pickups.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hasLiveListings
              ? cards.map((card) => (
                  <ListingCard key={card.id} listing={card} />
                ))
              : PLACEHOLDER_CARDS.map((card) => (
                  <ListingCard
                    key={card.id}
                    listing={{
                      ...card,
                      footer: (
                        <Link
                          href="/search"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 underline"
                        >
                          Preview in marketplace
                          <span aria-hidden>→</span>
                        </Link>
                      ),
                    }}
                  />
                ))}
          </div>
          <div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-100"
            >
              See more available materials
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </ParallaxSection>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Crew lifting reclaimed steel beams on a job site"
        overlayClassName="bg-emerald-950/65"
        className="mt-[-1px]"
        speed={0.24}
        maxOffset={220}
      >
        <div className="mx-auto grid min-h-[60vh] max-w-6xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="space-y-4 text-white">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Stories from the field
            </span>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold">
              Donors and builders proving circular works at scale.
            </h2>
            <p className="text-sm text-emerald-100 sm:text-base">
              Coordinated pickups, transparent chat threads, and impact-ready
              reporting keep reuse simple for both sides of the exchange.
            </p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 underline underline-offset-4 hover:text-emerald-100"
            >
              Read more stories
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid gap-4">
            <article className="rounded-2xl border border-white/30 bg-white/15 p-6 text-white shadow-lg backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white">
                Training center matches 4,500 sq ft of flooring within 48 hours.
              </h3>
              <p className="mt-3 text-sm text-emerald-50/90">
                Verified pickup notes and auto-generated diversion metrics kept
                40 students and nonprofit supervisors on schedule.
              </p>
            </article>
            <article className="rounded-2xl border border-white/30 bg-white/15 p-6 text-white shadow-lg backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-white">
                Deconstruction partner diverts 22 tons of structural timber in
                one weekend.
              </h3>
              <p className="mt-3 text-sm text-emerald-50/90">
                Logistics templates, QR code check-ins, and in-app messaging
                streamlined the entire handoff.
              </p>
            </article>
          </div>
        </div>
      </ParallaxSection>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Community volunteers unloading reclaimed construction materials"
        overlayClassName="bg-slate-950/40"
        className="mt-[-1px]"
        speed={0.22}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[55vh] max-w-6xl flex-col justify-center gap-6 px-4 py-12 text-white sm:px-6 md:py-16 lg:px-8">
          <h2 className="text-[clamp(2rem,3.2vw,3.4rem)] font-semibold leading-tight">
            Ready to keep materials in circulation?
          </h2>
          <p className="max-w-3xl text-sm text-emerald-100 sm:text-base">
            Create an account to publish donations, follow the marketplace, and
            share diversion data with your stakeholders.
          </p>
          <div className="flex flex-wrap gap-5 text-sm font-semibold">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white shadow-md transition hover:bg-emerald-500"
            >
              Sign in or create an account
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-white transition hover:border-white hover:bg-white/10"
            >
              Talk with the CircularBuild team
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </ParallaxSection>
    </main>
  );
}
