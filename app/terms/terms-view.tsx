"use client";

import ParallaxSection from "@/component/ParallaxSection";

import type { TermsSection } from "./page";

type Props = {
  sections: TermsSection[];
  lastUpdated: string;
};

export default function TermsView({ sections, lastUpdated }: Props) {
  return (
    <main className="flex flex-col text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Team reviewing agreements"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.2}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[45vh] max-w-5xl flex-col justify-center gap-6 px-4 py-14 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Terms & Conditions
          </span>
          <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-tight">
            Guidelines for keeping donations transparent and safe.
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-emerald-100/90 sm:text-base">
            These terms describe the responsibilities, assumptions of risk, and
            releases of liability when donating or receiving materials through
            CircularBuild.
          </p>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">
            Last updated: {lastUpdated}
          </p>
        </div>
      </ParallaxSection>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_right,_rgba(74,222,128,0.3),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-white/15 bg-white/10 px-6 py-6 shadow-lg backdrop-blur-lg"
            >
              <h2 className="text-xl font-semibold text-white">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-100/85">
                {section.body}
              </p>
            </article>
          ))}

          <footer className="rounded-3xl border border-white/15 bg-white/10 px-6 py-6 text-sm text-emerald-100/85 shadow-lg backdrop-blur-lg">
            By continuing to use CircularBuild, you acknowledge that you have
            read, understood, and agree to these Terms & Conditions. If you do
            not agree, please discontinue use of the Platform.
            <div className="mt-3 text-xs text-emerald-200/80">
              Last updated: {lastUpdated}
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
