import Image from "next/image";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-gray-900">
      <section className="relative min-h-[26rem] overflow-hidden rounded-3xl border border-emerald-100 shadow-xl">
        <Image
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e"
          alt="Stacks of reclaimed lumber ready for reuse"
          fill
          priority
          className="object-cover"
        />
        <div className="relative z-10 bg-emerald-900/80 p-10 text-white md:p-16">
          <div className="flex items-center gap-4 text-sm uppercase tracking-wide text-emerald-100">
            <span className="relative h-20 w-64 overflow-hidden rounded-md border border-white/40 bg-white/10">
              <Image
                src="/logo.jpg"
                alt="CircularBuild logo"
                fill
                priority
                sizes="320px"
                className="object-cover object-center"
              />
            </span>
          </div>
          <span className="inline-flex rounded-full bg-white/20 px-4 py-1 text-xs uppercase tracking-wide">
            Circular materials marketplace
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-5xl">
            Give surplus materials a second life instead of a landfill destiny.
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg">
            Construction waste doesn’t have to be inevitable. Each year the U.S.
            construction sector discards nearly
            <strong> 600 million tons</strong> of material (EPA, 2023).
            CircularBuild makes it simple for donors with high-quality excess to
            route those supplies to neighborhood repair crews, college
            design-build clubs, and humanitarian teams who need them quickly.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-emerald-100 md:text-base">
            From campus makerspaces to Engineers Without Borders projects, we
            exist to close the loop between jobsite surplus and world-changing
            ideas.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
            <span className="rounded-full bg-white/20 px-4 py-2">
              <strong>35%</strong> of landfill volume is construction &
              demolition waste
            </span>
            <span className="rounded-full bg-white/20 px-4 py-2">
              Reusing <strong>15%</strong> of surplus lumber saves ~2M tons of
              CO₂ annually
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <a
              href="/donate"
              className="rounded-full bg-white px-5 py-2 text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              Donate materials
            </a>
            <a
              href="/search"
              className="rounded-full border border-white/70 px-5 py-2 text-white transition hover:bg-white/10"
            >
              Discover available materials
            </a>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">
            Wood & lumber
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Dimensional lumber, sheathing, and trim make up 40% of residential
            waste. Knots or odd lengths can still frame sheds, furniture, and
            formwork when matched with the right crew.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">Metals</h2>
          <p className="mt-3 text-sm text-gray-600">
            Steel and aluminum offcuts carry energy-intensive embodied carbon.
            Keeping them in use avoids the emissions tied to smelting and
            transport.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">
            Finishes & fixtures
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            Surplus tile, windows, flooring, and cabinetry help nonprofits
            stretch budgets and keep high-value items from salvage yards.
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-emerald-700">
            Why circular sourcing matters
          </h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>
              <strong>Cut tipping fees:</strong> Disposal costs keep climbing.
              Listing materials is free and keeps resources in circulation.
            </li>
            <li>
              <strong>Keep crews moving:</strong> Builders can source
              hard-to-find items locally instead of waiting on long supply
              chains.
            </li>
            <li>
              <strong>Empower community impact:</strong> Student design-build
              clubs, humanitarian nonprofits, and grassroots repair teams gain
              access to safe, reliable supplies without the cost of virgin
              sourcing.
            </li>
          </ul>
        </div>
        <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-semibold text-emerald-700">
            How CircularBuild works
          </h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li>
              <strong>List surplus material:</strong> Donors detail
              availability, pickup windows, and terms.
            </li>
            <li>
              <strong>Search smarter:</strong> Builders filter by specs or scan
              an interactive map to see what’s nearby.
            </li>
            <li>
              <strong>Chat & coordinate:</strong> In-app messaging keeps
              communication organized until the transfer is complete.
            </li>
          </ol>
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-emerald-100 bg-white px-8 py-10 shadow-sm">
        <h2 className="text-2xl font-semibold text-emerald-700">
          Ready to keep materials in motion?
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-gray-600">
          Create an account to access donations, post your own listings, and
          track the materials you’ve diverted from landfill.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <a
            href="/auth"
            className="rounded-full bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-700"
          >
            Sign up or sign in
          </a>
          <a
            href="/faqs"
            className="rounded-full border border-emerald-600 px-4 py-2 text-emerald-700 transition hover:bg-emerald-50"
          >
            Learn more
          </a>
        </div>
      </section>
    </main>
  );
}
