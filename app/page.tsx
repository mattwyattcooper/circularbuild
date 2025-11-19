// @ts-nocheck
import Link from "next/link";

import HeroSection from "@/component/HeroSection";
import ListingCard, { type ListingCardData } from "@/component/ListingCard";
import { calculateCo2eKg, summarizeListingMaterials } from "@/lib/diversion";
import { expirePastListings } from "@/lib/listings";
import { getOrganizationBySlug } from "@/lib/organizations";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

const QUICK_NAV = [
  {
    label: "Explore marketplace",
    description:
      "Preview donation-powered inventories and see what the community is sharing right now.",
    href: "/search",
  },
  {
    label: "Donate materials",
    description:
      "Post surplus items, schedule pickups, and document every donation in one workflow.",
    href: "/donate",
  },
  {
    label: "Read the briefing room",
    description:
      "Policy wins, donor spotlights, and the data behind high-impact reuse.",
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
    totalWeightLbs: 1800,
    totalCo2eKg: calculateCo2eKg("Wood (dimensional lumber)", 1800),
    materials: [
      {
        type: "Wood (dimensional lumber)",
        weight_lbs: 1800,
        co2e_kg: calculateCo2eKg("Wood (dimensional lumber)", 1800),
      },
    ],
    saleType: "donation",
  },
  {
    id: "placeholder-b",
    title: "Steel beams, assorted",
    image: FALLBACK_IMAGE,
    tags: ["Steel"],
    location: "Join to view",
    availableLabel: "Availability shared after sign in",
    totalWeightLbs: 2400,
    totalCo2eKg: calculateCo2eKg("Steel (structural, generic carbon)", 2400),
    materials: [
      {
        type: "Steel (structural, generic carbon)",
        weight_lbs: 2400,
        co2e_kg: calculateCo2eKg("Steel (structural, generic carbon)", 2400),
      },
    ],
    saleType: "donation",
  },
  {
    id: "placeholder-c",
    title: "Fixtures & lighting lot",
    image: FALLBACK_IMAGE,
    tags: ["Fixtures"],
    location: "Join to view",
    availableLabel: "Availability shared after sign in",
    totalWeightLbs: 600,
    totalCo2eKg: calculateCo2eKg("Plastic PET (#1)", 600),
    materials: [
      {
        type: "Plastic PET (#1)",
        weight_lbs: 600,
        co2e_kg: calculateCo2eKg("Plastic PET (#1)", 600),
      },
    ],
    saleType: "donation",
  },
  {
    id: "placeholder-d",
    title: "Composite decking surplus",
    image: FALLBACK_IMAGE,
    tags: ["Decking"],
    location: "Join to view",
    availableLabel: "Availability shared after sign in",
    totalWeightLbs: 950,
    totalCo2eKg: calculateCo2eKg("Plastic PVC (#3)", 950),
    materials: [
      {
        type: "Plastic PVC (#3)",
        weight_lbs: 950,
        co2e_kg: calculateCo2eKg("Plastic PVC (#3)", 950),
      },
    ],
    saleType: "donation",
  },
  {
    id: "placeholder-e",
    title: "HVAC equipment bundle",
    image: FALLBACK_IMAGE,
    tags: ["Mechanical"],
    location: "Join to view",
    availableLabel: "Availability shared after sign in",
    totalWeightLbs: 1200,
    totalCo2eKg: calculateCo2eKg("Steel (structural, generic carbon)", 1200),
    materials: [
      {
        type: "Steel (structural, generic carbon)",
        weight_lbs: 1200,
        co2e_kg: calculateCo2eKg("Steel (structural, generic carbon)", 1200),
      },
    ],
    saleType: "donation",
  },
];

