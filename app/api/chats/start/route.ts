import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

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

    if (sellerId === userId) {
      return NextResponse.json(
        { error: "You cannot start a chat with your own listing." },
        { status: 400 },
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("chats")
      .select("id")
      .eq("listing_id", listingId)
      .eq("buyer_id", userId)
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
          buyer_id: userId,
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

    const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceUrl && serviceRoleKey) {
      const adminClient = createClient(serviceUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const timestamp = new Date().toISOString();
      const { error: participantError } = await adminClient
        .from("chat_participants")
        .upsert(
          [
            {
              chat_id: chatId,
              user_id: userId,
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
    } else {
      console.warn(
        "Missing Supabase service role credentials; skipped participant sync",
      );
    }

    return NextResponse.json({ chatId });
  } catch (error) {
    console.error("Start chat failed", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
