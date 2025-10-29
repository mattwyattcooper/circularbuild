import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "").trim();
    const name = String(body.name ?? "").trim();
    const nextPath =
      typeof body.nextPath === "string" && body.nextPath.startsWith("/")
        ? body.nextPath
        : "/";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password should be at least 8 characters." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: "Supabase credentials are not configured." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      request.headers.get("origin") ??
      "http://localhost:3000";

    const redirectTo = `${origin}/auth/verified?next=${encodeURIComponent(nextPath)}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: name ? { full_name: name } : undefined,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: `Check ${email} for a confirmation link.`,
    });
  } catch (error) {
    console.error("Signup failed", error);
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
