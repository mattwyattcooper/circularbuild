// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
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

    const { error } = await supabase.from("news_posts").insert({
      title,
      body: content,
      cover_image_url: coverImageUrl,
      author_id: user.id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Post published." }, { status: 201 });
  } catch (error) {
    console.error("Create post failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to create post";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
