"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AuthWall from "@/component/AuthWall";
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

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const authStatus = useRequireAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);
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

    // load chat meta
    supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single()
      .then(({ data, error }) => {
        if (error) setMsg(`Error loading chat: ${error.message}`);
        else setChat(data);
      });

    // load existing messages
    supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setMsg(`Error loading messages: ${error.message}`);
        else {
          setMessages(data || []);
          setTimeout(scrollToBottom, 0);
        }
      });

    // subscribe to new messages
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
      <main className="max-w-3xl mx-auto p-6">Checking authentication…</main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <AuthWall message="Sign in to view and manage chats." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-3xl font-semibold text-emerald-700">Chat</h1>

      {closed && (
        <div className="mb-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          This chat is closed (listing is no longer active).
        </div>
      )}

      <div className="mb-4 h-[50vh] space-y-2 overflow-auto rounded-xl border border-emerald-100 bg-white p-3">
        {messages.map((m) => {
          const mine = myUserId && m.sender_id === myUserId;
          return (
            <div
              key={m.id}
              className={`max-w-[80%] px-3 py-2 rounded-lg ${
                mine
                  ? "ml-auto bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="text-sm">{m.body}</div>
              <div
                className={`text-[10px] mt-1 opacity-70 ${mine ? "text-white" : "text-gray-600"}`}
              >
                {new Date(m.created_at).toLocaleString()}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-black placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={closed ? "Chat closed" : "Type your message..."}
          disabled={closed}
        />
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700 disabled:bg-emerald-200"
          onClick={sendMessage}
          disabled={closed || !body.trim()}
        >
          Send
        </button>
      </div>

      {msg && <div className="mt-3 text-sm text-red-600">{msg}</div>}
    </main>
  );
}
