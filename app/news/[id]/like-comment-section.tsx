"use client";

import { useState } from "react";

import AuthWall from "@/component/AuthWall";

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
  currentUserName: string;
  userEmail: string;
};

export default function LikeCommentSection({
  postId,
  initialLikes,
  initiallyLiked,
  initialComments,
  isAuthenticated,
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

  async function toggleLike() {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    if (likeLoading) return;
    setLikeLoading(true);
    const method = liked ? "DELETE" : "POST";
    try {
      const response = await fetch(`/api/news/posts/${postId}/like`, {
        method,
      });
      const data = (await response.json()) as {
        likes?: number;
        liked?: boolean;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update like");
      }
      setLikesCount(data.likes ?? likesCount);
      setLiked(Boolean(data.liked));
    } catch (error) {
      console.error("Toggle like failed", error);
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
      const response = await fetch(`/api/news/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: body }),
      });
      const data = (await response.json()) as {
        comment?: Comment;
        error?: string;
      };
      if (!response.ok || !data.comment) {
        throw new Error(data?.error ?? "Unable to add comment");
      }
      setComments((prev) => (data.comment ? [...prev, data.comment] : prev));
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
      if (userEmail) {
        formData.append("email", userEmail);
      }
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

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            liked
              ? "bg-emerald-600 text-white shadow"
              : "bg-white text-emerald-700 hover:bg-emerald-100"
          }`}
          onClick={toggleLike}
          disabled={likeLoading}
        >
          <span aria-hidden>👍</span>
          {liked ? "Liked" : "Like"}
        </button>
        <span className="text-sm text-emerald-800">
          {likesCount === 1
            ? "1 person liked this story"
            : `${likesCount} people liked this story`}
        </span>
        <button
          type="button"
          className="ml-auto text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 hover:text-emerald-700"
          onClick={() => setLetterOpen((prev) => !prev)}
        >
          {letterOpen ? "Close letter" : "Letter to the editor"}
        </button>
      </div>

      {letterOpen && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-4">
          <h3 className="text-sm font-semibold text-emerald-700">
            Send feedback to the CircularBuild newsroom
          </h3>
          <textarea
            className="mt-3 min-h-[120px] w-full rounded-xl border border-emerald-100 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            placeholder="Share your takeaways, ask a follow-up question, or suggest a future story."
            value={letterBody}
            onChange={(event) => setLetterBody(event.target.value)}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-emerald-700">
            <span>
              From {currentUserName || userEmail || "a CircularBuild supporter"}
            </span>
            <button
              type="button"
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow transition hover:bg-emerald-500 disabled:opacity-60"
              onClick={submitLetter}
              disabled={letterSubmitting}
            >
              {letterSubmitting ? "Sending…" : "Send letter"}
            </button>
          </div>
          {letterStatus && (
            <p className="mt-2 text-xs text-emerald-700">{letterStatus}</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
          Community discussion
        </h3>
        {comments.length === 0 ? (
          <p className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800">
            Be the first to share your thoughts about this briefing.
          </p>
        ) : (
          <ul className="space-y-4">
            {comments.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-emerald-500">
                  <span>{item.userName}</span>
                  <time dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-2 leading-relaxed text-gray-700">
                  {item.comment}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-emerald-700">
          Add a comment
        </h4>
        <textarea
          className="mt-3 w-full rounded-xl border border-emerald-100 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          placeholder="Share a reaction, resource, or related case study."
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
        />
        <div className="mt-3 flex justify-end gap-2 text-xs">
          <button
            type="button"
            className="rounded-full border border-emerald-200 px-4 py-2 text-emerald-600 hover:border-emerald-300 hover:text-emerald-700"
            onClick={() => setCommentText("")}
          >
            Clear
          </button>
          <button
            type="button"
            className="rounded-full bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
            onClick={submitComment}
            disabled={commentSubmitting}
          >
            {commentSubmitting ? "Posting…" : "Post comment"}
          </button>
        </div>
      </div>
    </section>
  );
}
