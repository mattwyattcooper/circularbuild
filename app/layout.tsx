// app/layout.tsx
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import type { ReactNode } from "react";

import Header from "../component/Header";

export const metadata = {
  title: "CircularBuild",
  description: "Connected to Supabase",
};

const quickLinks = [
  { label: "Browse materials", href: "/search" },
  { label: "List a donation", href: "/donate" },
  { label: "Read our news", href: "/news" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body className="relative min-h-screen bg-brand-ivory text-brand-ink">
        <div className="pointer-events-none fixed inset-0 -z-20 bg-radial-glow" />
        <div className="pointer-events-none fixed inset-x-0 top-10 -z-10 h-[28rem] overflow-hidden">
          <div className="mx-auto h-full max-w-4xl rounded-full bg-brand-emerald/10 blur-3xl" />
        </div>

        <Header />

        <div className="sticky top-16 z-20 hidden justify-center md:flex">
          <nav className="flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-5 py-3 text-xs font-semibold text-brand-slate shadow-brand backdrop-blur">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-pill px-3 py-1.5 transition hover:bg-brand-emerald/10 hover:text-brand-emerald"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-emerald/60" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mx-auto flex w-full max-w-content flex-1 flex-col gap-16 px-4 pb-24 pt-12 md:px-8 md:pt-16">
          {children}
        </div>

        <footer className="border-t border-white/30 bg-white/90 py-12 text-sm text-brand-slate backdrop-blur">
          <div className="mx-auto flex w-full max-w-content flex-col gap-10 px-4 md:flex-row md:justify-between md:px-8">
            <div className="max-w-sm space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-emerald">
                CircularBuild
              </p>
              <p className="text-lg font-semibold text-brand-ink">
                A reuse network for jobsite surplus, community projects, and
                circular economy champions.
              </p>
              <p>
                Join our mailing list to hear about new donor listings, policy
                wins, and case studies.
              </p>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-pill bg-brand-emerald px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-emeraldDark"
              >
                Explore stories
              </Link>
            </div>

            <div className="grid flex-1 gap-8 text-sm md:grid-cols-3">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate">
                  Platform
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link className="hover:text-brand-emerald" href="/search">
                      Search materials
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-brand-emerald" href="/donate">
                      List a donation
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-brand-emerald" href="/chats">
                      Manage chats
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate">
                  Learn
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      className="hover:text-brand-emerald"
                      href="/who-we-are"
                    >
                      Who we are
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-brand-emerald" href="/faqs">
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-brand-emerald" href="/news">
                      News & insights
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate">
                  Support
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link className="hover:text-brand-emerald" href="/contact">
                      Contact us
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-brand-emerald" href="/terms">
                      Terms & policies
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="hover:text-brand-emerald"
                      href="mailto:hello@circularbuild.org"
                    >
                      hello@circularbuild.org
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-white/40 pt-6 text-xs text-brand-slate/80">
            <div className="mx-auto flex w-full max-w-content flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
              <span>© {year} CircularBuild. All rights reserved.</span>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth" className="hover:text-brand-emerald">
                  Access your account
                </Link>
                <Link href="/contact" className="hover:text-brand-emerald">
                  Partner with us
                </Link>
                <Link href="/donate" className="hover:text-brand-emerald">
                  Become a donor
                </Link>
              </div>
            </div>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
