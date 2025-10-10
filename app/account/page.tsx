"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import AuthWall from "@/component/AuthWall";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/lib/useRequireAuth";

type Profile = {
  id: string;
  name: string | null;
  is_admin: boolean | null;
  gender: string | null;
  age: number | null;
  interests: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function AccountSettingsPage() {
  const authStatus = useRequireAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
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
        .select(
          "id,name,is_admin,gender,age,interests,bio,avatar_url",
        )
        .eq("id", uid)
        .maybeSingle();
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name ?? "");
        setGender(profileData.gender ?? "");
        setAge(
          typeof profileData.age === "number" && !Number.isNaN(profileData.age)
            ? String(profileData.age)
            : "",
        );
        setInterests(profileData.interests ?? "");
        setBio(profileData.bio ?? "");
        setAvatarUrl(profileData.avatar_url ?? null);
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
      const ageValue = age.trim() ? Number.parseInt(age, 10) : null;
      const safeAge = Number.isNaN(ageValue ?? NaN) ? null : ageValue;
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: uid,
          name: trimmed || null,
          gender: gender.trim() || null,
          age: safeAge,
          interests: interests.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq("id", uid);
      if (error) throw error;
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: trimmed || null,
              gender: gender.trim() || null,
              age: safeAge,
              interests: interests.trim() || null,
              bio: bio.trim() || null,
              avatar_url: avatarUrl,
            }
          : prev,
      );
      setMsg("Profile updated.");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Update failed: ${message}`);
    }
  }

  async function handleAvatarUpload(file: File | null) {
    if (!file) return;
    setAvatarUploading(true);
    setMsg("");
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Session expired.");

      const extension = file.name.split(".").pop() ?? "jpg";
      const filePath = `avatars/${uid}-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      setMsg("Avatar updated.");
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to upload avatar";
      setMsg(`Avatar upload failed: ${message}`);
    } finally {
      setAvatarUploading(false);
    }
  }

  const genderOptions = [
    "",
    "Female",
    "Male",
    "Non-binary",
    "Prefer not to say",
  ];

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
          <div className="mt-6 grid gap-6 lg:grid-cols-[auto,1fr] lg:items-start">
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="overflow-hidden rounded-full border border-white/30 bg-white/10 shadow-inner">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={name || "Profile avatar"}
                      width={120}
                      height={120}
                      className="h-28 w-28 object-cover"
                    />
                  ) : (
                    <div className="grid h-28 w-28 place-items-center text-sm text-emerald-100/70">
                      No photo
                    </div>
                  )}
                </div>
                <label className="flex cursor-pointer items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-white hover:text-white">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      void handleAvatarUpload(event.target.files?.[0] ?? null)
                    }
                    disabled={avatarUploading}
                  />
                  {avatarUploading ? "Uploading…" : "Upload photo"}
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-rose-200 transition hover:text-white"
                    onClick={() => setAvatarUrl(null)}
                    disabled={avatarUploading}
                  >
                    Remove photo (save to confirm)
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-5">
              <label className="block text-sm">
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

              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Gender
                </span>
                <select
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "" ? "Prefer not to say" : option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Age
                </span>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Interests
                </span>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Timber reuse, lighting fixtures, student builds"
                />
              </label>

              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Bio
                </span>
                <textarea
                  className="mt-2 min-h-[140px] w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a bit about your projects, donation history, or interests."
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-500 disabled:opacity-60"
              onClick={updateProfile}
              disabled={avatarUploading}
            >
              Save changes
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-emerald-100/80 transition hover:border-white hover:text-white disabled:opacity-60"
              onClick={() => {
                if (profile) {
                  setName(profile.name ?? "");
                  setGender(profile.gender ?? "");
                  setAge(
                    typeof profile.age === "number" && !Number.isNaN(profile.age)
                      ? String(profile.age)
                      : "",
                  );
                  setInterests(profile.interests ?? "");
                  setBio(profile.bio ?? "");
                  setAvatarUrl(profile.avatar_url ?? null);
                  setMsg("Reverted unsaved changes.");
                }
              }}
              disabled={avatarUploading}
            >
              Reset
            </button>
          </div>
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
