import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
}

if (!serviceRoleKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is missing; profile init API will fail.",
  );
}

export async function POST(req: Request) {
  try {
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key is not configured on the server." },
        { status: 500 },
      );
    }

    const { id, name } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabaseAdmin.from("profiles").upsert({
      id,
      name:
        typeof name === "string" && name.trim().length > 0 ? name.trim() : null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to initialize profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
