// app/news/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";

import NewsNotificationPrompt from "./notification-prompt";
import PostCard from "./post-card";
import PostForm from "./post-form";

export const dynamic = "force-dynamic";

function estimateReadMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 200));
}

function buildExcerpt(body: string, limit = 220) {
  const plain = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\(([^)]*)\)/g, "$1")
    .replace(/[#>*_~`-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > limit ? `${plain.slice(0, limit - 1)}…` : plain;
}

export default async function NewsPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-amber-900">
          <h2 className="text-xl font-semibold text-emerald-700">
            Sign in to follow industry updates
          </h2>
          <p className="mt-3 text-sm">
            CircularBuild news covers waste diversion breakthroughs, policy
            moves, and project stories curated for our community. Log in to keep
            reading and opt into alerts.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/auth"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
            >
              Go to sign in
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-700"
            >
              Return home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: posts, error: postsErr } = await supabase
    .from("news_posts")
    .select("id, title, body, created_at, cover_image_url, author_id")
    .order("created_at", { ascending: false });

  let isAdmin = false;
  if (session?.user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();
    isAdmin = Boolean(profile?.is_admin);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-8 text-white shadow-sm">
        <span className="inline-flex rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide">
          CircularBuild briefing
        </span>
        <h1 className="mt-3 text-3xl font-semibold">
          Industry news &amp; impact
        </h1>
        <p className="mt-3 text-sm text-emerald-100">
          Dig into policy moves, zero-waste pilots, and donor success stories
          that are pushing construction toward a circular future. Updates come
          straight from our research desk and field partners.
        </p>
        <div className="mt-6 grid gap-4 text-xs text-emerald-100 md:grid-cols-3">
          <div>
            <p className="font-semibold text-white">
              City-scale reuse ordinances
            </p>
            <p className="mt-1">
              Tracking legislation that unlocks donation pipelines.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Nonprofit spotlights</p>
            <p className="mt-1">
              Stories from crews who are building with reclaimed materials.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Platform insights</p>
            <p className="mt-1">
              Metrics on landfill diversion and emerging materials supply.
            </p>
          </div>
        </div>
      </section>

      <NewsNotificationPrompt />

      {isAdmin && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-700">
            Publish a new briefing
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Share an industry update, donor success, or policy milestone.
            Readers can opt into push notifications to stay up to speed.
          </p>
          <PostForm />
        </div>
      )}

      {postsErr && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Failed to load posts.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {(posts ?? []).map((post) => {
          const readMinutes = estimateReadMinutes(post.body ?? "");
          const excerpt = buildExcerpt(post.body ?? "");
          const canEdit = isAdmin || post.author_id === session.user?.id;
          return (
            <PostCard
              key={post.id}
              post={post}
              readMinutes={readMinutes}
              excerpt={excerpt}
              canEdit={canEdit}
            />
          );
        })}
      </div>

      {(!posts || posts.length === 0) && !postsErr && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800">
          No news yet. When new circular construction stories land, they will
          appear here first.
        </div>
      )}
    </div>
  );
}
