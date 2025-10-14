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
              secondaryHref="/"
              onSecondaryClick={dismissAuthPrompt}
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
      <main className="flex flex-col text-white">
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
          <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden>
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(74,222,128,0.35),_transparent_60%)]" />
          </div>
          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex-1 space-y-5">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Marketplace
              </span>
              <h1 className="text-[clamp(2.4rem,4vw,3.8rem)] font-extrabold leading-tight">
                Discover surplus materials ready for reuse.
              </h1>
              <p className="max-w-xl text-sm text-emerald-100/85 sm:text-base">
                Filter by specs, scout the map, and connect with donors across the network. Listings update in real time as crews share what&apos;s available.
              </p>
              {!isAuthenticated && (
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-emerald-100/90 backdrop-blur">
                  Preview what&apos;s live, then create an account to save materials and coordinate pickups.
                </div>
              )}
            </div>
            <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Filters
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1 text-xs">
                <button
                    type="button"
                    className={`rounded-full px-3 py-1 font-semibold transition ${
                      viewMode === "list"
                        ? "bg-emerald-500 text-white"
                        : "text-emerald-100/80 hover:text-white"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 font-semibold transition ${
                      viewMode === "map"
                        ? "bg-emerald-500 text-white"
                        : "text-emerald-100/80 hover:text-white"
                    }`}
                    onClick={() => setViewMode("map")}
                  >
                    Map
                  </button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Material
                  </span>
                  <select
                    className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Title · Description · Keywords
                  </span>
                  <input
                    className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Search by title, description, or keywords"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                      Radius (miles)
                    </span>
                    <input
                      type="number"
                      min={1}
                      placeholder="25"
                      className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                      Focus results near
                    </span>
                    <input
                      className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="Address or ZIP"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-100/90 transition hover:border-white hover:text-white"
                    onClick={handleUseCurrentLocation}
                  >
                    Use my location
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 disabled:opacity-60"
                    onClick={() => fetchListings()}
                    disabled={loading}
                  >
                    {loading ? "Searching…" : "Apply filters"}
                  </button>
                </div>
                {locStatus && (
                  <div className="text-xs text-emerald-100/70">{locStatus}</div>
                )}
                {msg && <div className="text-sm text-emerald-100">{msg}</div>}
                {wishlistMsg && (
                  <div className="text-xs text-rose-200">{wishlistMsg}</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
          <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden>
            <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.3),_transparent_60%)]" />
          </div>
          <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-6 text-sm text-emerald-100/80">
              {items.length > 0
                ? `${items.length} listing${items.length === 1 ? "" : "s"} available`
                : "No listings match the current filters."}
            </div>
            {viewMode === "map" ? (
              <div className="h-[520px] overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-xl backdrop-blur">
                <ListingMap
                  listings={items}
                  radius={radiusMiles}
                  origin={origin}
                  onListingSelect={handleViewListing}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((l) => {
                  const saved = wishlistIds.has(l.id);
                  const owner = Array.isArray(l.owner) ? l.owner[0] : l.owner;
                  return (
                    <div
                      key={l.id}
                      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 text-emerald-100/85 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-white"
                    >
                      {Array.isArray(l.photos) && l.photos[0] ? (
                        <Image
                          src={l.photos[0]}
                          alt={l.title}
                          width={400}
                          height={320}
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="mb-4 h-44 w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="mb-4 grid h-44 w-full place-items-center rounded-2xl border border-white/15 bg-white/10 text-sm text-emerald-100/60">
                          Photo coming soon
                        </div>
                      )}
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-white">
                          {l.title}
                        </h2>
                        <p className="text-sm text-emerald-100/80">
                          {l.type} • {l.shape} • {l.count} pcs
                        </p>
                        <p className="text-xs text-emerald-100/70">
                          Available until {l.available_until} • {l.location_text}
                        </p>
                      </div>
                      {owner && (
                        <Link
                          href={`/profile/${owner.id}`}
                          className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:border-white"
                        >
                          <div className="h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-white/10">
                            {owner.avatar_url ? (
                              <Image
                                src={owner.avatar_url}
                                alt={owner.name ?? "Profile avatar"}
                                width={36}
                                height={36}
                                className="h-9 w-9 object-cover"
                              />
                            ) : (
                              <div className="grid h-9 w-9 place-items-center text-emerald-100/80">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.25"
                                  className="h-5 w-5"
                                >
                                  <circle cx="12" cy="8" r="4" />
                                  <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span>{owner.name ?? "CircularBuild member"}</span>
                            {owner.bio && (
                              <span className="text-xs text-emerald-100/70">
                                {owner.bio}
                              </span>
                            )}
                          </div>
                        </Link>
                      )}
                      <div className="mt-auto flex flex-wrap gap-3 pt-4">
                        <button
                          type="button"
                          className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400"
                          onClick={() => handleViewListing(l.id)}
                        >
                          View listing
                        </button>
                        <button
                          type="button"
                          className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                            saved
                              ? "border-emerald-300/60 bg-emerald-500/10 text-emerald-200"
                              : "border-white/20 text-emerald-100/80 hover:border-white hover:text-white"
                          }`}
                          onClick={() => toggleWishlist(l.id)}
                        >
                          {saved ? "Saved to wishlist" : "Save to wishlist"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
