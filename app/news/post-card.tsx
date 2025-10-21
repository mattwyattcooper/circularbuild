"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthWall from "@/component/AuthWall";
import PostForm from "./post-form";

type Post = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  cover_image_url: string | null;
  author_id: string | null;
};

type Props = {
  post: Post;
  canEdit: boolean;
  readMinutes: number;
  excerpt: string;
  isAuthenticated: boolean;
};

export default function PostCard({
  post,
  canEdit,
  readMinutes,
  excerpt,
  isAuthenticated,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const router = useRouter();

  if (editing) {
    return (
      <article className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <PostForm
          post={post}
          onCancel={() => setEditing(false)}
          onSuccess={() => setEditing(false)}
        />
      </article>
    );
  }

  return (
    <>
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md">
            <AuthWall
              title="Sign in required"
              message="Sign in to read the full briefing and coordinate with donors."
              nextPath={`/news/${post.id}`}
              secondaryHref="/"
              onSecondaryClick={() => setShowAuthPrompt(false)}
              onPrimaryClick={() => setShowAuthPrompt(false)}
            />
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
              onClick={() => setShowAuthPrompt(false)}
            >
              Continue browsing
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        onClick={() => {
          if (!isAuthenticated) {
            setShowAuthPrompt(true);
            return;
          }
          router.push(`/news/${post.id}`);
        }}
      >
        {post.cover_image_url ? (
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="flex h-36 items-center justify-center bg-emerald-50 text-sm text-emerald-600">
            CircularBuild News
          </div>
        )}

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-emerald-600">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <h2 className="text-xl font-semibold text-emerald-800">
              {post.title}
            </h2>
            <p className="text-sm text-gray-600">{excerpt}</p>
          </div>

          <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
            <span>{readMinutes} min read</span>
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  className="rounded-full border border-emerald-200 px-3 py-1 font-semibold text-emerald-700 hover:border-emerald-400"
                  onClick={(event) => {
                    event.stopPropagation();
                    setEditing(true);
                  }}
                >
                  Edit
                </button>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
                Read briefing
              </span>
            </div>
          </div>
        </div>
      </button>
    </>
  );
}
