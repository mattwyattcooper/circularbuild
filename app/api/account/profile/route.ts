// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdminClient();

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id,name,is_admin,gender,age,interests,bio,avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 },
      );
    }

    const [{ data: listings }, { data: wishlist }] = await Promise.all([
      supabase
        .from("listings")
        .select("id")
        .eq("owner_id", user.id)
        .eq("status", "active"),
      supabase.from("wishlists").select("id").eq("user_id", user.id),
    ]);

    return NextResponse.json({
      profile: profileData ?? null,
      stats: {
        activeListings: listings?.length ?? 0,
        wishlistCount: wishlist?.length ?? 0,
      },
    });
  } catch (error) {
    console.error("Profile fetch failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to load profile";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
