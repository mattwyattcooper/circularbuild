"use client";

import { useState } from "react";

import AuthWall from "@/component/AuthWall";
import { supabase } from "@/lib/supabaseClient";

type Comment = {
  id: string;
  comment: string;
  createdAt: string;
  userName: string;
};

type Props = {
  postId: string;
  initialLikes: number;
  initiallyLiked: boolean;
  initialComments: Comment[];
  isAuthenticated: boolean;
  currentUserId: string;
  currentUserName: string;
  userEmail: string;
};

export default function LikeCommentSection({
  postId,
  initialLikes,
  initiallyLiked,
  initialComments,
  isAuthenticated,
  currentUserId,
  currentUserName,
  userEmail,
}: Props) {
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [liked, setLiked] = useState(initiallyLiked);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [letterBody, setLetterBody] = useState("");
  const [letterStatus, setLetterStatus] = useState("");
  const [letterSubmitting, setLetterSubmitting] = useState(false);

  async function refreshLikes() {
    const { data, error } = await supabase
      .from("news_likes")
      .select("user_id")
      .eq("post_id", postId);
    if (error) {
      console.error("Failed to refresh likes", error);
      return;
    }
    setLikesCount(data.length);
    setLiked(data.some((row) => row.user_id === currentUserId));
  }

  async function toggleLike() {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    if (likeLoading) return;
    const previousLiked = liked;
    const previousCount = likesCount;
    setLikeLoading(true);
    try {
      if (previousLiked) {
        setLiked(false);
        setLikesCount(Math.max(0, previousCount - 1));
        const { error } = await supabase
          .from("news_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUserId);
        if (error) throw error;
      } else {
        setLiked(true);
        setLikesCount(previousCount + 1);
        const { error } = await supabase
          .from("news_likes")
          .upsert({ post_id: postId, user_id: currentUserId });
        if (error) throw error;
      }
      await refreshLikes();
    } catch (error) {
      console.error("Toggle like failed", error);
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setLikeLoading(false);
    }
  }

  async function submitComment() {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    const body = commentText.trim();
    if (!body) return;
    setCommentSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("news_comments")
        .insert({
          post_id: postId,
          user_id: currentUserId,
          comment: body,
        })
        .select("id, comment, created_at")
        .single();
      if (error) throw error;
      setComments((prev) => [
        ...prev,
        {
          id: data.id,
          comment: data.comment,
          createdAt: data.created_at,
          userName: currentUserName,
        },
      ]);
      setCommentText("");
    } catch (error) {
      console.error("Add comment failed", error);
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function submitLetter() {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    const body = letterBody.trim();
    if (!body) {
      setLetterStatus("Please include a message before sending.");
      return;
    }
    setLetterSubmitting(true);
    setLetterStatus("");
    try {
      const formData = new FormData();
      formData.append(
        "name",
        currentUserName || userEmail || "CircularBuild user",
      );
      formData.append("subject", "Letter to the Editor");
      formData.append(
        "body",
        `${body}\n\nStory: ${postId}\nFrom: ${currentUserName} (${userEmail || "unknown"})`,
      );
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data?.error || "Unable to send letter.");
      }
      setLetterStatus("Letter sent. Thanks for sharing your perspective.");
      setLetterBody("");
      setTimeout(() => {
        setLetterOpen(false);
        setLetterStatus("");
      }, 1500);
    } catch (error) {
      console.error("Letter submission failed", error);
      const message =
        error instanceof Error ? error.message : "Unable to send letter.";
      setLetterStatus(`Error: ${message}`);
    } finally {
      setLetterSubmitting(false);
    }
  }

  return (
    <section className="mt-12 space-y-8">
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md">
            <AuthWall
              title="Sign in required"
              message="Sign in to like and comment on briefings."
              nextPath={`/news/${postId}`}
              onPrimaryClick={() => setShowAuthPrompt(false)}
              onSecondaryClick={() => setShowAuthPrompt(false)}
              secondaryHref="/news"
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

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            liked
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "border border-emerald-300 text-emerald-700 hover:border-emerald-500 hover:text-emerald-800"
          }`}
          onClick={toggleLike}
          disabled={likeLoading}
        >
          {liked ? "Liked" : "Like"}
          <span className="text-xs font-normal">({likesCount})</span>
        </button>

        <button
          type="button"
          className="rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-800"
          onClick={() => {
            if (!isAuthenticated) {
              setShowAuthPrompt(true);
              return;
            }
            setLetterOpen(true);
          }}
        >
          A Letter to the Editor
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-emerald-800">Comments</h2>
        <div className="mt-4 space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No comments yet. Share your perspective to start the discussion.
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3"
              >
                <p className="text-sm font-semibold text-emerald-800">
                  {comment.userName}
                </p>
                <p className="mt-1 text-sm text-gray-700">{comment.comment}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 space-y-3">
          <label
            className="block text-sm font-semibold text-emerald-800"
            htmlFor="comment-text"
          >
            Add a comment
          </label>
          <textarea
            className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            id="comment-text"
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your reaction or a resource for fellow readers."
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:bg-emerald-400"
              onClick={submitComment}
              disabled={commentSubmitting || commentText.trim().length === 0}
            >
              {commentSubmitting ? "Posting…" : "Post comment"}
            </button>
          </div>
        </div>
      </div>

      {letterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg space-y-4 rounded-3xl border border-white/20 bg-white/95 p-6 text-sm text-slate-900 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-emerald-800">
                  Letter to the Editor
                </h3>
                <p className="text-xs text-gray-600">
                  Share feedback or a story idea. We read every note.
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                onClick={() => {
                  setLetterOpen(false);
                  setLetterStatus("");
                }}
              >
                Close
              </button>
            </div>
            <textarea
              className="min-h-[160px] w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={letterBody}
              onChange={(e) => setLetterBody(e.target.value)}
              placeholder="Tell us what resonated, what we missed, or what you’re seeing in the field."
            />
            {letterStatus && (
              <div className="text-xs text-emerald-700">{letterStatus}</div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-900"
                onClick={() => {
                  setLetterOpen(false);
                  setLetterStatus("");
                }}
                disabled={letterSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:bg-emerald-400"
                onClick={submitLetter}
                disabled={letterSubmitting}
              >
                {letterSubmitting ? "Sending…" : "Send letter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
