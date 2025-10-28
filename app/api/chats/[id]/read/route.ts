// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id: chatId } = await context.params;
    if (!chatId) {
      return NextResponse.json({ error: "Missing chat id" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from("chat_participants")
      .update({ has_unread: false, last_read_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mark chat read failed", error);
    const message = error instanceof Error ? error.message : "Unable to update";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
