"use client";

import Image from "next/image";
import Link from "next/link";

import { useParallax } from "@/lib/useParallax";

type Stat = {
  label: string;
  value: string;
};

type Props = {
  stats: Stat[];
};

const HERO_LINKS = [
  { href: "/search", label: "Preview available materials" },
  { href: "/donate", label: "List a donation" },
  { href: "/who-we-are", label: "Meet the network" },
];

export default function HeroSection({ stats }: Props) {
  const backgroundRef = useParallax({ speed: 0.26, maxOffset: 220 });

  return (
    <section className="relative isolate flex w-full overflow-hidden bg-slate-900 text-white">
      <div
        ref={backgroundRef}
        className="absolute inset-0 -z-10 will-change-transform"
      >
        <Image
          src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2400&q=80"
          alt="Workers organizing reclaimed construction materials"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/60" />
      </div>

      <div className="mx-auto flex w-full flex-col justify-center gap-14 px-6 py-20 sm:px-10 lg:px-20 lg:py-28">
        <div className="max-w-3xl space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
            Circular materials marketplace
          </span>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-tight">
            Route surplus away from landfill and into the projects that need it
            most.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-emerald-100">
            CircularBuild connects contractors, fabricators, and community
            builders with reuse-ready inventories. List donations in minutes,
            preview nearby materials, and track diversion metrics right inside
            the platform.
          </p>
          <div className="flex flex-wrap gap-5 text-sm font-semibold">
            {HERO_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-12 text-sm text-emerald-100">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 text-left">
              <span className="text-3xl font-bold text-white">
                {stat.value}
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-emerald-200">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
