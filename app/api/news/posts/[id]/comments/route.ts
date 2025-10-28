// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id: postId } = await context.params;
    if (!postId) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    const body = await request.json();
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!comment) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("news_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        comment,
      })
      .select("id, comment, created_at")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Unable to add comment" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      comment: {
        id: data.id,
        comment: data.comment,
        createdAt: data.created_at,
        userName: user.name ?? user.email ?? "CircularBuild member",
      },
    });
  } catch (error) {
    console.error("Add comment failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to add comment";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
