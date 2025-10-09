// app/layout.tsx
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import type { ReactNode } from "react";

import Header from "../component/Header";
import { display, inter } from "./fonts";

export const metadata = {
  title: "CircularBuild",
  description: "Connected to Supabase",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html
      lang="en"
      className={`${display.variable} ${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Header />

        <main className="flex-1 w-full">{children}</main>

        <footer className="w-full border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                About
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/who-we-are" className="hover:text-emerald-600">
                    Who We Are
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-emerald-600">
                    Press & Updates
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-emerald-600">
                    Mission & Values
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                For Donors
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/donate" className="hover:text-emerald-600">
                    List Materials
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-emerald-600">
                    Guidelines & Policies
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-emerald-600">
                    Partner With Us
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                For Builders
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/search" className="hover:text-emerald-600">
                    Browse Marketplace
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/wishlist"
                    className="hover:text-emerald-600"
                  >
                    Saved Materials
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="hover:text-emerald-600">
                    Eligibility & Safety
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Community
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/news" className="hover:text-emerald-600">
                    News & Stories
                  </Link>
                </li>
                <li>
                  <Link href="/chats" className="hover:text-emerald-600">
                    Conversations
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-emerald-600">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Help
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="/faqs" className="hover:text-emerald-600">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-emerald-600">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-emerald-600">
                    Terms & Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
              <span>© {year} CircularBuild</span>
              <div className="flex items-center gap-4">
                <span>English (US)</span>
                <span>USD</span>
              </div>
            </div>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
