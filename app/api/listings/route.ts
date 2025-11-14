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

    const title = String(formData.get("title") ?? "").trim();
    const type = String(formData.get("type") ?? "").trim();
    const shape = String(formData.get("shape") ?? "").trim();
    const countValue = Number(formData.get("count") ?? 1);
    const weightValue = Number(formData.get("approximateWeightLbs") ?? NaN);
    const availableUntil = String(formData.get("availableUntil") ?? "").trim();
    const locationText = String(formData.get("locationText") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const signature = String(formData.get("signature") ?? "").trim();
    const consentContact = formData.get("consentContact") === "true";
    const latValue = formData.get("lat");
    const lngValue = formData.get("lng");

    if (!title || !shape || !availableUntil || !locationText || !signature) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      return NextResponse.json(
        { error: "Approximate weight is required." },
        { status: 400 },
      );
    }

    if (!consentContact) {
      return NextResponse.json(
        { error: "Consent to be contacted is required." },
        { status: 400 },
      );
    }

    const count =
      Number.isFinite(countValue) && countValue > 0 ? countValue : 1;
    const listedAt = new Date(availableUntil);
    if (Number.isNaN(listedAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid availability date." },
        { status: 400 },
      );
    }
    const availableISO = listedAt.toISOString().slice(0, 10);

    const lat = typeof latValue === "string" ? Number(latValue) : null;
    const lng = typeof lngValue === "string" ? Number(lngValue) : null;

    const supabase = getSupabaseAdminClient();

    const photos: string[] = [];
    const photoEntries = formData.getAll("photos");
    for (const entry of photoEntries) {
      if (!(entry instanceof File)) continue;
      const sanitized = sanitizeFileName(entry.name || `photo_${Date.now()}`);
      const key = `u_${user.id}/${Date.now()}_${sanitized}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(key, entry, { upsert: false });
      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 400 },
        );
      }
      const { data } = supabase.storage
        .from("listing-photos")
        .getPublicUrl(key);
      photos.push(data.publicUrl);
    }

    const detailedDescription = `${description}

---
Donor declaration: Information provided is truthful.
Signer: ${signature}
Consented to contact: ${consentContact ? "Yes" : "No"}`;

    const { error: insertError } = await supabase.from("listings").insert({
      owner_id: user.id,
      title,
      type,
      shape,
      count,
      approximate_weight_lbs: weightValue,
      available_until: availableISO,
      location_text: locationText,
      lat: Number.isFinite(lat) ? Number(lat) : null,
      lng: Number.isFinite(lng) ? Number(lng) : null,
      description: detailedDescription,
      photos,
      status: "active",
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Listing published." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create listing failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to create listing";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
