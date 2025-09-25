import Image from "next/image";

export const metadata = {
  title: "Who We Are | CircularBuild",
  description:
    "Learn about CircularBuild's mission to create the first donation-based raw materials reuse marketplace that keeps construction resources in circulation.",
};

const IMPACT_STATS = [
  {
    label: "Construction & demolition waste in the U.S. each year",
    value: "600M tons",
    source: "U.S. EPA, 2023",
  },
  {
    label: "Avg. project waste from over-ordering",
    value: "10-15%",
    source: "McKinsey Construction Productivity Report",
  },
  {
    label: "Communities CircularBuild prioritizes",
    value: "Nonprofits, schools, homeowners",
    source: "Platform focus",
  },
];

const GUIDING_VALUES = [
  {
    title: "Keep materials moving",
    description:
      "We make reuse the default option by pairing surplus structural lumber, metals, and fixtures with builders who can deploy them immediately.",
  },
  {
    title: "Serve community-led projects",
    description:
      "Grassroots organizations, student engineering clubs, and households tackling critical repairs deserve the same access to quality materials as large contractors.",
  },
  {
    title: "A win-win for both sides",
    description:
      "Our product is built with an understanding of the benefits of donating—from avoiding landfill fees to hitting diversion targets to simply being a good neighbor.",
  },
];

const STORY_POINTS = [
  {
    heading: "Built from the field up",
    copy: "Matthew Cooper launched CircularBuild after half a decade of navigating construction management and civil engineering roles where end-of-project surplus was routine. Factors of safety are built into a project’s budget, but in many cases this emergency supply is never tapped. The result? Pallets of engineered lumber, steel, and workable fixtures discarded because matching them with the right recipient was too complicated.",
  },
  {
    heading: "Service-inspired mission",
    copy: "Work on a design partnership with a Malawi refugee camp and experiences with Engineers Without Borders highlighted how transformative access to basic materials can be. High school and college clubs, nonprofit organizations, and even capstone projects often have little to no budget but urgently need safe, reliable materials without the price tag of virgin sourcing.",
  },
  {
    heading: "An innovative solution to a growing problem",
    copy: "CircularBuild bridges donors with high-quality leftovers and recipients who can turn them into resilient housing, community facilities, and learning labs. The platform manages intake, verification, location-aware search, and direct messaging so swaps stay simple and transparent—whether you’re a student in a design-build club, a social infrastructure organization, or a homeowner tackling a repair. Contractors and neighbors with leftover materials destined for landfill can join us in creating a more sustainable, efficient development industry worldwide.",
  },
];

export default function WhoWeArePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-16 px-4 py-16 text-gray-900">
      <section className="grid gap-8 rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm md:grid-cols-[3fr_2fr] md:p-12">
        <div>
          <span className="inline-flex rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Our mission
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-emerald-700 md:text-4xl">
            We connect construction surplus with the people and projects who
            need it most.
          </h1>
          <p className="mt-4 text-base text-gray-600 md:text-lg">
            CircularBuild is the world’s first donation-based raw materials
            reuse marketplace. We keep excess framing lumber, metals, fixtures,
            and even light machinery in motion by linking generous donors with
            homeowners, educators, and nonprofit teams delivering human-centered
            infrastructure.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            In a world battling climate change, rising resource scarcity, and a
            disconnect between projects, CircularBuild invites everyone to
            connect the circle.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            From local job sites to overseas humanitarian work, our team has
            seen how a reliable pallet of materials can launch community
            resilience projects. CircularBuild makes sure those materials never
            go to waste again.
          </p>
        </div>
        <div className="relative h-64 overflow-hidden rounded-2xl border border-emerald-100 md:h-full">
          <Image
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd"
            alt="Volunteers sorting reclaimed construction materials"
            fill
            className="object-cover"
          />
          <span className="absolute bottom-4 left-4 rounded-full bg-white/85 px-4 py-1 text-xs font-medium text-emerald-700">
            Reuse saves budget & carbon
          </span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {IMPACT_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-gray-500">{stat.source}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          {STORY_POINTS.map((point) => (
            <div
              key={point.heading}
              className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-emerald-700">
                {point.heading}
              </h2>
              <p className="mt-3 text-sm text-gray-600">{point.copy}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-8 text-white">
          <div>
            <h2 className="text-2xl font-semibold">Our north star</h2>
            <p className="mt-3 text-sm text-emerald-100">
              Every donation keeps materials in circulation, reduces embodied
              carbon, and empowers innovators who are building better places to
              live. CircularBuild is the bridge that makes both giving and
              receiving effortless.
            </p>
          </div>
          <ul className="space-y-4 text-sm">
            {GUIDING_VALUES.map((value) => (
              <li key={value.title} className="rounded-xl bg-white/10 p-4">
                <h3 className="text-lg font-medium text-white">
                  {value.title}
                </h3>
                <p className="mt-2 text-emerald-100">{value.description}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-emerald-200">
            CircularBuild operates as a mission-driven nonprofit. We measure
            success by the tonnage redirected from landfills and the projects
            made possible in classrooms, workshops, and communities worldwide.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm md:p-12">
        <h2 className="text-2xl font-semibold text-emerald-700">
          Ready to partner with us?
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-gray-600">
          Whether you have a jobsite full of extras or you’re equipping a
          service project, CircularBuild brings everyone to the same table. List
          materials, discover donations, and share impact metrics with your
          stakeholders.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <a
            href="/donate"
            className="rounded-full bg-emerald-600 px-5 py-2 text-white shadow-sm transition hover:bg-emerald-700"
          >
            Donate materials
          </a>
          <a
            href="/contact"
            className="rounded-full border border-emerald-600 px-5 py-2 text-emerald-700 transition hover:bg-emerald-50"
          >
            Partner with the team
          </a>
        </div>
      </section>
    </main>
  );
}
