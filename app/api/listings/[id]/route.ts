import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const EMPTY_OWNER = null as {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
} | null;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured." },
        { status: 500 },
      );
    }

    const key = serviceRoleKey ?? anonKey;
    const client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { id: listingId } = await context.params;
    if (!listingId) {
      return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
    }

    const { data: listing, error } = await client
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
      const { data: ownerData } = await client
        .from("profiles")
        .select("id,name,avatar_url,bio")
        .eq("id", listing.owner_id)
        .maybeSingle();
      owner = ownerData
        ? {
            id: ownerData.id,
            name: ownerData.name ?? null,
            avatar_url: ownerData.avatar_url ?? null,
            bio: ownerData.bio ?? null,
          }
        : EMPTY_OWNER;
    }

    return NextResponse.json({ listing: { ...listing, owner } });
  } catch (error) {
    console.error("Listing lookup failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to load listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
