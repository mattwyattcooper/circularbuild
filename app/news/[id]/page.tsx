import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Schema } from "hast-util-sanitize";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

import LikeCommentSection from "./like-comment-section";

export const dynamic = "force-dynamic";

type NewsPost = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  cover_image_url: string | null;
};

type CommentDisplay = {
  id: string;
  comment: string;
  createdAt: string;
  userName: string;
};

const markdownSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "figure",
    "figcaption",
    "iframe",
  ],
  attributes: {
    ...defaultSchema.attributes,
    iframe: [
      ...(defaultSchema.attributes?.iframe ?? []),
      ["src"],
      ["width"],
      ["height"],
      ["allow"],
      ["allowfullscreen"],
      ["frameborder"],
      ["loading"],
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      ["className"],
      ["style"],
      ["width"],
      ["height"],
    ],
    div: [...(defaultSchema.attributes?.div ?? []), ["className"], ["style"]],
  },
};

const markdownComponents: Components = {
  h1: (props) => (
    <h1 className="mt-10 text-3xl font-semibold text-emerald-800" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-8 text-2xl font-semibold text-emerald-800" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-6 text-xl font-semibold text-emerald-800" {...props} />
  ),
  p: (props) => <p className="mt-4 leading-relaxed text-gray-700" {...props} />,
  ul: (props) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-gray-700" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-4 border-emerald-200 bg-emerald-50/60 px-5 py-3 text-gray-700"
      {...props}
    />
  ),
  img: ({ src, alt, width, height }) => {
    if (!src || typeof src !== "string") {
      return null;
    }
    const resolvedWidth =
      typeof width === "string" ? parseInt(width, 10) || 1200 : (width ?? 1200);
    const resolvedHeight =
      typeof height === "string"
        ? parseInt(height, 10) || 675
        : (height ?? 675);
    return (
      <div className="my-6 overflow-hidden rounded-2xl">
        <Image
          src={src}
          alt={alt || "News illustration"}
          width={resolvedWidth}
          height={resolvedHeight}
          className="h-auto w-full rounded-2xl object-cover"
        />
      </div>
    );
  },
  iframe: ({ title, ...props }) => (
    <div className="my-6 overflow-hidden rounded-2xl">
      <iframe
        className="aspect-video h-full w-full"
        loading="lazy"
        title={title || "Embedded content"}
        {...props}
      />
    </div>
  ),
};

function estimateReadMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 200));
}

export default async function NewsDetailPage({
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
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-amber-900">
          <h2 className="text-xl font-semibold text-emerald-700">
            Sign in to read this briefing
          </h2>
          <p className="mt-3 text-sm">
            Log in to access community briefings, project deep dives, and policy
            updates from CircularBuild.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/auth"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
            >
              Go to sign in
            </Link>
            <Link
              href="/news"
              className="rounded-lg border border-emerald-600 px-4 py-2 text-emerald-700"
            >
              Back to news
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: post, error } = await supabase
    .from("news_posts")
    .select("id, title, body, created_at, cover_image_url")
    .eq("id", params.id)
    .single<NewsPost>();

  if (error || !post) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-red-800">
          <h2 className="text-xl font-semibold">Story unavailable</h2>
          <p className="mt-3 text-sm">
            We couldn&apos;t find this briefing. It may have been unpublished or
            the link is incorrect.
          </p>
          <div className="mt-6">
            <Link
              href="/news"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
            >
              Return to news hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const readMinutes = estimateReadMinutes(post.body ?? "");

  const { data: likesRows } = await supabase
    .from("news_likes")
    .select("user_id")
    .eq("post_id", post.id);

  const likesCount = likesRows?.length ?? 0;
  const likedByUser = Boolean(
    likesRows?.some((row) => row.user_id === session.user.id),
  );

  const { data: commentRows } = await supabase
    .from("news_comments")
    .select("id, comment, created_at, user_id, profiles(name)")
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  const comments: CommentDisplay[] = (commentRows ?? []).map((row) => {
    const profileEntry = Array.isArray(row.profiles)
      ? (row.profiles[0] ?? null)
      : (row.profiles ?? null);
    return {
      id: row.id,
      comment: row.comment,
      createdAt: row.created_at,
      userName: profileEntry?.name ?? "CircularBuild member",
    };
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", session.user.id)
    .maybeSingle();

  const currentUserName =
    profile?.name ?? session.user.email ?? "CircularBuild member";
  const userEmail = session.user.email ?? "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/news"
        className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        ← Back to all briefings
      </Link>

      <header className="mt-6 space-y-4">
        <h1 className="text-3xl font-semibold text-emerald-800">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
          <span>
            {new Date(post.created_at).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span aria-hidden>•</span>
          <span>{readMinutes} min read</span>
        </div>
      </header>

      {post.cover_image_url && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <div className="prose prose-emerald mt-8 max-w-none">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSchema]]}
          components={markdownComponents}
        >
          {post.body}
        </ReactMarkdown>
      </div>

      <LikeCommentSection
        postId={post.id}
        initialLikes={likesCount}
        initiallyLiked={likedByUser}
        initialComments={comments}
        isAuthenticated={Boolean(session)}
        currentUserId={session.user.id}
        currentUserName={currentUserName}
        userEmail={userEmail}
      />
    </article>
  );
}
