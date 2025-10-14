import ParallaxSection from "@/component/ParallaxSection";

import type { PrivacySection } from "./page";

type Props = {
  sections: PrivacySection[];
  lastUpdated: string;
};

export default function PrivacyView({ sections, lastUpdated }: Props) {
  return (
    <main className="flex flex-col text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Hands reviewing privacy policy documents"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.2}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[45vh] max-w-5xl flex-col justify-center gap-6 px-4 py-14 text-center sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Privacy Policy
          </span>
          <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-tight">
            How CircularBuild protects and respects your information.
          </h1>
          <p className="mx-auto max-w-3xl text-sm text-emerald-100/90 sm:text-base">
            This notice explains the data we collect, how it is used, and the
            choices available to you when engaging with the CircularBuild
            Platform.
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
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-emerald-100/85 [&_a]:text-emerald-200 [&_a]:underline [&_a]:underline-offset-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
                {section.body}
              </div>
            </article>
          ))}

          <footer className="rounded-3xl border border-white/15 bg-white/10 px-6 py-6 text-sm text-emerald-100/85 shadow-lg backdrop-blur-lg">
            We are committed to respecting your privacy. If you have questions
            about how your information is used, please reach out. This notice
            may change as regulations evolve.
            <div className="mt-3 text-xs text-emerald-200/80">
              Last updated: {lastUpdated}
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
