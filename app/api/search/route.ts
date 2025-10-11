import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured." },
        { status: 500 },
      );
    }
    const supa = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      q,
      type,
      address,
      radiusMiles = 25,
      originLat,
      originLng,
    } = await req.json();

    // 1) If address provided, geocode to lat/lng
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

    // 2) Pull all active listings (MVP; we’ll refine with SQL later)
    const { data: listings, error } = await supa
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let results = listings ?? [];

    // 3) Text filter
    if (q && typeof q === "string") {
      const L = (s: string) => s.toLowerCase();
      results = results.filter(
        (l) =>
          L(l.title).includes(L(q)) ||
          L(l.shape).includes(L(q)) ||
          L(l.description).includes(L(q)),
      );
    }

    // 4) Material type filter (exact match)
    if (type && typeof type === "string" && type.trim().length > 0) {
      results = results.filter((l) => l.type === type);
    }

    // 5) Radius filter if we have origin
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
      { id: string; name: string | null; avatar_url: string | null; bio: string | null }
    > = {};

    if (ownerIds.length > 0) {
      try {
        const profileClient = createClient(url, serviceRoleKey ?? anonKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
        const { data: profileData } = await profileClient
          .from("profiles")
          .select("id,name,avatar_url,bio")
          .in("id", ownerIds);
        if (profileData) {
          owners = profileData.reduce<typeof owners>((acc, profile) => {
            acc[profile.id] = {
              id: profile.id,
              name: profile.name ?? null,
              avatar_url: profile.avatar_url ?? null,
              bio: profile.bio ?? null,
            };
            return acc;
          }, {});
        }
      } catch (profileError) {
        console.error("Profile lookup failed", profileError);
      }
    }

    const enrichedResults = results.map((listing) => ({
      ...listing,
      owner: listing.owner_id ? owners[listing.owner_id] ?? null : null,
    }));

    return NextResponse.json({ results: enrichedResults });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
