"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const navItems: Array<{
    label: string;
    href: string;
    requiresAuth?: boolean;
    match?: (current: string) => boolean;
  }> = [
    { label: "Who We Are", href: "/who-we-are" },
    { label: "Search", href: "/search" },
    { label: "Donate", href: "/donate" },
    {
      label: "Chats",
      href: "/chats",
      match: (cur) => cur.startsWith("/chats"),
    },
    { label: "News", href: "/news" },
    { label: "FAQs", href: "/faqs" },
    { label: "Contact", href: "/contact", requiresAuth: true },
  ];

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setEmail(session?.user.email ?? null);
      if (session?.user.id) {
        void loadProfile(session.user.id);
      } else {
        setDisplayName(null);
        setAvatarUrl(null);
      }
    });
    // Listen for auth state changes (e.g. sign in / sign out)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      if (session?.user?.id) {
        void loadProfile(session.user.id);
      } else {
        setDisplayName(null);
        setAvatarUrl(null);
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("name,avatar_url")
      .eq("id", userId)
      .maybeSingle();
    setDisplayName(data?.name ?? null);
    setAvatarUrl(data?.avatar_url ?? null);
  }

  useEffect(() => {
    if (!menuOpen) return;

    function handleClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          aria-label="CircularBuild home"
          className="group flex h-full items-center gap-2 text-2xl font-semibold text-emerald-700 transition"
        >
          <span className="relative hidden h-full w-48 overflow-hidden rounded-lg border border-emerald-100 bg-white/80 shadow-sm transition group-hover:border-emerald-300 group-hover:shadow-lg sm:inline-flex">
            <Image
              src="/logo.jpg"
              alt="CircularBuild logo"
              fill
              priority
              sizes="192px"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </span>
          <span className="rounded-lg border border-emerald-100 px-3 py-2 text-lg shadow-sm transition group-hover:border-emerald-300 group-hover:shadow-lg sm:hidden">
            CircularBuild
          </span>
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
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none"
              >
                <span className="relative h-7 w-7 overflow-hidden rounded-full border border-white/40 bg-white/20">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName ?? email ?? "Account avatar"}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      className="h-full w-full p-1 text-emerald-50"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" />
                    </svg>
                  )}
                </span>
                <span>{displayName ?? email}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Account Details
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
