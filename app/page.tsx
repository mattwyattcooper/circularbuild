import Image from "next/image";
import Link from "next/link";

const stats = [
  { label: "Tons diverted", value: "2.8M" },
  { label: "Active donors", value: "640" },
  { label: "Avg. pickup", value: "3.5 days" },
];

const quickDestinations = [
  {
    title: "See live marketplace",
    description: "Browse materials and map supply before creating an account.",
    href: "/search",
  },
  {
    title: "List a donation",
    description: "Share surplus with crews who can mobilise quickly.",
    href: "/donate",
  },
  {
    title: "Read field notes",
    description: "News, policy wins, and success stories from the network.",
    href: "/news",
  },
  {
    title: "Get answers",
    description: "Policies, logistics, and safety basics in one place.",
    href: "/faqs",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10 text-slate-900 md:py-14">
      <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
        <Image
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e"
          alt="Stacks of reclaimed lumber ready for reuse"
          fill
          priority
          className="absolute inset-0 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-emerald-900/45 to-black/10" />

        <div className="relative grid gap-10 p-8 md:grid-cols-[minmax(0,1fr)_320px] md:p-14">
          <div className="space-y-5 rounded-3xl bg-white/95 p-8 shadow-lg backdrop-blur">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Circular materials marketplace
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
              Give jobsite surplus a second life — empower the projects that
              need it most.
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              CircularBuild connects contractors, fabricators, and campus labs
              with crews ready to reuse quality material. See supply in real
              time, publish donations in minutes, and keep every transfer
              transparent.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-white shadow transition hover:bg-emerald-700"
              >
                Preview the marketplace
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-600 px-5 py-3 text-emerald-700 transition hover:bg-emerald-50"
              >
                List a donation
              </Link>
              <Link
                href="/who-we-are"
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-slate-600 transition hover:text-emerald-700"
              >
                Meet the network
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/30 bg-white/20 p-6 text-white shadow-lg backdrop-blur">
            <p className="text-sm text-white/80">
              “Within 48 hours of posting surplus flooring, a vocational
              training centre scheduled pickup through CircularBuild. The
              process kept everyone aligned.”
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              Shannon Li · UrbanBuild Collaborative
            </p>
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-black/25 p-4 text-center text-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="text-lg font-semibold text-white">
                    {stat.value}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-100">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">
            Wood & lumber
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Dimensional lumber, sheathing, and trim make up 40% of residential
            waste. Match offcuts with community crews instead of paying tipping
            fees.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">Metals</h2>
          <p className="mt-3 text-sm text-slate-600">
            Steel and aluminum offcuts carry heavy embodied carbon. Reuse avoids
            smelting emissions and keeps local fabrication on schedule.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">
            Finishes & fixtures
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Tile, windows, flooring, and cabinetry stretch nonprofit budgets and
            reduce trips to salvage yards.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Why circular sourcing matters
          </h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <strong className="text-emerald-700">Cut tipping fees:</strong>{" "}
              Listing high-value materials is free and keeps resources in
              circulation.
            </li>
            <li>
              <strong className="text-emerald-700">Keep crews moving:</strong>{" "}
              Builders can source nearby stock versus waiting on volatile supply
              chains.
            </li>
            <li>
              <strong className="text-emerald-700">
                Empower community impact:
              </strong>{" "}
              Makerspaces, schools, and humanitarian teams gain transparent
              inventory.
            </li>
          </ul>
        </div>
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-semibold text-slate-900">
            How CircularBuild works
          </h3>
          <ol className="space-y-3 text-sm text-slate-600">
            <li>
              <strong className="text-emerald-700">List surplus:</strong> Add
              photos, availability, and pickup notes.
            </li>
            <li>
              <strong className="text-emerald-700">Search smarter:</strong>{" "}
              Filter specs or switch to map view to scout opportunities.
            </li>
            <li>
              <strong className="text-emerald-700">Coordinate:</strong> Chat
              in-app, confirm transfers, and track landfill diversion.
            </li>
          </ol>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900">
              Where do you want to go next?
            </h2>
            <p className="text-sm text-slate-600">
              Move between marketplace, donor tools, and learning resources with
              a single account.
            </p>
          </div>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
          >
            Create a free account
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {quickDestinations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-white/90 p-5 transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                Explore <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
