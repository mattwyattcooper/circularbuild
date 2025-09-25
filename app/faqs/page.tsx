"use client";

import AuthWall from "@/component/AuthWall";
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
      <main className="mx-auto max-w-3xl p-6">Checking authentication…</main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <AuthWall message="Sign in to explore CircularBuild FAQs." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-gray-900">
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6">
        <h1 className="text-3xl font-semibold text-emerald-700">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-sm text-emerald-900">
          A quick primer on how CircularBuild keeps valuable materials
          circulating. Still curious? Reach out through the contact form and
          we&apos;ll get back to you.
        </p>
      </div>

      <div className="space-y-6">
        {FAQS.map((item) => (
          <div
            key={item.question}
            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-emerald-700">
              {item.question}
            </h2>
            <p className="mt-3 text-sm text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
        Still have questions?{" "}
        <a
          href="/contact"
          className="font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-900"
        >
          Head to the Contact tab
        </a>{" "}
        and tell us how we can help.
      </div>
    </main>
  );
}
