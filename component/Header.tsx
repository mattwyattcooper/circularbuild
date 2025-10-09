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
    { label: "Donate", href: "/donate", requiresAuth: true },
    { label: "Search", href: "/search" },
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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-semibold text-emerald-700"
        >
          <span className="relative hidden h-10 w-36 overflow-hidden rounded-md border border-white/40 bg-white/10 sm:inline-flex">
            <Image
              src="/logo.jpg"
              alt="CircularBuild logo"
              fill
              priority
              sizes="144px"
              className="object-cover object-center"
            />
          </span>
          <span className="sm:hidden">CircularBuild</span>
        </Link>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = item.match
              ? item.match(pathname)
              : pathname === item.href;
            const baseClasses =
              "rounded-full px-3 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
            const activeClasses = isActive
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600";

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
                className={`${baseClasses} ${activeClasses}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}

          {email ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none"
              >
                {email}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account settings
                  </Link>
                  <Link
                    href="/account/listings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My listings
                  </Link>
                  <Link
                    href="/account/wishlist"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My wishlist
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
            >
              Sign up / Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
