"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "../lib/supabaseClient";

const navItems: Array<{
  label: string;
  href: string;
  requiresAuth?: boolean;
  match?: (current: string) => boolean;
}> = [
  { label: "Who we are", href: "/who-we-are" },
  { label: "Donate", href: "/donate", requiresAuth: true },
  { label: "Search", href: "/search", requiresAuth: true },
  {
    label: "Chats",
    href: "/chats",
    requiresAuth: true,
    match: (cur) => cur.startsWith("/chats"),
  },
  { label: "News", href: "/news", requiresAuth: true },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact", requiresAuth: true },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleNavClick = (item: (typeof navItems)[number]) => {
    if (item.requiresAuth && !email) {
      window.alert("Please sign in to access this feature.");
      router.push("/auth");
      return;
    }
    router.push(item.href);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-content items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-brand-emerald/30 bg-brand-emerald/10">
            <Image
              src="/logo.jpg"
              alt="CircularBuild logo"
              fill
              sizes="44px"
              className="object-cover object-center"
            />
          </span>
          <div className="hidden flex-col leading-none md:flex">
            <span className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-emerald">
              CircularBuild
            </span>
            <span className="text-lg font-semibold text-brand-ink">
              Closing the loop on construction surplus
            </span>
          </div>
          <span className="text-lg font-semibold text-brand-ink md:hidden">
            CircularBuild
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = item.match
              ? item.match(pathname)
              : pathname === item.href;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`rounded-pill px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-emerald ${
                  isActive
                    ? "bg-brand-emerald text-white shadow-brand"
                    : "text-brand-slate hover:bg-brand-emerald/10 hover:text-brand-emerald"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="hidden rounded-pill border border-brand-emerald/40 px-4 py-2 text-sm font-semibold text-brand-slate transition hover:border-brand-emerald hover:bg-brand-emerald/10 hover:text-brand-emerald md:inline-flex"
          >
            Browse listings
          </Link>
          {email ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-pill bg-brand-emerald px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-emeraldDark"
              >
                <span className="hidden sm:inline">{email}</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs">
                  {email.slice(0, 2).toUpperCase()}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/70 bg-white p-2 shadow-xl">
                  <Link
                    href="/account"
                    className="block rounded-xl px-3 py-2 text-sm text-brand-slate transition hover:bg-brand-emerald/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account settings
                  </Link>
                  <Link
                    href="/account/listings"
                    className="block rounded-xl px-3 py-2 text-sm text-brand-slate transition hover:bg-brand-emerald/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    My listings
                  </Link>
                  <Link
                    href="/account/wishlist"
                    className="block rounded-xl px-3 py-2 text-sm text-brand-slate transition hover:bg-brand-emerald/10"
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
            <Link
              href="/auth"
              className="rounded-pill bg-brand-emerald px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-emeraldDark"
            >
              Sign up / Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
