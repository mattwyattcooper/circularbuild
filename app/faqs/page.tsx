"use client";

import AuthWall from "@/component/AuthWall";
import ParallaxSection from "@/component/ParallaxSection";
import { useRequireAuth } from "@/lib/useRequireAuth";

const FAQS = [
  {
    question: "Who can list materials on CircularBuild?",
    answer:
      "Licensed contractors, homeowners, and project managers renovating homes or commercial spaces. Listings must comply with local regulations and be safe to handle.",
  },
  {
    question: "What materials are accepted?",
    answer:
      "Dimensional lumber, plywood, metals, masonry, drywall, insulation, fixtures, appliances, and other building components in reusable condition. Hazardous waste and liquids are not allowed.",
  },
  {
    question: "How long do listings stay live?",
    answer:
      "Donors pick an availability window—typically 7-30 days. After the date passes, listings automatically close so searchers only see items that are ready for pickup.",
  },
  {
    question: "Can I charge for materials?",
    answer:
      "CircularBuild is for donations or free exchanges only. You can request that the recipient covers transport or labor, but the material itself must remain free.",
  },
  {
    question: "What happens after I contact a donor?",
    answer:
      "Use the in-app chat to coordinate pickup, ask clarifying questions, and confirm once the hand-off is complete. Chats close automatically when a listing is marked procured.",
  },
  {
    question: "How do I track my impact?",
    answer:
      "The My Listings dashboard shows which materials have been rehomed so you can share diversion metrics with clients, teams, or sustainability reports.",
  },
];

export default function FAQsPage() {
  const authStatus = useRequireAuth();

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-emerald-100">
        Checking authentication…
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)]" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <AuthWall message="Sign in to explore CircularBuild FAQs." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Team discussing material reuse logistics"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.22}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[45vh] max-w-6xl flex-col justify-center gap-6 px-4 py-14 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Help desk
          </span>
          <h1 className="text-[clamp(2.25rem,4.2vw,3.6rem)] font-extrabold leading-tight">
            Frequently asked questions about getting materials moving.
          </h1>
          <p className="max-w-2xl text-base text-emerald-100/90 sm:text-lg">
            Browse quick answers to the most common donor and builder questions.
            Need more detail? Reach out anytime.
          </p>
        </div>
      </ParallaxSection>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_left,_rgba(74,222,128,0.3),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {FAQS.map((item) => (
              <article
                key={item.question}
                className="rounded-3xl border border-white/15 bg-white/10 px-6 py-5 shadow-lg backdrop-blur-lg"
              >
                <h2 className="text-xl font-semibold text-white">
                  {item.question}
                </h2>
                <p className="mt-3 text-base text-emerald-100/85">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 px-6 py-5 text-base text-emerald-100/85 shadow-lg backdrop-blur-lg">
            Still have questions?{" "}
            <a
              href="/contact"
              className="font-semibold text-emerald-200 underline underline-offset-4 hover:text-white"
            >
              Head to the Contact tab
            </a>{" "}
            and tell us how we can help.
          </div>
        </div>
      </section>
    </main>
  );
}
