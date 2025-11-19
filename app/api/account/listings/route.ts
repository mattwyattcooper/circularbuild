// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { expirePastListings } from "@/lib/listings";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdminClient();
    await expirePastListings();

    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,type,shape,count,approximate_weight_lbs,available_until,status,created_at,description,materials,is_deconstruction,sale_type,sale_price",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ listings: data ?? [] });
  } catch (error) {
    console.error("Listings fetch failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to load listings";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
