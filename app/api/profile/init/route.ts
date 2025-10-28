// @ts-nocheck
import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase();
    const fullName = String(body.name ?? "").trim();
    const userId = String(body.userId ?? "").trim();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Email and userId are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email,
        name: fullName || null,
      },
      { onConflict: "id" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Profile init failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to init profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
