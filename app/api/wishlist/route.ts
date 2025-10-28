// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

async function parseBody(request: Request) {
  const body = await request.json();
  const listingId = typeof body.listingId === "string" ? body.listingId : null;
  if (!listingId) {
    throw new Error("Missing listingId");
  }
  return listingId;
}

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("wishlists")
      .select("listing_id")
      .eq("user_id", user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const listingIds = (data ?? []).map((row) => row.listing_id);
    return NextResponse.json({ listingIds });
  } catch (error) {
    console.error("Wishlist fetch failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to load wishlist";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const listingId = await parseBody(request);

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("wishlists").upsert(
      {
        user_id: user.id,
        listing_id: listingId,
      },
      { onConflict: "user_id,listing_id" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Wishlist add failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to update wishlist";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Missing listingId"
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const listingId = await parseBody(request);

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Wishlist remove failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to update wishlist";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Missing listingId"
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
