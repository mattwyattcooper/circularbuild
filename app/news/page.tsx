// app/news/page.tsx
import { getOptionalUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

import NewsNotificationPrompt from "./notification-prompt";
import PostCard from "./post-card";
import PostForm from "./post-form";

export const dynamic = "force-dynamic";

type NewsPostRow = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  cover_image_url: string | null;
  author_id: string | null;
};

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
  const supabase = getSupabaseAdminClient()!;
  const user = await getOptionalUser();

  const { data: postsData, error: postsErr } = await supabase
    .from("news_posts")
    .select("id, title, body, created_at, cover_image_url, author_id")
    .order("created_at", { ascending: false });

  const posts = (postsData ?? []) as NewsPostRow[];

  let isAdmin = false;
  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    const profileRow = profile as { is_admin: boolean | null } | null;
    isAdmin = Boolean(profileRow?.is_admin);
  }

  const isAuthenticated = Boolean(user);

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
          const canEdit = isAdmin || post.author_id === user?.id;
          return (
            <PostCard
              key={post.id}
              post={post}
              readMinutes={readMinutes}
              excerpt={excerpt}
              canEdit={canEdit}
              isAuthenticated={isAuthenticated}
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
