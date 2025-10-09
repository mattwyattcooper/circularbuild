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

export default function RootLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-slate-900">
        <Header />

        <main className="flex-1 w-full">{children}</main>

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
