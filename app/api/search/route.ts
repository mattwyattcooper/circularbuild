// @ts-nocheck
import { type NextRequest, NextResponse } from "next/server";

import { expirePastListings } from "@/lib/listings";
import { getOrganizationBySlug } from "@/lib/organizations";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

// Haversine distance in miles
function milesBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // Earth radius (miles)
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type ListingRow = {
  id: string;
  owner_id: string | null;
  title: string;
  type: string;
  shape: string;
  count: number | null;
  approximate_weight_lbs: number | null;
  description: string;
  location_text: string | null;
  available_until: string | null;
  photos: string[] | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    await expirePastListings();

    const {
      q,
      type,
      address,
      radiusMiles = 25,
      originLat,
      originLng,
    } = await req.json();

    let origin: { lat: number; lng: number } | null = null;
    if (typeof originLat === "number" && typeof originLng === "number") {
      origin = { lat: originLat, lng: originLng };
    } else if (address && process.env.MAPBOX_TOKEN) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address,
      )}.json?access_token=${process.env.MAPBOX_TOKEN}&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const f = data?.features?.[0];
        if (f && Array.isArray(f.center)) {
          origin = { lng: f.center[0], lat: f.center[1] };
        }
      }
    }

    const { data: listings, error } = await supabase
      .from<ListingRow>("listings")
      .select(
        "id,owner_id,title,type,shape,count,approximate_weight_lbs,description,location_text,available_until,photos,lat,lng,created_at",
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let results: ListingRow[] = listings ?? [];

    if (q && typeof q === "string") {
      const L = (s: string) => s.toLowerCase();
      results = results.filter(
        (l) =>
          L(l.title).includes(L(q)) ||
          L(l.shape).includes(L(q)) ||
          L(l.description).includes(L(q)),
      );
    }

    if (type && typeof type === "string" && type.trim().length > 0) {
      results = results.filter((l) => l.type === type);
    }

    if (origin) {
      const { lat: originLatValue, lng: originLngValue } = origin;
      results = results.filter((l) => {
        if (l.lat == null || l.lng == null) return false;
        const d = milesBetween(originLatValue, originLngValue, l.lat, l.lng);
        return d <= (Number(radiusMiles) || 25);
      });
    }

    const ownerIds = Array.from(
      new Set(
        results
          .map((listing) => listing.owner_id)
          .filter((value): value is string => typeof value === "string"),
      ),
    );

    let owners: Record<
      string,
      {
        id: string;
        name: string | null;
        avatar_url: string | null;
        bio: string | null;
        organization_slug: string | null;
      }
    > = {};

    if (ownerIds.length > 0) {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id,name,avatar_url,bio,organization_slug")
          .in("id", ownerIds);
        if (profileData) {
          owners = profileData.reduce<typeof owners>((acc, profile) => {
            acc[profile.id] = {
              id: profile.id,
              name: profile.name ?? null,
              avatar_url: profile.avatar_url ?? null,
              bio: profile.bio ?? null,
              organization_slug: profile.organization_slug ?? null,
            };
            return acc;
          }, {});
        }
      } catch (profileError) {
        console.error("Profile lookup failed", profileError);
      }
    }

    const enrichedResults = results.map((listing) => {
      const ownerRecord = listing.owner_id
        ? (owners[listing.owner_id] ?? null)
        : null;
      const organizationName = ownerRecord?.organization_slug
        ? (getOrganizationBySlug(ownerRecord.organization_slug)?.name ?? null)
        : null;
      return {
        ...listing,
        owner: ownerRecord
          ? { ...ownerRecord, organization_name: organizationName }
          : null,
      };
    });

    return NextResponse.json({ results: enrichedResults });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
