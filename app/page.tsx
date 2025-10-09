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
    .select("id, title, type, shape, location_text, available_until, photos")
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
  }));

  const hasLiveListings = cards.length > 0;

  return (
    <main className="flex flex-col gap-16 bg-white pb-16">
      <HeroSection stats={FEATURED_STATS} />

      <section className="w-full bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">
              Where do you want to go next?
            </h2>
            <p className="text-sm text-slate-600">
              Move between marketplace, donor tools, and learning resources with
              a single account.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {QUICK_NAV.map((item) => (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  className="text-base font-semibold text-emerald-600 underline underline-offset-4 hover:text-emerald-700"
                >
                  {item.label}
                </Link>
                <p className="text-xs text-slate-600 leading-5">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Stacks of reclaimed timber organized inside a warehouse"
        overlayClassName="bg-slate-950/70"
        className="py-16"
        speed={0.12}
        maxOffset={140}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
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
        overlayClassName="bg-emerald-950/70"
        className="py-20"
        speed={0.18}
        maxOffset={180}
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
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
            <article className="rounded-2xl border border-white/20 bg-white/90 p-6 text-slate-900 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-semibold">
                Training center matches 4,500 sq ft of flooring within 48 hours.
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Verified pickup notes and auto-generated diversion metrics kept
                40 students and nonprofit supervisors on schedule.
              </p>
            </article>
            <article className="rounded-2xl border border-white/20 bg-white/90 p-6 text-slate-900 shadow-lg backdrop-blur-sm">
              <h3 className="text-lg font-semibold">
                Deconstruction partner diverts 22 tons of structural timber in
                one weekend.
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Logistics templates, QR code check-ins, and in-app messaging
                streamlined the entire handoff.
              </p>
            </article>
          </div>
        </div>
      </ParallaxSection>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1451976426598-a7593bd6d0b2?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Community volunteers unloading reclaimed construction materials"
        overlayClassName="bg-slate-950/75"
        className="py-16"
        speed={0.14}
        maxOffset={160}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8 text-white">
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
