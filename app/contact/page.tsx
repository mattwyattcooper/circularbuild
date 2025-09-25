"use client";

import { useState } from "react";
import AuthWall from "@/component/AuthWall";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function ContactPage() {
  const authStatus = useRequireAuth();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setMsg("");
    setSubmitting(true);
    try {
      if (!name.trim()) throw new Error("Please include your name.");
      if (!subject.trim()) throw new Error("Please provide a subject.");
      if (!body.trim()) throw new Error("Tell us how we can help.");

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("subject", subject.trim());
      formData.append("body", body.trim());
      if (files?.length) {
        Array.from(files).forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Message failed");
      }

      if (data.emailSent) {
        setMsg("Message sent. We’ll reply soon.");
      } else {
        setMsg(
          data.emailError
            ? `Message received, but email notification failed: ${data.emailError}`
            : "Message received. Email notification was skipped (SMTP not configured).",
        );
      }
      setName("");
      setSubject("");
      setBody("");
      setFiles(null);
      const input = document.getElementById(
        "attachments",
      ) as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to send message";
      setMsg(`Error: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (authStatus === "checking") {
    return (
      <main className="mx-auto max-w-3xl p-6">Checking authentication…</main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <AuthWall message="Sign in so we can respond to your support request." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10 text-gray-900">
      <div>
        <h1 className="text-3xl font-semibold text-emerald-700">Contact us</h1>
        <p className="mt-2 text-sm text-gray-600">
          Need a hand with your listing, want to suggest a feature, or have
          general feedback? Drop a note and include any supporting files.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Your name</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Subject</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="How can we help?"
            />
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Message</span>
          <textarea
            className="min-h-[160px] rounded-lg border px-3 py-2"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell us about the issue or idea."
          />
        </label>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium">Attachments (PDF or JPEG)</span>
          <input
            id="attachments"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
          <span className="text-xs text-gray-500">
            Attach screenshots, plans, or paperwork. Max 10 MB per file.
          </span>
        </label>

        <div className="mt-6 flex justify-end gap-3 text-sm">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-4 py-2"
            onClick={() => {
              setName("");
              setSubject("");
              setBody("");
              setFiles(null);
              const input = document.getElementById(
                "attachments",
              ) as HTMLInputElement | null;
              if (input) input.value = "";
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? "Sending…" : "Send message"}
          </button>
        </div>
      </div>

      {msg && <div className="text-sm">{msg}</div>}
    </main>
  );
}
