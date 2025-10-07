"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Props = {
  onCreated?: () => void;
};

export default function NewPostForm({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function submit() {
    setMsg("");
    setSubmitting(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Please sign in again.");
      if (!title.trim()) throw new Error("Title is required.");
      if (!body.trim()) throw new Error("Body is required.");

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
      onCreated?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Failed to publish: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-medium">Share a new update</h2>
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
          placeholder="Write your story...

Examples:
## Headline
Share narrative with **bold** insights, bullet points, and more.

![Reclaimed timber](https://example.com/photo.jpg)

<iframe src='https://charts.example.com/embed/123' height='320'></iframe>"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <div className="mt-4 flex justify-end gap-3 text-sm">
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
      </div>
      {msg && <div className="mt-3 text-xs text-gray-600">{msg}</div>}
    </div>
  );
}
