"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import AuthWall from "@/component/AuthWall";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { supabase } from "../../lib/supabaseClient";

const ListingMap = dynamic(() => import("@/component/ListingMap"), {
  ssr: false,
});

const MATERIALS = [
  "",
  "Wood",
  "Steel",
  "Aluminum",
  "Concrete",
  "Masonry",
  "Drywall",
  "Glass",
  "Plastic",
  "Other",
];

type Listing = {
  id: string;
  title: string;
  type: string;
  shape: string;
  count: number;
  available_until: string;
  location_text: string;
  lat: number | null;
  lng: number | null;
  description: string;
  photos: string[] | null;
  created_at: string;
};

export default function SearchPage() {
  const authStatus = useRequireAuth();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState<string>("");
  const [items, setItems] = useState<Listing[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locStatus, setLocStatus] = useState<string>("");
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistMsg, setWishlistMsg] = useState<string>("");

  const radiusMiles = useMemo(() => Number(radius) || 25, [radius]);

  const fetchWishlist = useCallback(async () => {
    setWishlistMsg("");
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from("wishlists")
      .select("listing_id")
      .eq("user_id", uid);
    if (error) {
      setWishlistMsg(
        `Could not load wishlist.${error.message ? ` (${error.message})` : ""}`,
      );
      return;
    }
    setWishlistIds(new Set((data ?? []).map((row) => row.listing_id)));
  }, []);

  const runSearch = useCallback(
    async (initial = false) => {
      if (authStatus !== "authenticated") return;
      setLoading(true);
      setMsg(initial ? "" : "Searching...");
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: q.trim() || undefined,
            type: type || undefined,
            address: address.trim() || undefined,
            radiusMiles,
            originLat: origin?.lat,
            originLng: origin?.lng,
          }),
        });
        const data = await res.json();
        if (data.error) {
          setMsg(`Error: ${data.error}`);
          setItems([]);
        } else {
          setItems(data.results || []);
          if (!data.results || data.results.length === 0) {
            setMsg("No items currently listed meet these criteria.");
          } else {
            setMsg("");
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Search failed";
        setMsg(`Error: ${message}`);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [authStatus, q, type, address, radiusMiles, origin],
  );

  useEffect(() => {
    if (authStatus === "authenticated") {
      runSearch(true);
      fetchWishlist();
    }
  }, [authStatus, runSearch, fetchWishlist]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("Geolocation is not supported in this browser.");
      return;
    }
    setLocStatus("Locating...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setOrigin({ lat: latitude, lng: longitude });
        setLocStatus(
          `Using your current location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
        );
        runSearch();
      },
      (err) => {
        setLocStatus(
          `Unable to retrieve location.${err.message ? ` (${err.message})` : ""}`,
        );
      },
    );
  };

  const toggleWishlist = async (listingId: string) => {
    setWishlistMsg("");
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      window.alert("Please sign in to save listings.");
      return;
    }
    const isSaved = wishlistIds.has(listingId);
    if (isSaved) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", uid)
        .eq("listing_id", listingId);
      if (error) {
        setWishlistMsg(`Could not update wishlist: ${error.message}`);
        return;
      }
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    } else {
      const { error } = await supabase.from("wishlists").insert({
        user_id: uid,
        listing_id: listingId,
      });
      if (error) {
        setWishlistMsg(`Could not update wishlist: ${error.message}`);
        return;
      }
      setWishlistIds((prev) => new Set(prev).add(listingId));
    }
  };

  if (authStatus === "checking") {
    return (
      <main className="max-w-6xl mx-auto p-6 text-gray-900">
        Checking authentication…
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="max-w-6xl mx-auto p-6 text-gray-900">
        <AuthWall message="Sign in to browse available donations." />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 text-gray-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-emerald-700">
            Search for donations
          </h1>
          <p className="text-sm text-gray-600">
            Explore surplus materials shared by vetted contractors and
            homeowners. Filter by the specifications you need or switch to the
            map view to scan nearby opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-gray-200 bg-white p-1">
          <button
            type="button"
            className={`rounded-full px-4 py-1 text-sm ${
              viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-600"
            }`}
            onClick={() => setViewMode("list")}
          >
            List view
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-1 text-sm ${
              viewMode === "map" ? "bg-gray-900 text-white" : "text-gray-600"
            }`}
            onClick={() => setViewMode("map")}
          >
            Map view
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-emerald-100 bg-white p-4 md:grid-cols-5">
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium">Keywords</span>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Search by title, shape, description"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Material</span>
          <select
            className="rounded-lg border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {MATERIALS.map((m) => (
              <option key={m} value={m}>
                {m === "" ? "All materials" : m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Address or ZIP</span>
          <input
            className="rounded-lg border px-3 py-2"
            placeholder="Type an address to focus results"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Radius (miles)</span>
          <input
            type="number"
            min={1}
            placeholder="25"
            className="rounded-lg border px-3 py-2"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          />
        </label>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm"
            onClick={handleUseCurrentLocation}
          >
            Use my location
          </button>
          <button
            type="button"
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-60"
            onClick={() => runSearch()}
            disabled={loading}
          >
            {loading ? "Searching…" : "Apply filters"}
          </button>
        </div>
      </div>

      {locStatus && (
        <div className="mt-2 text-xs text-gray-600">{locStatus}</div>
      )}
      {msg && <div className="mt-4 text-sm">{msg}</div>}
      {wishlistMsg && (
        <div className="mt-2 text-xs text-red-600">{wishlistMsg}</div>
      )}

      {viewMode === "map" ? (
        <div className="mt-6 h-[480px] overflow-hidden rounded-2xl border border-gray-200">
          <ListingMap listings={items} radius={radiusMiles} origin={origin} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => {
            const saved = wishlistIds.has(l.id);
            return (
              <div
                key={l.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                {Array.isArray(l.photos) && l.photos[0] ? (
                  <Image
                    src={l.photos[0]}
                    alt={l.title}
                    width={400}
                    height={320}
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="mb-3 h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-3 grid h-40 w-full place-items-center rounded-lg bg-gray-100 text-sm text-gray-500">
                    No photo
                  </div>
                )}
                <div className="font-semibold">{l.title}</div>
                <div className="text-sm text-gray-600">
                  {l.type} • {l.shape} • {l.count} pcs
                </div>
                <div className="text-xs text-gray-500">
                  Avail. until {l.available_until} • {l.location_text}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/listing/${l.id}`}
                    className="rounded-lg bg-gray-900 px-3 py-2 text-white"
                  >
                    View listing
                  </Link>
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-2 text-sm ${
                      saved
                        ? "border border-emerald-500 text-emerald-600"
                        : "border border-gray-200 text-gray-600"
                    }`}
                    onClick={() => toggleWishlist(l.id)}
                  >
                    {saved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
