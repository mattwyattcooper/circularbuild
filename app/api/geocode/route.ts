import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { q } = await req.json();
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${process.env.MAPBOX_TOKEN}&limit=1`;

  const res = await fetch(url);
  if (!res.ok)
    return NextResponse.json({ error: "Geocode failed" }, { status: 500 });

  const data = await res.json();
  const f = data.features?.[0];
  if (!f) return NextResponse.json({ lat: null, lng: null });

  const [lng, lat] = f.center;
  return NextResponse.json({ lat, lng });
}
