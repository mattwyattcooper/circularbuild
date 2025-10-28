// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("wishlists")
      .select(
        "id, listing_id, created_at, listing:listings(id, title, type, shape, status, location_text, available_until, photos)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ rows: data ?? [] });
  } catch (error) {
    console.error("Wishlist fetch failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to load wishlist";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