function buildExcerpt(body: string, limit = 160) {
  const plain = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\(([^)]*)\)/g, "$1")
    .replace(/[>#*_~`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > limit ? `${plain.slice(0, limit - 1)}…` : plain;
}

function formatAvailableUntil(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Home() {
  const supabase = getSupabaseAdminClient();
  await expirePastListings();

  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, owner_id, title, type, shape, location_text, available_until, photos, approximate_weight_lbs, materials, is_deconstruction, sale_type, sale_price",
    )
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(5);

  const { data: newsPosts } = await supabase
    .from("news_posts")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false })
    .limit(2);

  let owners: Record<
    string,
    {
      id: string;
      name: string | null;
      avatar_url: string | null;
      organization_slug: string | null;
    }
  > = {};

  const ownerIds = Array.from(
    new Set(
      (listings ?? [])
        .map((listing) => listing.owner_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );

  if (ownerIds.length > 0) {
    const { data: ownerRows } = await supabase
      .from("profiles")
      .select("id,name,avatar_url,organization_slug")
      .in("id", ownerIds);
    owners = (ownerRows ?? []).reduce<typeof owners>((acc, row) => {
      acc[row.id] = {
        id: row.id,
        name: row.name ?? null,
        avatar_url: row.avatar_url ?? null,
        organization_slug: row.organization_slug ?? null,
      };
      return acc;
    }, {});
  }

  const cards: ListingCardData[] = (listings ?? []).map((listing) => {
    const formattedAvailable = formatAvailableUntil(listing.available_until);
    const { entries, totalWeight, totalCo2 } =
      summarizeListingMaterials(listing);
    return {
      id: listing.id,
      title: listing.title,
      image: listing.photos?.[0] ?? FALLBACK_IMAGE,
      tags: [listing.type, listing.shape].filter(Boolean),
      location: listing.location_text,
      availableLabel: formattedAvailable
        ? `Available until ${formattedAvailable}`
        : undefined,
      totalWeightLbs: totalWeight || null,
      totalCo2eKg: totalCo2 || null,
      materials: entries,
      isDeconstruction: Boolean(listing.is_deconstruction),
      saleType:
        listing.sale_type === "resale" ? "resale" : ("donation" as const),
      salePrice:
        typeof listing.sale_price === "number" ? listing.sale_price : null,
      owner:
        listing.owner_id && owners[listing.owner_id]
          ? {
              id: owners[listing.owner_id].id,
              name: owners[listing.owner_id].name ?? undefined,
              avatarUrl: owners[listing.owner_id].avatar_url ?? undefined,
              organizationName:
                getOrganizationBySlug(
                  owners[listing.owner_id].organization_slug ?? undefined,
                )?.name ?? undefined,
            }
          : undefined,
    };
  });

  const hasLiveListings = cards.length > 0;

  const stories = (newsPosts ?? []).map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: buildExcerpt(post.body ?? ""),
    createdAt: post.created_at,
  }));

  const hasStories = stories.length > 0;

  return (
    <main className="flex flex-col bg-slate-950 text-white">
      <HeroSection stats={FEATURED_STATS} />

      <section className="relative isolate w-full border-t border-white/10 py-12 sm:py-14 lg:py-16">
        <div className="absolute inset-0">
          <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
          <div className="space-y-5">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Navigate the platform
            </span>
            <h2 className="text-[clamp(2.25rem,3vw,3.5rem)] font-bold leading-tight">
              Move your donations from surplus piles to new builds.
            </h2>
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

      <section className="relative isolate w-full border-t border-white/10 py-16">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-8 h-72 w-72 rounded-full bg-sky-500/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Marketplace preview
            </span>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold">
              Explore donation-driven inventories across the network.
            </h2>
            <p className="text-sm text-emerald-100 sm:text-base">
              Preview a handful of active donations below. Sign in when
              you&apos;re ready to save listings, chat directly with donors, and
              coordinate pickups.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 underline"
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
      </section>

      <section className="relative isolate w-full border-t border-white/10 py-16">
        <div className="absolute inset-0">
          <div className="absolute -top-10 right-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:py-4 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="space-y-4">
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
            {hasStories
              ? stories.map((story) => (
                  <article
                    key={story.id}
                    className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-lg backdrop-blur"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {story.title}
                    </h3>
                    <p className="mt-3 text-sm text-emerald-50/90">
                      {story.excerpt}
                    </p>
                    <Link
                      href={`/news/${story.id}`}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200 underline underline-offset-4 hover:text-emerald-100"
                    >
                      Read briefing
                      <span aria-hidden>→</span>
                    </Link>
                  </article>
                ))
              : [
                  {
                    id: "placeholder-story-1",
                    title: "Circular donations shift project timelines",
                    excerpt:
                      "Stories from the field will appear here once new briefings are published.",
                  },
                  {
                    id: "placeholder-story-2",
                    title: "Track diversion impact in real time",
                    excerpt:
                      "Check back soon for highlights from donors and builders across the network.",
                  },
                ].map((story) => (
                  <article
                    key={story.id}
                    className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-lg backdrop-blur"
                  >
                    <h3 className="text-lg font-semibold text-white">
                      {story.title}
                    </h3>
                    <p className="mt-3 text-sm text-emerald-50/90">
                      {story.excerpt}
                    </p>
                    <Link
                      href="/news"
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200 underline underline-offset-4 hover:text-emerald-100"
                    >
                      Visit the briefing room
                      <span aria-hidden>→</span>
                    </Link>
                  </article>
                ))}
          </div>
        </div>
      </section>

      <section className="relative isolate w-full border-t border-white/10 py-16">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[140px]" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="text-[clamp(2rem,3.2vw,3.4rem)] font-semibold leading-tight">
            Ready to keep materials in circulation?
          </h2>
          <p className="max-w-3xl text-sm text-emerald-100 sm:text-base">
            Create an account to publish donations, receive real-time interest
            from builders, and share diversion data with your stakeholders.
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
      </section>
    </main>
  );
}
