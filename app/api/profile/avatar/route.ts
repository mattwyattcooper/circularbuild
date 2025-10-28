// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.-]/g, "_");
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("avatar");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing avatar file" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();
    const extension = file.name.split(".").pop() ?? "jpg";
    const key = `avatars/${sanitizeFileName(user.id)}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(key, file, { upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data } = supabase.storage.from("profile-photos").getPublicUrl(key);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ avatarUrl: data.publicUrl });
  } catch (error) {
    console.error("Avatar upload failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to upload avatar";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
