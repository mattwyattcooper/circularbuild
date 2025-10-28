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
    const { id: postId } = await context.params;
    if (!postId) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("news_likes").upsert(
      {
        post_id: postId,
        user_id: user.id,
      },
      { onConflict: "post_id,user_id" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: likesRows } = await supabase
      .from("news_likes")
      .select("user_id")
      .eq("post_id", postId);

    return NextResponse.json({
      likes: likesRows?.length ?? 0,
      liked: true,
    });
  } catch (error) {
    console.error("Like post failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to like post";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id: postId } = await context.params;
    if (!postId) {
      return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("news_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: likesRows } = await supabase
      .from("news_likes")
      .select("user_id")
      .eq("post_id", postId);

    return NextResponse.json({
      likes: likesRows?.length ?? 0,
      liked: false,
    });
  } catch (error) {
    console.error("Unlike post failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to unlike post";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
