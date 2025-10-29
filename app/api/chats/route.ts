// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdminClient();

    const { data: chats, error } = await supabase
      .from("chats")
      .select(
        "id, listing_id, buyer_id, seller_id, created_at, listing:listings(id, title, photos)",
      )
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const chatIds = (chats ?? []).map((chat) => chat.id);
    let unread: Record<string, boolean> = {};
    if (chatIds.length > 0) {
      const { data: participantRows } = await supabase
        .from("chat_participants")
        .select("chat_id, has_unread")
        .eq("user_id", user.id)
        .in("chat_id", chatIds);
      unread = (participantRows ?? []).reduce<Record<string, boolean>>(
        (acc, row) => {
          acc[row.chat_id] = Boolean(row.has_unread);
          return acc;
        },
        {},
      );
    }

    const counterpartyIds = Array.from(
      new Set(
        (chats ?? []).map((chat) =>
          chat.buyer_id === user.id ? chat.seller_id : chat.buyer_id,
        ),
      ),
    ).filter(Boolean) as string[];

    let counterparties: Record<
      string,
      { id: string; name: string | null; avatar_url: string | null }
    > = {};
    if (counterpartyIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,name,avatar_url")
        .in("id", counterpartyIds);
      counterparties = (profiles ?? []).reduce<typeof counterparties>(
        (acc, row) => {
          acc[row.id] = {
            id: row.id,
            name: row.name ?? null,
            avatar_url: row.avatar_url ?? null,
          };
          return acc;
        },
        {},
      );
    }

    const messageMap: Record<string, { lastMessageAt: string | null }> = {};
    if (chatIds.length > 0) {
      const { data: latestMessages } = await supabase
        .from("messages")
        .select("chat_id, created_at")
        .in("chat_id", chatIds)
        .order("created_at", { ascending: false })
        .limit(chatIds.length);

      (latestMessages ?? []).forEach((message) => {
        if (!(message.chat_id in messageMap)) {
          messageMap[message.chat_id] = { lastMessageAt: message.created_at };
        }
      });
    }

    return NextResponse.json({
      chats: chats ?? [],
      unread,
      counterparties,
      latest: messageMap,
    });
  } catch (error) {
    console.error("Chats fetch failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to load chats";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
