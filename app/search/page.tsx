"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AuthWall from "@/component/AuthWall";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/lib/useRequireAuth";

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
  owner?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null | Array<{
      id: string;
      name: string | null;
      avatar_url: string | null;
      bio: string | null;
    }>;
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
  const [authPrompt, setAuthPrompt] = useState<{
    title?: string;
    message: string;
    nextPath: string;
  } | null>(null);

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

  const router = useRouter();
  const isAuthenticated = authStatus === "authenticated";

  const fetchListings = useCallback(
    async (
      options: {
        initial?: boolean;
        originLat?: number | null;
        originLng?: number | null;
      } = {},
    ) => {
      const { initial = false, originLat, originLng } = options;
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
            originLat: originLat ?? origin?.lat,
            originLng: originLng ?? origin?.lng,
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
    [address, origin, q, radiusMiles, type],
  );

  const initialQueryLoaded = useRef(false);
  useEffect(() => {
    if (authStatus === "checking") return;
    if (!initialQueryLoaded.current) {
      initialQueryLoaded.current = true;
      void fetchListings({ initial: true });
    }
    if (authStatus === "authenticated") {
      fetchWishlist();
    } else {
      setWishlistIds(new Set());
    }
  }, [authStatus, fetchListings, fetchWishlist]);

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
        void fetchListings({ originLat: latitude, originLng: longitude });
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
    if (!isAuthenticated) {
      setAuthPrompt({
        message: "Sign in to save materials to your wishlist.",
        nextPath: "/search",
      });
      return;
    }
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setAuthPrompt({
        message: "Sign in to save materials to your wishlist.",
        nextPath: "/search",
      });
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

  const handleViewListing = (listingId: string) => {
    if (!isAuthenticated) {
      setAuthPrompt({
        message: "Sign in to view listing details and coordinate pickups.",
        nextPath: `/listing/${listingId}`,
      });
      return;
    }
    router.push(`/listing/${listingId}`);
  };

  if (authStatus === "checking") {
    return (
      <main className="mx-auto max-w-6xl p-6 text-slate-900">
        Loading marketplace…
      </main>
    );
  }

  const dismissAuthPrompt = () => setAuthPrompt(null);

  return (
    <>
      {authPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md">
            <AuthWall
              title={authPrompt.title}
              message={authPrompt.message}
              nextPath={authPrompt.nextPath}
              secondaryHref="/search"
            />
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
              onClick={dismissAuthPrompt}
            >
              Continue browsing
            </button>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-6xl p-6 text-slate-900">
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
                viewMode === "list"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:text-emerald-600"
              }`}
              onClick={() => setViewMode("list")}
            >
              List view
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-1 text-sm ${
                viewMode === "map"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:text-emerald-600"
              }`}
              onClick={() => setViewMode("map")}
            >
              Map view
            </button>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="rounded-lg border border-gray-200 bg-emerald-50 px-4 py-3 text-sm text-slate-700">
            Preview materials before you join. Create an account to save
            listings, chat with donors, and arrange pickups.
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-5">
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
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white transition hover:bg-emerald-700 disabled:opacity-60"
              onClick={() => fetchListings()}
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
              const owner = Array.isArray(l.owner) ? l.owner[0] : l.owner;
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
                  {owner && (
                    <Link
                      href={`/profile/${owner.id}`}
                      className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-100"
                    >
                      <div className="h-9 w-9 overflow-hidden rounded-full border border-emerald-200 bg-white">
                        {owner.avatar_url ? (
                          <Image
                            src={owner.avatar_url}
                            alt={owner.name ?? "Profile avatar"}
                            width={36}
                            height={36}
                            className="h-9 w-9 object-cover"
                          />
                        ) : (
                          <div className="grid h-9 w-9 place-items-center text-[10px] text-emerald-500">
                            {owner.name ? owner.name[0]?.toUpperCase() : "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {owner.name ?? "CircularBuild member"}
                        </span>
                        {owner.bio && (
                          <span className="text-xs text-emerald-600">
                            {owner.bio}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-gray-900 px-3 py-2 text-white transition hover:bg-gray-800"
                      onClick={() => handleViewListing(l.id)}
                    >
                      View listing
                    </button>
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
    </>
  );
}
