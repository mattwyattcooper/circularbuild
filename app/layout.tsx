// app/layout.tsx
import "./globals.css"; // makes Tailwind + global styles work
import { Analytics } from "@vercel/analytics/react";
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
      <body className="flex min-h-screen flex-col bg-white text-gray-900">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="mt-12 border-t border-emerald-100 bg-emerald-50/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-emerald-900 md:flex-row md:items-center md:justify-between">
            <span>© {year} CircularBuild. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/terms"
                className="font-medium text-emerald-700 hover:text-emerald-900"
              >
                Terms & Conditions
              </a>
              <a
                href="/contact"
                className="font-medium text-emerald-700 hover:text-emerald-900"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
