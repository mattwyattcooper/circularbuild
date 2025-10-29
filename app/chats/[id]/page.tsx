"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import AuthWall from "@/component/AuthWall";
import ParallaxSection from "@/component/ParallaxSection";
import { useRequireAuth } from "@/lib/useRequireAuth";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type ListingSummary = {
  id: string;
  title: string;
  photos?: string[] | null;
  location_text?: string | null;
};

type ProfileSummary = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type ChatPayload = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listing?: ListingSummary | ListingSummary[] | null;
  buyer?: ProfileSummary | ProfileSummary[] | null;
  seller?: ProfileSummary | ProfileSummary[] | null;
  participants?: Array<{
    user_id: string;
    has_unread: boolean;
    last_read_at: string | null;
  }>;
};

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const authStatus = useRequireAuth();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const [chat, setChat] = useState<ChatPayload | null>(null);
  const [listing, setListing] = useState<ListingSummary | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<ProfileSummary | null>(null);
  const [sellerProfile, setSellerProfile] = useState<ProfileSummary | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportBody, setReportBody] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);
  const messageCountRef = useRef<number>(0);
  const initialLoadRef = useRef(true);
  const reportFileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const markChatRead = useCallback(async () => {
    if (!chatId) return;
    try {
      await fetch(`/api/chats/${chatId}/read`, { method: "POST" });
    } catch (error) {
      console.error("Failed to mark chat read", error);
    }
  }, [chatId]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !chatId || !userId) return;

    initialLoadRef.current = true;
    messageCountRef.current = 0;

    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          cache: "no-store",
        });
        if (response.status === 401 || response.status === 403) {
          if (!cancelled) setMsg("You do not have access to this chat.");
          return;
        }
        const data = (await response.json()) as {
          chat?: ChatPayload | null;
          messages?: Message[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to load chat");
        }
        if (!cancelled) {
          setChat(data.chat ?? null);
          const listingValue = Array.isArray(data.chat?.listing)
            ? (data.chat?.listing?.[0] ?? null)
            : ((data.chat?.listing as ListingSummary | null | undefined) ??
              null);
          setListing(listingValue);
          const buyerValue = Array.isArray(data.chat?.buyer)
            ? (data.chat?.buyer?.[0] ?? null)
            : ((data.chat?.buyer as ProfileSummary | null | undefined) ?? null);
          const sellerValue = Array.isArray(data.chat?.seller)
            ? (data.chat?.seller?.[0] ?? null)
            : ((data.chat?.seller as ProfileSummary | null | undefined) ??
              null);
          setBuyerProfile(buyerValue);
          setSellerProfile(sellerValue);
          const nextMessages = data.messages ?? [];
          const nextCount = nextMessages.length;

          setMessages(nextMessages);

          const shouldAutoScroll =
            initialLoadRef.current || nextCount > messageCountRef.current;

          if (shouldAutoScroll) {
            setTimeout(scrollToBottom, 0);
          }

          initialLoadRef.current = false;
          messageCountRef.current = nextCount;
          await markChatRead();
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          const message =
            error instanceof Error ? error.message : "Unable to load chat";
          setMsg(`Error: ${message}`);
        }
      }
    };

    void load();
    pollRef.current = setInterval(load, 5000);

    return () => {
      cancelled = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [authStatus, chatId, userId, markChatRead, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!chatId || !body.trim()) return;
    setMsg("");
    try {
      const response = await fetch("/api/chats/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, body }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to send message");
      }
      setBody("");
      // reload messages immediately
      const reload = await fetch(`/api/chats/${chatId}`, { cache: "no-store" });
      const payload = (await reload.json()) as { messages?: Message[] };
      if (reload.ok && payload.messages) {
        const nextMessages = payload.messages;
        const nextCount = nextMessages.length;
        setMessages(nextMessages);
        messageCountRef.current = nextCount;
        setTimeout(scrollToBottom, 0);
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Unable to send message";
      setMsg(`Error: ${message}`);
    }
  }, [body, chatId, scrollToBottom]);

  const handleReportSubmit = useCallback(async () => {
    if (!listing || !buyerProfile || !sellerProfile) return;
    setReportSubmitting(true);
    setReportStatus("");
    try {
      const formData = new FormData();
      formData.append("subject", `Chat report (${chatId})`);
      formData.append(
        "body",
        `Chat ID: ${chatId}\nListing: ${listing.title}\nReporter: ${session?.user?.email ?? "Unknown"}\n\n${reportBody}`,
      );
      if (reportFiles.length) {
        reportFiles.forEach((file) => {
          formData.append("attachments", file, file.name);
        });
      }
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to submit report");
      }
      setReportStatus("Report sent. Thank you for letting us know.");
      setReportBody("");
      setReportFiles([]);
      if (reportFileInputRef.current) {
        reportFileInputRef.current.value = "";
      }
      setTimeout(() => {
        setReportOpen(false);
        setReportStatus("");
      }, 1500);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Unable to submit report";
      setReportStatus(`Error: ${message}`);
    } finally {
      setReportSubmitting(false);
    }
  }, [
    chatId,
    listing,
    reportBody,
    reportFiles,
    session?.user?.email,
    buyerProfile,
    sellerProfile,
  ]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const incoming = Array.from(event.target.files ?? []);
      const safe = incoming.filter((file) => file.size <= MAX_ATTACHMENT_SIZE);
      if (safe.length !== incoming.length) {
        setReportStatus("Some files were too large and were skipped.");
      }
      setReportFiles((prev) => [...prev, ...safe]);
      if (reportFileInputRef.current) {
        reportFileInputRef.current.value = "";
      }
    },
    [],
  );

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-emerald-100">
        Checking authentication…
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)]" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <AuthWall message="Sign in to view chats." />
          </div>
        </div>
      </main>
    );
  }

  if (!chat || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-emerald-100">
        {msg || "Loading chat…"}
      </main>
    );
  }

  const counterparty = userId === chat.buyer_id ? sellerProfile : buyerProfile;
  const listingTitle = listing?.title ?? "Listing";

  return (
    <main className="flex flex-col text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Team reviewing building plans"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.22}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[45vh] max-w-5xl flex-col justify-center gap-6 px-4 py-14 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Chat room
          </span>
          <h1 className="text-[clamp(2.1rem,4vw,3.5rem)] font-extrabold leading-tight">
            Coordinate donation logistics and keep materials moving.
          </h1>
          <p className="max-w-3xl text-sm text-emerald-100/90 sm:text-base">
            Use this space to confirm availability, pickup details, and project
            fit. Once a donation is completed, mark the listing as procured to
            close the loop.
          </p>
        </div>
      </ParallaxSection>

      <section className="relative isolate flex-1 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_right,_rgba(52,211,153,0.28),_transparent_65%)]" />
        </div>
        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/20 bg-white/10">
                  {counterparty?.avatar_url ? (
                    <Image
                      src={counterparty.avatar_url}
                      alt={counterparty.name ?? "Counterparty avatar"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-emerald-100/70">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-6 w-6"
                      >
                        <title>Profile icon</title>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {counterparty?.name ?? "CircularBuild member"}
                  </p>
                  <p className="text-xs text-emerald-100/70">
                    Chat about {listingTitle}
                  </p>
                </div>
              </div>
              <Link
                href={`/listing/${listing?.id ?? chat.listing_id}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-white hover:bg-white/20"
              >
                View listing
              </Link>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-6">
            <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur-lg">
              {messages.length === 0 ? (
                <p className="text-sm text-emerald-100/80">
                  No messages yet. Say hello and coordinate next steps.
                </p>
              ) : (
                messages.map((message) => {
                  const isMine = message.sender_id === userId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm shadow ${
                          isMine
                            ? "bg-emerald-600 text-white"
                            : "bg-white/80 text-slate-900"
                        }`}
                      >
                        <p>{message.body}</p>
                        <time className="mt-2 block text-xs opacity-70">
                          {new Date(message.created_at).toLocaleString()}
                        </time>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur-lg">
              <div className="flex flex-col gap-3">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                  placeholder="Draft your message…"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
                <div className="flex items-center justify-between text-xs text-emerald-100/80">
                  <button
                    type="button"
                    className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white"
                    onClick={() => setBody("")}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow transition hover:bg-emerald-500 disabled:opacity-60"
                    onClick={handleSend}
                    disabled={!body.trim()}
                  >
                    Send message
                  </button>
                </div>
              </div>
              {msg && <p className="mt-3 text-xs text-rose-200/80">{msg}</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur-lg">
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200 hover:text-emerald-100"
              onClick={() => setReportOpen((prev) => !prev)}
            >
              {reportOpen ? "Close report" : "Report a concern"}
            </button>
            {reportOpen && (
              <div className="mt-4 space-y-3 text-sm text-emerald-100/80">
                <p>
                  Flag this conversation for follow-up from the CircularBuild
                  team. Include context so we can respond quickly.
                </p>
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
                  placeholder="Describe the issue…"
                  value={reportBody}
                  onChange={(event) => setReportBody(event.target.value)}
                />
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-emerald-100/80 hover:border-white">
                    Attach files
                    <input
                      ref={reportFileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                  </label>
                  <ul className="mt-2 space-y-1 text-xs text-emerald-100/70">
                    {reportFiles.map((file) => (
                      <li key={file.name}>{file.name}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-100/80">
                  <button
                    type="button"
                    className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white"
                    onClick={() => {
                      setReportOpen(false);
                      setReportBody("");
                      setReportFiles([]);
                      setReportStatus("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow transition hover:bg-emerald-500 disabled:opacity-60"
                    onClick={handleReportSubmit}
                    disabled={reportSubmitting || !reportBody.trim()}
                  >
                    {reportSubmitting ? "Sending…" : "Submit report"}
                  </button>
                </div>
                {reportStatus && (
                  <p className="text-xs text-emerald-200/90">{reportStatus}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
