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
      <main className="mx-auto max-w-3xl p-6">Checking authentication…</main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <AuthWall message="Sign in to manage your account." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold">Account settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your public profile and keep tabs on the activity associated
          with your listings and wishlist.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Profile details</h2>
        <label className="mt-4 block text-sm">
          <span className="font-medium">Display name</span>
          <input
            className="mt-2 w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a name other users will recognize"
          />
        </label>
        <button
          type="button"
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
          onClick={updateProfile}
        >
          Save changes
        </button>
        {profile?.is_admin && (
          <p className="mt-3 text-xs text-emerald-700">
            You have admin privileges. You can publish industry news updates.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-sm">
        <h2 className="text-lg font-semibold">At a glance</h2>
        <ul className="mt-3 space-y-2 text-gray-600">
          <li>
            <strong>{stats?.activeListings ?? 0}</strong> active listings
            awaiting pickup
          </li>
          <li>
            <strong>{stats?.wishlistCount ?? 0}</strong> saved listings in your
            wishlist
          </li>
        </ul>
      </div>

      {msg && <div className="text-sm">{msg}</div>}
    </main>
  );
}
