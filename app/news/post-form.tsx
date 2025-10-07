"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Post = {
  id?: string;
  title?: string;
  body?: string;
  cover_image_url?: string | null;
};

type Props = {
  post?: Post;
  onSuccess?: () => void;
  onCancel?: () => void;
};
const CREATE_PLACEHOLDER = [
  "Write your story...",
  "",
  "Examples:",
  "## Headline",
  "Share narrative with **bold** insights, bullet points, and more.",
  "",
  "![Reclaimed timber](https://example.com/photo.jpg)",
  "",
  "<iframe title='Example chart' src='https://charts.example.com/embed/123' height='320'></iframe>",
].join("\n");

export default function PostForm({ post, onSuccess, onCancel }: Props) {
  const isEditing = Boolean(post?.id);
  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    post?.cover_image_url ?? "",
  );
  const [msg, setMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTitle(post?.title ?? "");
    setBody(post?.body ?? "");
    setCoverImageUrl(post?.cover_image_url ?? "");
  }, [post?.title, post?.body, post?.cover_image_url]);

  async function submit() {
    setMsg("");
    setSubmitting(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Please sign in again.");
      if (!title.trim()) throw new Error("Title is required.");
      if (!body.trim()) throw new Error("Body is required.");

      if (isEditing) {
        const { error } = await supabase
          .from("news_posts")
          .update({
            title: title.trim(),
            body: body.trim(),
            cover_image_url: coverImageUrl.trim() || null,
          })
          .eq("id", post?.id);
        if (error) throw error;
        setMsg("Post updated.");
      } else {
        const { error } = await supabase.from("news_posts").insert({
          title: title.trim(),
          body: body.trim(),
          cover_image_url: coverImageUrl.trim() || null,
          author_id: uid,
        });
        if (error) throw error;
        setTitle("");
        setBody("");
        setCoverImageUrl("");
        setMsg("Post published.");
      }

      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Failed to save: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-medium">
        {isEditing ? "Edit briefing" : "Share a new update"}
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        Highlight waste diversion wins, industry trends, or project spotlights.
        Use Markdown (headings, lists, images) or HTML snippets for embeds.
      </p>
      <div className="mt-4 space-y-3">
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Headline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Cover image URL (optional)"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
        />
        <textarea
          className="min-h-[200px] w-full rounded-lg border px-3 py-2 font-mono text-sm"
          placeholder={isEditing ? undefined : CREATE_PLACEHOLDER}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <div className="mt-4 flex justify-end gap-3 text-sm">
        {isEditing ? (
          <>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2"
              onClick={() => {
                setTitle(post?.title ?? "");
                setBody(post?.body ?? "");
                setCoverImageUrl(post?.cover_image_url ?? "");
                onCancel?.();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2"
              onClick={() => {
                setTitle("");
                setBody("");
                setCoverImageUrl("");
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Publishing…" : "Publish"}
            </button>
          </>
        )}
      </div>
      {msg && <div className="mt-3 text-xs text-gray-600">{msg}</div>}
    </div>
  );
}
