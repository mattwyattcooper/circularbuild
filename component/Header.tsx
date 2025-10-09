"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems: Array<{
    label: string;
    href: string;
    requiresAuth?: boolean;
    match?: (current: string) => boolean;
  }> = [
    { label: "Who We Are", href: "/who-we-are" },
    { label: "Search", href: "/search" },
    { label: "Donate", href: "/donate", requiresAuth: true },
    {
      label: "Chats",
      href: "/chats",
      requiresAuth: true,
      match: (cur) => cur.startsWith("/chats"),
    },
    { label: "News", href: "/news" },
    { label: "FAQs", href: "/faqs" },
    { label: "Contact", href: "/contact", requiresAuth: true },
  ];

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });
    // Listen for auth state changes (e.g. sign in / sign out)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-display font-semibold text-emerald-700"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-emerald-100 bg-emerald-50">
              <Image
                src="/logo.jpg"
                alt="CircularBuild logo"
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <span className="hidden md:inline">CircularBuild</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => router.push("/search")}
          className="hidden w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2 text-left text-sm text-slate-500 shadow-sm transition hover:border-emerald-500 hover:text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 md:flex"
          aria-label="Open marketplace search"
        >
          <span className="flex-1">Search materials, locations, partners…</span>
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
            Search
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 lg:inline-flex"
            onClick={() => {
              if (!email) {
                router.push("/auth?next=/donate");
                return;
              }
              router.push("/donate");
            }}
          >
            Donate
          </button>
          {email ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
              >
                <span className="hidden sm:inline">{email}</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs">
                  {email.slice(0, 2).toUpperCase()}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <Link
                    href="/account"
                    className="block rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-emerald-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account settings
                  </Link>
                  <Link
                    href="/account/listings"
                    className="block rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-emerald-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My listings
                  </Link>
                  <Link
                    href="/account/wishlist"
                    className="block rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-emerald-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My wishlist
                  </Link>
                  <button
                    type="button"
                    className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setMenuOpen(false);
                      router.push("/");
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="hidden rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 md:inline-flex"
                onClick={() => router.push("/auth")}
              >
                Sign in
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600 md:hidden"
                onClick={() => router.push("/auth")}
                aria-label="Open account"
              >
                <svg
                  width="20"
                  height="20"
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </button>
            </div>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600 md:hidden"
            aria-label="Open navigation"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <svg
              width="20"
              height="20"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-[1200px] items-center gap-3 overflow-x-auto px-4 py-3 text-sm text-slate-600 sm:px-6 lg:px-8">
          {navItems.map((item) => {
            const isActive = item.match
              ? item.match(pathname)
              : pathname === item.href;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => {
                  if (item.requiresAuth && !email) {
                    router.push(`/auth?next=${encodeURIComponent(item.href)}`);
                    return;
                  }
                  router.push(item.href);
                }}
                className={`rounded-full px-3 py-1.5 text-sm transition hover:text-emerald-600 ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-600"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
