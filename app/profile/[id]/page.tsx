import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import AuthWall from "@/component/AuthWall";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  name: string | null;
  bio: string | null;
  interests: string | null;
  gender: string | null;
  age: number | null;
  avatar_url: string | null;
};

type ListingSummary = {
  id: string;
  title: string;
  status: string;
  available_until: string;
  location_text: string;
  photos: string[] | null;
};

export default async function ProfileDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <AuthWall
          title="Sign in to view member profiles"
          message="Create an account or sign in to learn more about fellow donors and builders."
          nextPath={`/profile/${params.id}`}
          secondaryHref="/search"
        />
      </main>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, name, bio, interests, gender, age, avatar_url",
    )
    .eq("id", params.id)
    .maybeSingle<Profile>();

  if (profileError || !profile) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center text-slate-900">
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 shadow-sm">
          <h1 className="text-xl font-semibold text-red-700">Profile unavailable</h1>
          <p className="mt-3 text-sm text-red-600">
            We couldn&apos;t find details for this member. They may have closed their account or the link is incorrect.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to search
          </Link>
        </div>
      </main>
    );
  }

  const viewingOwnProfile = profile.id === session.user.id;

  const { data: listings } = await supabase
    .from("listings")
    .select(
      "id, title, status, available_until, location_text, photos",
    )
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const activeListings = (listings ?? []).filter(
    (listing) => listing.status === "active",
  );

  const archivedListings = (listings ?? []).filter(
    (listing) => listing.status !== "active",
  );

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(74,222,128,0.35),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-lg">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.name ?? "Profile avatar"}
                  width={144}
                  height={144}
                  className="h-36 w-36 object-cover"
                />
              ) : (
                <div className="grid h-36 w-36 place-items-center text-emerald-100/70">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-16 w-16"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" />
                  </svg>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-tight">
                {profile.name ?? "CircularBuild member"}
              </h1>
              <div className="flex flex-wrap gap-3 text-xs text-emerald-100/80">
                {profile.gender && (
                  <span className="rounded-full border border-white/20 px-3 py-1 uppercase tracking-[0.2em]">
                    {profile.gender}
                  </span>
                )}
                {typeof profile.age === "number" && !Number.isNaN(profile.age) && (
                  <span className="rounded-full border border-white/20 px-3 py-1 uppercase tracking-[0.2em]">
                    Age {profile.age}
                  </span>
                )}
                {profile.interests && (
                  <span className="rounded-full border border-white/20 px-3 py-1">
                    {profile.interests}
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="max-w-2xl text-sm text-emerald-100/90 leading-6">
                  {profile.bio}
                </p>
              )}
              {viewingOwnProfile && (
                <Link
                  href="/account"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-white hover:bg-white/20"
                >
                  Edit account details
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate flex-1 overflow-hidden border-t border-white/10">
        <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.28),_transparent_65%)]" />
        </div>
        <div className="relative mx-auto w-full max-w-5xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-lg font-semibold text-white">Active listings</h2>
            {activeListings.length === 0 ? (
              <p className="mt-3 text-sm text-emerald-100/70">
                No active donations at the moment. Check back soon to see what this member shares next.
              </p>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {activeListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="group flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-5 text-sm text-emerald-100/85 shadow-lg backdrop-blur-lg transition hover:-translate-y-1 hover:border-white hover:text-white"
                  >
                    {listing.photos?.[0] ? (
                      <div className="relative h-40 w-full overflow-hidden rounded-xl">
                        <Image
                          src={listing.photos[0]}
                          alt={listing.title}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                    ) : (
                      <div className="grid h-40 w-full place-items-center rounded-xl border border-white/10 bg-white/5 text-xs">
                        No photo provided
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {listing.title}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                        Available until {listing.available_until}
                      </p>
                      <p className="mt-1 text-xs text-emerald-100/70">
                        {listing.location_text}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Recent activity</h2>
            {archivedListings.length === 0 ? (
              <p className="mt-3 text-sm text-emerald-100/70">
                This member hasn&apos;t archived any listings yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {archivedListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-sm text-emerald-100/80 shadow backdrop-blur"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-white">
                        {listing.title}
                      </span>
                      <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                        {listing.status}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-100/60">
                      Available until {listing.available_until} • {listing.location_text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
