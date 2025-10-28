// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function PUT(
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
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.body === "string" ? body.body.trim() : "";
    const coverImageUrl =
      typeof body.coverImageUrl === "string" &&
      body.coverImageUrl.trim().length > 0
        ? body.coverImageUrl.trim()
        : null;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and body are required." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from("news_posts")
      .update({
        title,
        body: content,
        cover_image_url: coverImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("author_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Post updated." });
  } catch (error) {
    console.error("Update post failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to update post";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
