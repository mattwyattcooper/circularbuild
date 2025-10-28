// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id: chatId } = await context.params;
    if (!chatId) {
      return NextResponse.json({ error: "Missing chat id" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select(
        `id, listing_id, buyer_id, seller_id, is_active, created_at, updated_at,
         listing:listings(id,title,photos,location_text),
         participants:chat_participants(user_id,has_unread,last_read_at),
         buyer:profiles!chats_buyer_id_fkey(id,name,avatar_url,bio),
         seller:profiles!chats_seller_id_fkey(id,name,avatar_url,bio)`,
      )
      .eq("id", chatId)
      .maybeSingle();

    if (chatError || !chat) {
      return NextResponse.json(
        { error: chatError?.message ?? "Chat not found" },
        { status: chatError ? 500 : 404 },
      );
    }

    if (chat.buyer_id !== user.id && chat.seller_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { error: messagesError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ chat, messages: messages ?? [] });
  } catch (error) {
    console.error("Chat detail fetch failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to load chat";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
