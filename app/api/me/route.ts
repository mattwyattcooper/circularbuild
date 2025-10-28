// @ts-nocheck
import { NextResponse } from "next/server";

import { getOptionalUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const user = await getOptionalUser();
    if (!user?.id) {
      return NextResponse.json(
        { profile: null, hasUnreadChats: false },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id,name,avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const { data: unread } = await supabase
      .from("chat_participants")
      .select("has_unread")
      .eq("user_id", user.id)
      .eq("has_unread", true)
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      profile: profile ?? null,
      hasUnreadChats: Boolean(unread?.has_unread),
    });
  } catch (error) {
    console.error("Failed to load account summary", error);
    const message =
      error instanceof Error ? error.message : "Unable to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
