"use client";

import { useEffect, useState } from "react";
import AuthWall from "@/component/AuthWall";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/lib/useRequireAuth";

type Profile = {
  id: string;
  name: string | null;
  is_admin: boolean | null;
};

export default function AccountSettingsPage() {
  const authStatus = useRequireAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [stats, setStats] = useState<{
    activeListings: number;
    wishlistCount: number;
  } | null>(null);

  const messageIsError = /error|failed|unable|expired/i.test(msg);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id,name,is_admin")
        .eq("id", uid)
        .maybeSingle();
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name ?? "");
      }

      const { data: listings } = await supabase
        .from("listings")
        .select("id")
        .eq("owner_id", uid)
        .eq("status", "active");

      const { data: wishlist } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", uid);

      setStats({
        activeListings: listings?.length ?? 0,
        wishlistCount: wishlist?.length ?? 0,
      });
    })();
  }, [authStatus]);

  async function updateProfile() {
    setMsg("");
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Session expired.");
      const trimmed = name.trim();
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: uid, name: trimmed || null })
        .eq("id", uid);
      if (error) throw error;
      setMsg("Profile updated.");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Update failed: ${message}`);
    }
  }

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-emerald-100">
        Checking authentication…
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)]" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <AuthWall message="Sign in to manage your account." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden
      >
        <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(74,222,128,0.3),_transparent_60%)]" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Account details
          </span>
          <h1 className="text-[clamp(2rem,4vw,3.3rem)] font-extrabold leading-tight">
            Update your profile and track how your materials are moving.
          </h1>
          <p className="max-w-2xl text-sm text-emerald-100/90 sm:text-base">
            Your display name helps builders recognize you across listings.
            Review stats to see how many donations and saved items you&apos;re
            managing.
          </p>
        </header>

        {msg && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-lg ${
              messageIsError
                ? "border-rose-200/40 bg-rose-500/20 text-rose-100"
                : "border-emerald-200/40 bg-emerald-500/20 text-emerald-100"
            }`}
          >
            {msg}
          </div>
        )}

        <section className="rounded-3xl border border-white/15 bg-white/10 px-6 py-8 shadow-xl backdrop-blur-lg">
          <h2 className="text-lg font-semibold text-white">Profile details</h2>
          <label className="mt-6 block text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              Display name
            </span>
            <input
              className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add a name other users will recognize"
            />
          </label>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-500"
            onClick={updateProfile}
          >
            Save changes
          </button>
          {profile?.is_admin && (
            <p className="mt-3 text-xs text-emerald-100/75">
              You have admin privileges. You can publish industry news updates.
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-white/15 bg-white/10 px-6 py-6 text-sm text-emerald-100/85 shadow-xl backdrop-blur-lg">
          <h2 className="text-lg font-semibold text-white">At a glance</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <span className="text-2xl font-bold text-white">
                {stats?.activeListings ?? 0}
              </span>{" "}
              active listings awaiting pickup
            </li>
            <li>
              <span className="text-2xl font-bold text-white">
                {stats?.wishlistCount ?? 0}
              </span>{" "}
              saved listings in your wishlist
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
