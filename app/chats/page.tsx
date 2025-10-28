"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import AuthWall from "@/component/AuthWall";
import ParallaxSection from "@/component/ParallaxSection";
import { useRequireAuth } from "@/lib/useRequireAuth";

type Chat = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  is_active: boolean;
  created_at: string;
  last_message_at: string | null;
};

type Listing = {
  id: string;
  title: string;
  photos: string[] | null;
};

type ProfileSummary = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type ChatRow = Chat & {
  listing: Listing | null;
  counterparty: ProfileSummary | null;
  has_unread: boolean;
  last_read_at: string | null;
};

export default function ChatsIndex() {
  const authStatus = useRequireAuth();
  const { data: session } = useSession();
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [msg, setMsg] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/chats", { cache: "no-store" });
        if (response.status === 401) {
          if (!cancelled) setRows([]);
          return;
        }
        const data = (await response.json()) as {
          chats?: Array<Chat & { listing: Listing | null }>;
          unread?: Record<string, boolean>;
          counterparties?: Record<
            string,
            { id: string; name: string | null; avatar_url: string | null }
          >;
          latest?: Record<string, { lastMessageAt: string | null }>;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to load chats");
        }
        const viewerId = session?.user?.id ?? null;
        const hydrated: ChatRow[] = (data.chats ?? []).map((chat) => {
          const counterpartyId = viewerId
            ? chat.buyer_id === viewerId
              ? chat.seller_id
              : chat.buyer_id
            : null;
          return {
            ...chat,
            listing: chat.listing ?? null,
            counterparty:
              counterpartyId && data.counterparties?.[counterpartyId]
                ? {
                    id: counterpartyId,
                    name: data.counterparties[counterpartyId].name,
                    avatar_url: data.counterparties[counterpartyId].avatar_url,
                    bio: null,
                  }
                : null,
            has_unread: data.unread?.[chat.id] ?? false,
            last_read_at: null,
            last_message_at:
              data.latest?.[chat.id]?.lastMessageAt ??
              chat.last_message_at ??
              null,
          };
        });
        if (!cancelled) {
          setRows(hydrated);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Unable to load chats";
          setMsg(`Error: ${message}`);
        }
      }
    };

    void load();
    pollRef.current = setInterval(load, 20000);

    return () => {
      cancelled = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [authStatus, session?.user?.id]);

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
            <AuthWall message="Sign in to see conversations with donors." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Teammates coordinating around a table"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.22}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col justify-center gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
          <div className="flex-1 space-y-5">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Conversations
            </span>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-tight">
              Keep pickups coordinated and transparent with every donor
              touchpoint.
            </h1>
            <p className="max-w-2xl text-sm text-emerald-100/90 sm:text-base">
              Use chat threads to confirm logistics, share photos, and gather
              the details your crew needs before arriving onsite.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-3 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-lg text-sm text-emerald-100/90">
            <div className="text-lg font-semibold text-white">
              Smart handoffs
            </div>
            <p>
              • Message history keeps everyone aligned even as crews rotate.
            </p>
            <p>• Closing a listing archives the thread for future reference.</p>
            <p>
              • Share pickup notes and contacts so recipients stay informed.
            </p>
          </div>
        </div>
      </ParallaxSection>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_left,_rgba(74,222,128,0.3),_transparent_55%)]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          {msg && (
            <div className="mb-6 rounded-2xl border border-rose-200/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-100">
              {msg}
            </div>
          )}
          <div className="space-y-4">
            {rows.map((c) => {
              const counterparty = c.counterparty;
              return (
                <div
                  key={c.id}
                  className="relative rounded-3xl border border-white/15 bg-white/10 px-5 py-5 shadow-lg backdrop-blur-lg"
                >
                  {c.has_unread && (
                    <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-sky-400" />
                  )}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                    {c.listing?.photos?.[0] ? (
                      <Image
                        src={c.listing.photos[0]}
                        alt={c.listing.title}
                        width={72}
                        height={72}
                        sizes="72px"
                        className="h-18 w-18 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="grid h-18 w-18 place-items-center rounded-2xl border border-white/20 bg-white/10 text-emerald-100/70">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          className="h-10 w-10"
                        >
                          <title>Profile icon</title>
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-base font-semibold text-white">
                          {c.listing?.title ?? "Listing"}
                        </span>
                        <div className="text-xs text-emerald-100/70">
                          {new Date(c.created_at).toLocaleString()} •{" "}
                          {c.is_active ? "Active" : "Closed"}
                        </div>
                      </div>
                      {counterparty && (
                        <div className="flex items-center gap-3 text-xs text-emerald-100/70">
                          <div className="overflow-hidden rounded-full border border-white/20 bg-white/10">
                            {counterparty.avatar_url ? (
                              <Image
                                src={counterparty.avatar_url}
                                alt={counterparty.name ?? "User avatar"}
                                width={40}
                                height={40}
                                className="h-10 w-10 object-cover"
                              />
                            ) : (
                              <div className="grid h-10 w-10 place-items-center text-emerald-100/70">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  className="h-7 w-7"
                                >
                                  <title>Profile icon</title>
                                  <circle cx="12" cy="8" r="4" />
                                  <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">
                              {counterparty.name ?? "CircularBuild member"}
                            </span>
                            {counterparty.bio && (
                              <span className="max-w-sm text-[11px] text-emerald-100/60">
                                {counterparty.bio}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/chats/${c.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-emerald-400"
                    >
                      Open thread
                    </Link>
                    {counterparty && (
                      <Link
                        href={`/profile/${counterparty.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-emerald-100/80 transition hover:border-white hover:text-white"
                      >
                        View profile
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}

            {rows.length === 0 && (
              <div className="rounded-3xl border border-white/15 bg-white/10 px-6 py-8 text-sm text-emerald-100/80 backdrop-blur-lg">
                No chats yet. Once you reach out about a listing—or a donor
                contacts you—the conversation will appear here for easy
                follow-up.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
