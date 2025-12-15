// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { calculateCo2eKg, normalizeMaterialLabel } from "@/lib/diversion";
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
    const materialsRaw = formData.get("materials");
    const isDeconstruction = formData.get("isDeconstruction") === "true";
    const saleTypeValue = String(formData.get("saleType") ?? "donation").trim();
    const saleType =
      saleTypeValue.toLowerCase() === "resale" ? "resale" : "donation";
    const salePriceValue =
      saleType === "resale" ? Number(formData.get("salePrice") ?? NaN) : null;

    if (!title || !shape || !availableUntil || !locationText || !signature) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (!consentContact) {
      return NextResponse.json(
        { error: "Consent to be contacted is required." },
        { status: 400 },
      );
    }

    if (saleType === "resale") {
      if (!Number.isFinite(salePriceValue) || (salePriceValue ?? 0) <= 0) {
        return NextResponse.json(
          { error: "A positive resale price is required." },
          { status: 400 },
        );
      }
    }

    let materials: Array<{
      type: string;
      weight_lbs: number;
      co2e_kg: number;
    }> = [];
    if (typeof materialsRaw === "string" && materialsRaw.trim().length > 0) {
      try {
        const parsed = JSON.parse(materialsRaw);
        if (Array.isArray(parsed)) {
          materials = parsed
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null;
              const entryType = normalizeMaterialLabel(
                typeof entry.type === "string"
                  ? entry.type
                  : typeof entry.material === "string"
                    ? entry.material
                    : null,
              );
              const weight = Number(entry.weightLbs ?? entry.weight_lbs);
              if (
                !entryType ||
                !Number.isFinite(weight) ||
                Number(weight) <= 0
              ) {
                return null;
              }
              return {
                type: entryType,
                weight_lbs: Number(weight.toFixed(2)),
                co2e_kg: calculateCo2eKg(entryType, weight),
              };
            })
            .filter(
              (
                entry,
              ): entry is {
                type: string;
                weight_lbs: number;
                co2e_kg: number;
              } => !!entry,
            );
        }
      } catch (error) {
        console.error("Failed to parse materials payload", error);
        return NextResponse.json(
          { error: "Invalid materials payload." },
          { status: 400 },
        );
      }
    }

    const materialsWeight = materials.reduce(
      (sum, entry) => sum + entry.weight_lbs,
      0,
    );
    const approximateWeight =
      materialsWeight > 0 ? materialsWeight : weightValue;

    if (!Number.isFinite(approximateWeight) || approximateWeight <= 0) {
      return NextResponse.json(
        { error: "Approximate weight is required." },
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
    if (photos.length === 0) {
      return NextResponse.json(
        { error: "Please include at least one listing photo." },
        { status: 400 },
      );
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
      approximate_weight_lbs: Number(approximateWeight.toFixed(2)),
      materials: materials.length ? materials : null,
      is_deconstruction: isDeconstruction,
      sale_type: saleType,
      sale_price:
        saleType === "resale" && salePriceValue
          ? Number(salePriceValue.toFixed(2))
          : null,
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
