// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,type,shape,count,available_until,status,created_at,description",
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
