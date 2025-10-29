// app/layout.tsx
import "./globals.css"; // makes Tailwind + global styles work

import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import type { ReactNode } from "react";

import Header from "../component/Header"; // path matches your folder name ("component")
import Providers from "./providers";

export const metadata = {
  title: "CircularBuild",
  description: "Connected to Supabase",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="nUfsdRRUlmedpIwVe8EXirWjwwzHHHo6gIej64ZpbYI"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-white text-slate-900">
        <Providers>
          <Header />

          <main className="flex-1 w-full">{children}</main>

          <footer className="border-t border-gray-200 bg-slate-50">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <span>© {year} CircularBuild. All rights reserved.</span>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="https://www.linkedin.com/company/circularbuildcompany"
                  className="inline-flex items-center gap-2 font-medium text-slate-700 transition hover:text-emerald-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M4.983 3.5a2.484 2.484 0 1 1-.002 4.968 2.484 2.484 0 0 1 .002-4.968zM3.109 9h3.75v12h-3.75zM9.359 9h3.6v1.641h.051c.501-.949 1.726-1.949 3.551-1.949 3.8 0 4.5 2.5 4.5 5.751V21h-3.75v-5.991c0-1.429-.027-3.266-1.989-3.266-1.99 0-2.294 1.555-2.294 3.159V21h-3.75z" />
                  </svg>
                  <span>LinkedIn</span>
                </Link>
                <Link
                  href="/privacy"
                  className="font-medium text-slate-700 hover:text-emerald-700"
                >
                  Privacy Notice
                </Link>
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
        </Providers>

        <Analytics />
      </body>
    </html>
  );
}
