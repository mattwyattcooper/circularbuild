// @ts-nocheck
import { NextResponse } from "next/server";

import { getOptionalUser } from "@/lib/auth/session";
import { expirePastListings } from "@/lib/listings";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

const EMPTY_OWNER = null as {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  organization_slug?: string | null;
} | null;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = getSupabaseAdminClient();
    const { id: listingId } = await context.params;
    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listing id" },
        { status: 400 },
      );
    }

    const { data: listing, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    let owner = EMPTY_OWNER;
    if (listing.owner_id) {
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("id,name,avatar_url,bio,organization_slug")
        .eq("id", listing.owner_id)
        .maybeSingle();
      owner = ownerData
        ? {
            id: ownerData.id,
            name: ownerData.name ?? null,
            avatar_url: ownerData.avatar_url ?? null,
            bio: ownerData.bio ?? null,
            organization_slug: ownerData.organization_slug ?? null,
          }
        : EMPTY_OWNER;
    }

    const user = await getOptionalUser();
    let isSaved = false;
    if (user?.id) {
      const { data: wishlistRow } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .maybeSingle();
      isSaved = Boolean(wishlistRow);
    }

    return NextResponse.json({ listing: { ...listing, owner }, isSaved });
  } catch (error) {
    console.error("Listing lookup failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to load listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
await expirePastListings();
