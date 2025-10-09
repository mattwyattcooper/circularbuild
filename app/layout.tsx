// app/layout.tsx
import "./globals.css"; // makes Tailwind + global styles work

import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import type { ReactNode } from "react";

import Header from "../component/Header"; // path matches your folder name ("component")

export const metadata = {
  title: "CircularBuild",
  description: "Connected to Supabase",
};

const quickLinks = [
  { label: "Search", href: "/search" },
  { label: "Donate", href: "/donate" },
  { label: "Chats", href: "/chats" },
  { label: "News", href: "/news" },
  { label: "Who we are", href: "/who-we-are" },
  { label: "FAQs", href: "/faqs" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-slate-900">
        <Header />

        <nav className="border-b border-gray-200 bg-white/95">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-slate-600 md:justify-between">
            <span className="hidden text-slate-500 md:inline">
              Explore CircularBuild
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-10">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-slate-50">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <span>© {year} CircularBuild. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/terms"
                className="font-medium text-slate-700 hover:text-emerald-700"
              >
                Terms & Policies
              </Link>
              <Link
                href="/contact"
                className="font-medium text-slate-700 hover:text-emerald-700"
              >
                Contact
              </Link>
              <Link
                href="/news"
                className="font-medium text-slate-700 hover:text-emerald-700"
              >
                News
              </Link>
            </div>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
