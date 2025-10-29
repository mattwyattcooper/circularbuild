"use client";

import { useSession } from "next-auth/react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

import AuthWall from "@/component/AuthWall";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function ContactPage() {
  const authStatus = useRequireAuth();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const attachmentsInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const userEmail = session?.user?.email ?? "";

  useEffect(() => {
    if (!name && session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name, name]);

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []);
    if (!incoming.length) return;

    const accepted: File[] = [];
    let rejectedName: string | null = null;

    incoming.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        if (!rejectedName) {
          rejectedName = file.name;
        }
        return;
      }
      accepted.push(file);
    });

    if (rejectedName) {
      setMsg(`Error: "${rejectedName}" exceeds the 10 MB limit.`);
    }

    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted]);
      if (!rejectedName) {
        setMsg("");
      }
    }

    if (attachmentsInputRef.current) {
      attachmentsInputRef.current.value = "";
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

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
      if (userEmail) {
        formData.append("email", userEmail);
      }
      if (files.length) {
        files.forEach((file) => {
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
            : "Message received!",
        );
      }
      setName("");
      setSubject("");
      setBody("");
      setFiles([]);
      if (attachmentsInputRef.current) {
        attachmentsInputRef.current.value = "";
      }
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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-emerald-100">
        Checking authentication…
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="absolute inset-0 opacity-35" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)]" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <AuthWall message="Sign in so we can respond to your support request." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col text-white">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(74,222,128,0.32),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto flex min-h-[40vh] w-full max-w-6xl flex-col justify-center gap-6 px-4 py-16 sm:px-6 lg:px-10">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Contact the team
            </span>
            <h1 className="text-[clamp(2.2rem,4vw,3.6rem)] font-extrabold leading-tight">
              Let’s keep your materials moving.
            </h1>
            <p className="text-sm text-emerald-100/85 sm:text-base">
              Ask about a listing, request donor support, coordinate a
              partnership, or share product feedback. Attach files so we can
              assist even faster.
            </p>
          </div>
        </div>
      </section>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.28),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-xl backdrop-blur">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Your name
                </span>
                <input
                  className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Subject
                </span>
                <input
                  className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                />
              </label>
            </div>

            <label className="mt-6 flex flex-col gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Message
              </span>
              <textarea
                className="min-h-[180px] rounded-3xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tell us about the request or idea. Include key details so we can jump in quickly."
              />
            </label>

            <div className="mt-6 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Attachments (PDF, JPEG, PNG)
              </span>
              <label
                htmlFor="attachments"
                className="inline-flex w-max cursor-pointer items-center gap-2 rounded-full border border-emerald-300/60 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100/90 transition hover:border-white hover:text-white"
              >
                <span>Choose files</span>
              </label>
              <input
                ref={attachmentsInputRef}
                id="attachments"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                multiple
                className="sr-only"
                onChange={handleFileSelect}
              />
              <span className="text-xs text-emerald-100/70">
                Attach screenshots, plans, or paperwork. Max 10 MB per file.
              </span>
              {files.length > 0 && (
                <ul className="space-y-1 text-xs text-emerald-100/80">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        className="rounded-full border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/80 transition hover:border-white hover:text-white"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-8 flex flex-wrap justify-end gap-3 text-sm">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-semibold text-emerald-100/80 transition hover:border-white hover:text-white"
                onClick={() => {
                  setName("");
                  setSubject("");
                  setBody("");
                  setFiles([]);
                  if (attachmentsInputRef.current) {
                    attachmentsInputRef.current.value = "";
                  }
                  setMsg("");
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 font-semibold text-white shadow-lg transition hover:bg-emerald-400 disabled:bg-emerald-400"
                disabled={submitting}
                onClick={submit}
              >
                {submitting ? "Sending…" : "Send message"}
              </button>
            </div>

            {msg && (
              <div className="mt-6 text-sm text-emerald-100/90">{msg}</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
