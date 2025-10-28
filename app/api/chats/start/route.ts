// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type RequestBody = {
  listingId?: string;
};

type ListingRow = {
  id: string;
  owner_id: string;
};

export async function POST(request: Request) {
  try {
    const { listingId } = (await request.json()) as RequestBody;

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json(
        { error: "Listing id is required." },
        { status: 400 },
      );
    }

    const user = await requireUser();
    const supabase = getSupabaseAdminClient();

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, owner_id")
      .eq("id", listingId)
      .maybeSingle<ListingRow>();

    if (listingError) {
      console.error("Failed to load listing for chat start", listingError);
      return NextResponse.json(
        { error: "Unable to start chat." },
        { status: 500 },
      );
    }

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 },
      );
    }

    const sellerId = listing.owner_id;
    if (!sellerId) {
      return NextResponse.json(
        { error: "Listing has no owner." },
        { status: 422 },
      );
    }

    if (sellerId === user.id) {
      return NextResponse.json(
        { error: "You cannot start a chat with your own listing." },
        { status: 400 },
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("chats")
      .select("id")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .eq("seller_id", sellerId)
      .maybeSingle<{ id: string }>();

    if (existingError) {
      console.error("Failed to check existing chat", existingError);
      return NextResponse.json(
        { error: "Unable to start chat." },
        { status: 500 },
      );
    }

    let chatId = existing?.id ?? null;

    if (!chatId) {
      const { data: created, error: insertError } = await supabase
        .from("chats")
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select("id")
        .single<{ id: string }>();

      if (insertError || !created) {
        console.error("Failed to create chat", insertError);
        return NextResponse.json(
          { error: "Unable to start chat." },
          { status: 500 },
        );
      }

      chatId = created.id;
    }

    const timestamp = new Date().toISOString();
    const { error: participantError } = await supabase
      .from("chat_participants")
      .upsert(
        [
          {
            chat_id: chatId,
            user_id: user.id,
            has_unread: false,
            last_read_at: timestamp,
          },
          {
            chat_id: chatId,
            user_id: sellerId,
            has_unread: false,
            last_read_at: null,
          },
        ],
        { ignoreDuplicates: true },
      );

    if (participantError) {
      console.error("Failed to upsert chat participants", participantError);
    }

    return NextResponse.json({ chatId });
  } catch (error) {
    console.error("Start chat failed", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
