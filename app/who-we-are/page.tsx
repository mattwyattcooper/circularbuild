import Link from "next/link";

import ExpandableCategoryCard from "@/component/ExpandableCategoryCard";
import ParallaxSection from "@/component/ParallaxSection";

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
    <main className="flex flex-col bg-slate-950 text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Volunteers sorting reclaimed construction materials"
        overlayClassName="bg-slate-950/70"
        className="pt-20 pb-16 sm:pt-24 sm:pb-20"
        speed={0.18}
        maxOffset={220}
      >
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="flex-1 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Our mission
            </span>
            <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-extrabold leading-tight text-white">
              We connect construction surplus with the people and projects who
              need it most.
            </h1>
            <div className="space-y-4 text-base text-emerald-100">
              <p className="text-base sm:text-lg">
                CircularBuild is the world’s first donation-based raw materials
                reuse marketplace. We keep excess framing lumber, metals,
                fixtures, and even light machinery in motion by linking generous
                donors with homeowners, educators, and nonprofit teams
                delivering human-centered infrastructure.
              </p>
              <p className="text-sm sm:text-base text-emerald-100/90">
                In a world battling climate change, rising resource scarcity,
                and a disconnect between projects, CircularBuild invites
                everyone to connect the circle.
              </p>
              <p className="text-sm sm:text-base text-emerald-100/90">
                From local job sites to overseas humanitarian work, our team has
                seen how a reliable pallet of materials can launch community
                resilience projects. CircularBuild makes sure those materials
                never go to waste again.
              </p>
            </div>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="rounded-3xl border border-white/30 bg-white/10 p-6 text-center text-lg font-semibold text-white shadow-lg backdrop-blur-lg">
              Reuse saves budget & carbon
            </div>
          </div>
        </div>
      </ParallaxSection>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Stacks of reclaimed beams inside a warehouse"
        overlayClassName="bg-emerald-950/75"
        className="mt-[-1px] py-16 sm:py-20"
        speed={0.2}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center gap-10 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {IMPACT_STATS.map((stat) => (
              <article
                key={stat.label}
                className="rounded-3xl border border-white/20 bg-white/10 p-8 text-left shadow-lg backdrop-blur-lg"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">
                  {stat.label}
                </p>
                <p className="mt-6 text-4xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="mt-4 text-xs text-emerald-100">{stat.source}</p>
              </article>
            ))}
          </div>
        </div>
      </ParallaxSection>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Team collaborating on reused construction materials"
        overlayClassName="bg-slate-950/75"
        className="mt-[-1px] py-16 sm:py-24"
        speed={0.18}
        maxOffset={220}
      >
        <div className="mx-auto grid min-h-[70vh] max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[2fr_1fr] lg:items-stretch lg:px-8">
          <div className="space-y-6">
            {STORY_POINTS.map((point) => (
              <article
                key={point.heading}
                className="rounded-3xl border border-white/25 bg-white/10 p-8 shadow-lg backdrop-blur-lg"
              >
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                  {point.heading}
                </h2>
                <p className="mt-4 text-sm text-emerald-100 sm:text-base">
                  {point.copy}
                </p>
              </article>
            ))}
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/30 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-8 shadow-xl">
            <div>
              <h2 className="text-2xl font-semibold">Our north star</h2>
              <p className="mt-3 text-sm text-emerald-100">
                Every donation keeps materials in circulation, reduces embodied
                carbon, and empowers innovators who are building better places
                to live. CircularBuild is the bridge that makes both giving and
                receiving effortless.
              </p>
            </div>
            <ul className="space-y-4 text-sm">
              {GUIDING_VALUES.map((value) => (
                <li key={value.title} className="rounded-2xl bg-white/10 p-4">
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
        </div>
      </ParallaxSection>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1531835551805-16d864c8dffe?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Stacks of reclaimed wood ready for reuse"
        overlayClassName="bg-emerald-950/75"
        className="mt-[-1px] py-16 sm:py-20"
        speed={0.22}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center gap-8 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {MATERIAL_CATEGORIES.map((category) => (
              <ExpandableCategoryCard
                key={category.title}
                title={category.title}
                description={category.description}
              />
            ))}
          </div>
        </div>
      </ParallaxSection>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Architects reviewing plans on a job site"
        overlayClassName="bg-slate-950/80"
        className="mt-[-1px] py-16 sm:py-20"
        speed={0.2}
        maxOffset={200}
      >
        <div className="mx-auto grid min-h-[60vh] max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <article className="rounded-3xl border border-white/25 bg-white/10 p-8 text-left shadow-lg backdrop-blur-lg">
            <h2 className="text-2xl font-semibold text-white">
              Why circular sourcing matters
            </h2>
            <ul className="mt-6 space-y-4 text-sm text-emerald-100 sm:text-base">
              <li>
                <strong className="text-white">Cut tipping fees:</strong>{" "}
                Listing high-value materials is free and keeps resources in
                circulation.
              </li>
              <li>
                <strong className="text-white">Keep crews moving:</strong>{" "}
                Builders can source nearby stock versus waiting on volatile
                supply chains.
              </li>
              <li>
                <strong className="text-white">
                  Empower community impact:
                </strong>
                Makerspaces, schools, and humanitarian teams gain transparent
                inventory.
              </li>
            </ul>
          </article>
          <article className="rounded-3xl border border-white/25 bg-white/10 p-8 text-left shadow-lg backdrop-blur-lg">
            <h3 className="text-2xl font-semibold text-white">
              How CircularBuild works
            </h3>
            <ol className="mt-6 space-y-4 text-sm text-emerald-100 sm:text-base">
              <li>
                <strong className="text-white">List surplus:</strong> Add
                photos, availability, and pickup notes.
              </li>
              <li>
                <strong className="text-white">Search smarter:</strong> Filter
                specs or switch to map view to scout opportunities.
              </li>
              <li>
                <strong className="text-white">Coordinate:</strong> Chat in-app,
                confirm transfers, and track landfill diversion.
              </li>
            </ol>
          </article>
        </div>
      </ParallaxSection>

      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1529429617124-aee1e6a1a32d?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Community members celebrating a completed build"
        overlayClassName="bg-emerald-950/75"
        className="mt-[-1px] py-16 sm:py-20"
        speed={0.18}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col justify-center gap-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold text-white">
            Ready to partner with us?
          </h2>
          <p className="max-w-3xl text-sm text-emerald-100 sm:text-base">
            Whether you have a jobsite full of extras or you’re equipping a
            service project, CircularBuild brings everyone to the same table.
            List materials, discover donations, and share impact metrics with
            your stakeholders.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-white shadow-sm transition hover:bg-emerald-500"
            >
              Donate materials
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400 px-5 py-2 text-white transition hover:border-white hover:bg-white/10"
            >
              Partner with the team
            </Link>
          </div>
        </div>
      </ParallaxSection>
    </main>
  );
}
