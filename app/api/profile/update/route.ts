import { createClient } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const authClient = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await authClient.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 },
      );
    }

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

    const admin = createClient(url, serviceRoleKey);

    const { error } = await admin.from("profiles").upsert(
      {
        id: session.user.id,
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
