import Image from "next/image";
import Link from "next/link";

const stats = [
  { label: "materials diverted", value: "2.8M lbs", detail: "+47% YoY" },
  { label: "builders supported", value: "1,200+", detail: "schools & crews" },
  { label: "avg. pickup time", value: "3.5 days", detail: "from listing" },
];

const journeys = [
  {
    title: "List surplus in minutes",
    description:
      "Upload photos, add pickup windows, and keep your crew focused on the next project — not the dumpster schedule.",
    cta: { label: "Start donating", href: "/donate" },
  },
  {
    title: "Source what you need nearby",
    description:
      "Filter by specs, see real-time availability, and bookmark listings to coordinate with teammates.",
    cta: { label: "Browse the marketplace", href: "/search" },
  },
  {
    title: "Coordinate the handoff",
    description:
      "Chat in-app, manage pickups, and confirm transfers so every journey from surplus to site stays transparent.",
    cta: { label: "Open chats", href: "/chats" },
  },
];

const destinations = [
  {
    title: "CircularBuild News",
    description:
      "Field notes, policy wins, and case studies from the reuse community.",
    href: "/news",
  },
  {
    title: "Who we are",
    description:
      "Meet the coalition partners, fabricators, and educators behind our mission.",
    href: "/who-we-are",
  },
  {
    title: "Need answers?",
    description:
      "Get details on donations, logistics, and safety requirements in our FAQs.",
    href: "/faqs",
  },
  {
    title: "Talk to the team",
    description:
      "Partnership ideas or a bulk donation on the horizon? Let’s connect.",
    href: "/contact",
  },
];

export default function Home() {
  return (
    <main className="space-y-24">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/90 p-8 shadow-brand md:grid md:grid-cols-2 md:items-center md:p-14">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-brand-emerald/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand-emerald/20 blur-3xl" />

        <div className="relative z-10 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-pill bg-brand-emerald/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-emerald">
            Circular materials marketplace
          </span>
          <h1 className="text-4xl font-semibold text-brand-ink sm:text-5xl">
            Give jobsite surplus a second life — and power the projects that
            need it most.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-brand-slate">
            CircularBuild links contractors, fabricators, and campus labs with
            crews on the ground. Route high-quality excess away from landfills
            and into reuse, all in a platform designed for clarity, speed, and
            accountability.
          </p>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-pill bg-brand-emerald px-5 py-3 text-white shadow-brand transition hover:bg-brand-emeraldDark"
            >
              Donate materials
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-pill border border-brand-emerald/40 px-5 py-3 text-brand-emerald transition hover:border-brand-emerald hover:bg-brand-emerald/10"
            >
              Browse listings
            </Link>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-pill px-4 py-3 text-brand-slate transition hover:text-brand-emerald"
            >
              See platform impact
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex flex-col gap-6 md:mt-0">
          <div className="rounded-[2rem] border border-white/50 bg-brand-ink text-white shadow-xl">
            <div className="relative h-64 overflow-hidden rounded-[2rem]">
              <Image
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e"
                alt="Stacks of reclaimed lumber ready for reuse"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-ink/60 to-brand-emerald/40" />
              <div className="absolute bottom-6 left-6 space-y-2 text-sm">
                <p className="inline-flex items-center gap-2 rounded-pill bg-white/20 px-3 py-1 uppercase tracking-[0.25em]">
                  Field ready
                </p>
                <p className="max-w-xs text-sm leading-relaxed text-slate-100">
                  Donated timbers from MetroBuild saved a student housing studio
                  18 weeks of sourcing delays.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-lg font-semibold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    {stat.label}
                  </p>
                  <p className="text-xs text-white/60">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {journeys.map((journey) => (
          <div
            key={journey.title}
            className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/90 p-6 shadow-brand transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="pointer-events-none absolute -right-10 top-6 h-36 w-36 rounded-full bg-brand-emerald/10 blur-2xl" />
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-emerald/15 text-brand-emerald">
                ●
              </div>
              <h2 className="text-xl font-semibold text-brand-ink">
                {journey.title}
              </h2>
              <p className="text-sm leading-relaxed text-brand-slate">
                {journey.description}
              </p>
              <Link
                href={journey.cta.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-emerald transition hover:text-brand-emeraldDark"
              >
                {journey.cta.label}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-10 rounded-[2.5rem] border border-white/40 bg-white/90 p-10 shadow-inner md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-pill bg-brand-emerald/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-emerald">
            Impact in motion
          </span>
          <h2 className="text-3xl font-semibold text-brand-ink">
            Why circular sourcing matters
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-brand-slate">
            <p>
              Construction & demolition waste accounts for over one third of
              U.S. landfill volume. CircularBuild streamlines the alternative:
              reuse.
            </p>
            <ul className="space-y-3">
              <li>
                <strong className="text-brand-emerald">
                  Cut tipping fees:
                </strong>{" "}
                Keep high-value materials out of roll-offs and in the hands of
                crews who can use them immediately.
              </li>
              <li>
                <strong className="text-brand-emerald">
                  Strengthen community builds:
                </strong>{" "}
                Makerspaces, schools, and humanitarian teams gain dependable
                inventory with transparent provenance.
              </li>
              <li>
                <strong className="text-brand-emerald">
                  Track your impact:
                </strong>{" "}
                Listings, chats, and pickups stay connected so your diversion
                metrics are audit-ready.
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-pill bg-brand-emerald px-4 py-2 text-white shadow-brand transition hover:bg-brand-emeraldDark"
            >
              Create an account
            </Link>
            <Link
              href="/faqs"
              className="inline-flex items-center gap-2 rounded-pill border border-brand-emerald/40 px-4 py-2 text-brand-emerald transition hover:border-brand-emerald hover:bg-brand-emerald/10"
            >
              How it works
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-brand-ink/90 text-white shadow-brand">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-emerald/40 to-brand-ink/60" />
          <div className="relative space-y-6 p-8">
            <h3 className="text-2xl font-semibold">Voices from the network</h3>
            <p className="text-sm leading-relaxed text-white/80">
              “Within 48 hours of listing surplus flooring, a vocational
              training center matched with our donation. The pickup was
              coordinated inside the platform, keeping everyone aligned.”
            </p>
            <p className="text-sm font-semibold text-brand-emerald/90">
              — Shannon Li, Operations Director, UrbanBuild Collaborative
            </p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-brand-emerald/90"
            >
              Read more stories
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-white/40 bg-white/90 p-10 shadow-brand">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-pill bg-brand-emerald/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-emerald">
              Keep exploring
            </span>
            <h2 className="text-3xl font-semibold text-brand-ink">
              Where to next?
            </h2>
            <p className="text-sm leading-relaxed text-brand-slate">
              Explore the rest of the platform — from success stories to support
              resources — and build your circular workflow.
            </p>
          </div>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-pill bg-brand-emerald px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-emeraldDark"
          >
            Join CircularBuild
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {destinations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-emerald hover:shadow-xl"
            >
              <div className="pointer-events-none absolute -left-10 top-10 h-24 w-24 rounded-full bg-brand-emerald/10 blur-2xl transition group-hover:bg-brand-emerald/20" />
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-brand-ink group-hover:text-brand-emerald">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-brand-slate">
                  {item.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-emerald/80 group-hover:text-brand-emerald">
                  Explore <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
