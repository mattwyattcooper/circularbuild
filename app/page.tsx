import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import ListingCard, { type ListingCardData } from "@/component/ListingCard";

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
      <section className="relative isolate flex w-full overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?auto=format&fit=crop&w=2000&q=80"
            alt="Deconstruction site"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/65" />
        </div>
        <div className="mx-auto flex w-full flex-col justify-center gap-14 px-6 py-20 sm:px-10 lg:px-20 lg:py-28">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Circular materials marketplace
            </span>
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-tight">
              Route surplus away from landfill and into the projects that need
              it most.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-emerald-100">
              CircularBuild connects contractors, fabricators, and community
              builders with reuse-ready inventories. List donations in minutes,
              preview nearby materials, and track diversion metrics right inside
              the platform.
            </p>
            <div className="flex flex-wrap gap-5 text-sm font-semibold">
              <Link
                href="/search"
                className="text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
              >
                Preview available materials
              </Link>
              <Link
                href="/donate"
                className="text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
              >
                List a donation
              </Link>
              <Link
                href="/who-we-are"
                className="text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
              >
                Meet the network
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-12 text-sm text-emerald-100">
            {FEATURED_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 text-left">
                <span className="text-3xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-[11px] uppercase tracking-[0.3em] text-emerald-200">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="w-full bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Marketplace preview
            </span>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold text-slate-900">
              Explore reuse-ready materials across the network.
            </h2>
            <p className="text-sm text-slate-600">
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 underline decoration-emerald-400 underline-offset-4 hover:text-emerald-700"
            >
              See more available materials
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
              Stories from the field
            </span>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold text-slate-900">
              Donors and builders proving circular works at scale.
            </h2>
            <p className="text-sm text-slate-600">
              Coordinated pickups, transparent chat threads, and impact-ready
              reporting keep reuse simple for both sides of the exchange.
            </p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 underline underline-offset-4 hover:text-emerald-700"
            >
              Read more stories
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid gap-4">
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Training center matches 4,500 sq ft of flooring within 48 hours.
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Verified pickup notes and auto-generated diversion metrics kept
                40 students and nonprofit supervisors on schedule.
              </p>
            </article>
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
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
      </section>

      <section className="w-full bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-tight">
            Ready to keep materials in circulation?
          </h2>
          <p className="text-sm text-emerald-100 max-w-3xl">
            Create an account to publish donations, follow the marketplace, and
            share diversion data with your stakeholders.
          </p>
          <div className="flex flex-wrap gap-5 text-sm font-semibold">
            <Link
              href="/auth"
              className="text-emerald-200 underline underline-offset-4 hover:text-emerald-100"
            >
              Sign in or create an account
            </Link>
            <Link
              href="/contact"
              className="text-emerald-200 underline underline-offset-4 hover:text-emerald-100"
            >
              Talk with the CircularBuild team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
