"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import AuthWall from "@/component/AuthWall";
import ParallaxSection from "@/component/ParallaxSection";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { supabase } from "../../../lib/supabaseClient";

type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type Chat = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  is_active: boolean;
  created_at: string;
};

type ProfileSummary = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const authStatus = useRequireAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [buyerProfile, setBuyerProfile] = useState<ProfileSummary | null>(null);
  const [sellerProfile, setSellerProfile] = useState<ProfileSummary | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    supabase.auth.getSession().then(({ data }) => {
      setMyUserId(data.session?.user.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setMyUserId(s?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !chatId) return;

    const loadChat = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();
      if (error) {
        setMsg(`Error loading chat: ${error.message}`);
        return;
      }
      setChat(data);

      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id,name,avatar_url,bio")
        .in("id", [data.buyer_id, data.seller_id]);
      if (profileRows) {
        const profileById = new Map(profileRows.map((p) => [p.id, p]));
        setBuyerProfile(profileById.get(data.buyer_id) ?? null);
        setSellerProfile(profileById.get(data.seller_id) ?? null);
      }
    };

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (error) {
        setMsg(`Error loading messages: ${error.message}`);
        return;
      }
      setMessages(data || []);
      setTimeout(scrollToBottom, 0);
    };

    void loadChat();
    void loadMessages();

    const channel = supabase
      .channel(`chat_messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(scrollToBottom, 0);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authStatus, chatId, scrollToBottom]);

  async function sendMessage() {
    setMsg("");
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        setMsg("You need to sign in first.");
        return;
      }
      if (!body.trim()) return;

      const { error } = await supabase.from("messages").insert({
        chat_id: String(chatId),
        sender_id: sess.session.user.id,
        body: body.trim(),
      });
      if (error) throw error;
      setBody("");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Send failed: ${message}`);
    }
  }

  const closed = chat?.is_active === false;

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
            <AuthWall message="Sign in to view and manage chats." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Team aligning around reuse logistics"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.22}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[45vh] max-w-6xl flex-col justify-center gap-6 px-4 py-14 sm:px-6 lg:px-8">
          <Link
            href="/chats"
            className="inline-flex w-max items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:border-white hover:bg-white/20"
          >
            ← Back to chats
          </Link>
          <div className="space-y-4">
            <h1 className="text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-tight">
              Chat thread
            </h1>
            <p className="max-w-2xl text-sm text-emerald-100/85 sm:text-base">
              Align on pickup timing, share photos, and capture any adjustments
              in one place. Messages send in real-time to every participant.
            </p>
          </div>
        </div>
      </ParallaxSection>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_left,_rgba(74,222,128,0.3),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          {closed && (
            <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/20 px-4 py-3 text-sm text-emerald-100">
              This chat is closed (listing is no longer active).
            </div>
          )}

          {chat && (
            <div className="mb-6 rounded-3xl border border-white/15 bg-white/10 p-4 text-sm text-emerald-100/85 shadow-inner backdrop-blur-lg">
              <h2 className="text-base font-semibold text-white">Participants</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {buyerProfile && (
                  <Link
                    href={`/profile/${buyerProfile.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white hover:text-white"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-white/20 bg-white/10">
                      {buyerProfile.avatar_url ? (
                        <Image
                          src={buyerProfile.avatar_url}
                          alt={buyerProfile.name ?? "Buyer avatar"}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover"
                        />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center text-xs text-emerald-100/70">
                          {buyerProfile.name
                            ? buyerProfile.name[0]?.toUpperCase()
                            : "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {buyerProfile.name ?? "CircularBuild member"}
                      </span>
                      {buyerProfile.bio && (
                        <span className="text-xs text-emerald-100/70">
                          {buyerProfile.bio}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
                {sellerProfile && (
                  <Link
                    href={`/profile/${sellerProfile.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white hover:text-white"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-white/20 bg-white/10">
                      {sellerProfile.avatar_url ? (
                        <Image
                          src={sellerProfile.avatar_url}
                          alt={sellerProfile.name ?? "Seller avatar"}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover"
                        />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center text-xs text-emerald-100/70">
                          {sellerProfile.name
                            ? sellerProfile.name[0]?.toUpperCase()
                            : "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {sellerProfile.name ?? "CircularBuild member"}
                      </span>
                      {sellerProfile.bio && (
                        <span className="text-xs text-emerald-100/70">
                          {sellerProfile.bio}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="mb-6 h-[50vh] space-y-2 overflow-auto rounded-3xl border border-white/15 bg-white/10 p-4 shadow-inner backdrop-blur-lg">
            {messages.map((m) => {
              const mine = myUserId && m.sender_id === myUserId;
              return (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    mine
                      ? "ml-auto bg-emerald-500 text-white"
                      : "bg-white/80 text-slate-900"
                  }`}
                >
                  <div>{m.body}</div>
                  <div
                    className={`mt-2 text-[10px] opacity-70 ${
                      mine ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 shadow-inner backdrop-blur-lg">
            <div className="flex gap-3">
              <input
                className="flex-1 rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={closed ? "Chat closed" : "Type your message..."}
                disabled={closed}
              />
              <button
                type="button"
                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-500 disabled:bg-emerald-300"
                onClick={sendMessage}
                disabled={closed || !body.trim()}
              >
                Send
              </button>
            </div>
            {msg && <div className="text-sm text-rose-200">{msg}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
