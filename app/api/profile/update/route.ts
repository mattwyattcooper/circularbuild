// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const gender = typeof body.gender === "string" ? body.gender.trim() : "";
    const interests =
      typeof body.interests === "string" ? body.interests.trim() : "";
    const bio = typeof body.bio === "string" ? body.bio.trim() : "";
    const ageValue =
      body.age != null && Number.isFinite(Number(body.age))
        ? Number(body.age)
        : null;
    const avatarUrl =
      typeof body.avatarUrl === "string" && body.avatarUrl.trim().length > 0
        ? body.avatarUrl.trim()
        : null;

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        name: name.length > 0 ? name : null,
        gender: gender.length > 0 ? gender : null,
        interests: interests.length > 0 ? interests : null,
        bio: bio.length > 0 ? bio : null,
        age: ageValue,
        avatar_url: avatarUrl,
      },
      { onConflict: "id" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Profile update failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to update profile";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
