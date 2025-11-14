// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id: listingId } = await context.params;
    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listing id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (typeof body.available_until === "string") {
      updates.available_until = body.available_until;
      const today = new Date().toISOString().slice(0, 10);
      if (body.status === undefined) {
        if (body.available_until >= today) {
          updates.status = "active";
        } else {
          updates.status = "removed";
        }
      }
    }
    if (typeof body.count === "number") {
      updates.count = body.count;
    }
    if (typeof body.description === "string") {
      updates.description = body.description;
    }
    if (typeof body.status === "string") {
      updates.status = body.status;
    }
    if (typeof body.approximate_weight_lbs === "number") {
      updates.approximate_weight_lbs =
        body.approximate_weight_lbs > 0 ? body.approximate_weight_lbs : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase
      .from("listings")
      .update(updates)
      .eq("id", listingId)
      .eq("owner_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (typeof body.status === "string") {
      const { error: chatError } = await supabase
        .from("chats")
        .update({ is_active: body.status === "active" })
        .eq("listing_id", listingId);
      if (chatError) {
        return NextResponse.json({ error: chatError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Listing update failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to update listing";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
