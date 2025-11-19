"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AuthWall from "@/component/AuthWall";
import { MATERIAL_OPTIONS, summarizeListingMaterials } from "@/lib/diversion";
import { useRequireAuth } from "@/lib/useRequireAuth";

const ListingMap = dynamic(() => import("@/component/ListingMap"), {
  ssr: false,
});

const MATERIALS = ["", ...MATERIAL_OPTIONS];

type Listing = {
  id: string;
  title: string;
  type: string;
  shape: string;
  count: number;
  approximate_weight_lbs: number | null;
  available_until: string;
  location_text: string;
  lat: number | null;
  lng: number | null;
  description: string;
  photos: string[] | null;
  created_at: string;
  materials?: unknown;
  is_deconstruction?: boolean | null;
  sale_type?: string | null;
  sale_price?: number | null;
  owner?:
    | {
        id: string;
        name: string | null;
        avatar_url: string | null;
        bio: string | null;
        organization_name?: string | null;
      }
    | null
    | Array<{
        id: string;
        name: string | null;
        avatar_url: string | null;
        bio: string | null;
        organization_name?: string | null;
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
  const [usingLocation, setUsingLocation] = useState(false);
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
    try {
      const response = await fetch("/api/wishlist");
      if (response.status === 401) {
        setWishlistIds(new Set());
        return;
      }
      const data = (await response.json()) as {
        listingIds?: string[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to load wishlist");
      }
      setWishlistIds(new Set(data.listingIds ?? []));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load wishlist";
      setWishlistMsg(`Could not load wishlist. ${message}`);
    }
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
        const resolvedOriginLat =
          originLat !== undefined ? originLat : (origin?.lat ?? undefined);
        const resolvedOriginLng =
          originLng !== undefined ? originLng : (origin?.lng ?? undefined);
        const payload: Record<string, unknown> = {
          q: q.trim() || undefined,
          type: type || undefined,
          address: address.trim() || undefined,
          radiusMiles,
        };
        if (resolvedOriginLat !== undefined) {
          payload.originLat = resolvedOriginLat;
        }
        if (resolvedOriginLng !== undefined) {
          payload.originLng = resolvedOriginLng;
        }

        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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

  const handleFilterKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void fetchListings();
      }
    },
    [fetchListings],
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

  const clearLocationFilter = () => {
    setOrigin(null);
    setUsingLocation(false);
    setLocStatus("Location filter turned off.");
    void fetchListings({ originLat: null, originLng: null });
  };

  const handleUseCurrentLocation = () => {
    if (usingLocation) {
      clearLocationFilter();
      return;
    }
    if (!navigator.geolocation) {
      setLocStatus("Geolocation is not supported in this browser.");
      return;
    }
    setLocStatus("Locating...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setOrigin({ lat: latitude, lng: longitude });
        setUsingLocation(true);
        setLocStatus(
          `Using your current location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
        );
        void fetchListings({ originLat: latitude, originLng: longitude });
      },
      (err) => {
        setLocStatus(
          `Unable to retrieve location.${err.message ? ` (${err.message})` : ""}`,
        );
        setUsingLocation(false);
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
    const isSaved = wishlistIds.has(listingId);
    try {
      const response = await fetch("/api/wishlist", {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update wishlist");
      }
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isSaved) {
          next.delete(listingId);
        } else {
          next.add(listingId);
        }
        return next;
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update wishlist";
      setWishlistMsg(`Could not update wishlist: ${message}`);
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
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            aria-hidden
          >
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
                Filter by specs, scout the map, and connect with donors across
                the network. Listings update in real time as crews share
                what&apos;s available.
              </p>
              {!isAuthenticated && (
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-emerald-100/90 backdrop-blur">
                  Preview what&apos;s live, then create an account to save
                  materials and coordinate pickups.
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
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white shadow-inner shadow-black/20 backdrop-blur focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      onKeyDown={handleFilterKeyDown}
                    >
                      {MATERIALS.map((m) => (
                        <option key={m} value={m} className="text-slate-900">
                          {m === "" ? "All materials" : m}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-sm text-emerald-100/80">
                      ▾
                    </span>
                  </div>
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
                    onKeyDown={handleFilterKeyDown}
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
                      onKeyDown={handleFilterKeyDown}
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
                      onKeyDown={handleFilterKeyDown}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className={`inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      usingLocation
                        ? "border-emerald-300/70 bg-emerald-500/20 text-white"
                        : "border-white/20 bg-white/10 text-emerald-100/90 hover:border-white hover:text-white"
                    }`}
                    onClick={handleUseCurrentLocation}
                  >
                    {usingLocation ? "Location filter on" : "Use my location"}
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
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            aria-hidden
          >
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
                  const ownerOrganizationName =
                    owner?.organization_name ?? null;
                  const formattedAvailable = (() => {
                    const parsed = new Date(l.available_until);
                    if (Number.isNaN(parsed.getTime())) return null;
                    return parsed.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  })();
                  const saleType =
                    l.sale_type === "resale" ? "resale" : ("donation" as const);
                  const salePrice =
                    saleType === "resale" && typeof l.sale_price === "number"
                      ? l.sale_price
                      : null;
                  const {
                    entries: materials,
                    totalWeight,
                    totalCo2,
                  } = summarizeListingMaterials(l);
                  return (
                    <article
                      key={l.id}
                      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 text-emerald-100/85 shadow-lg backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-emerald-500/20"
                    >
                      <button
                        type="button"
                        onClick={() => handleViewListing(l.id)}
                        className="w-full flex-1 cursor-pointer rounded-2xl border border-transparent bg-transparent text-left focus:outline-none focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-emerald-300"
                      >
                        {Array.isArray(l.photos) && l.photos[0] ? (
                          <Image
                            src={l.photos[0]}
                            alt={l.title}
                            width={400}
                            height={320}
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="mb-4 h-44 w-full rounded-2xl object-cover transition duration-500 group-hover:scale-[1.01]"
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
                          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-100/80">
                            <span
                              className={`rounded-full border px-3 py-1 ${
                                saleType === "resale"
                                  ? "border-amber-200/60 bg-amber-500/10 text-amber-100"
                                  : "border-emerald-200/40 bg-emerald-500/10 text-emerald-100"
                              }`}
                            >
                              {saleType === "resale" ? "Resale" : "Donation"}
                            </span>
                            {l.is_deconstruction && (
                              <span className="rounded-full border border-cyan-200/60 bg-cyan-500/10 px-3 py-1 text-cyan-100">
                                Deconstruction
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-emerald-100/80">
                            {l.type} • {l.shape} • {l.count} pcs
                          </p>
                          <p className="text-xs text-emerald-100/70">
                            {formattedAvailable
                              ? `Available until ${formattedAvailable}`
                              : "Availability shared after contact"}
                            {" • "}
                            {l.location_text}
                          </p>
                          {materials.length > 0 && (
                            <div className="space-y-1 pt-1 text-xs text-emerald-100/75">
                              {materials.slice(0, 3).map((material) => (
                                <p
                                  key={`${material.type}-${material.weight_lbs}`}
                                >
                                  {material.type} —{" "}
                                  {material.weight_lbs.toLocaleString()} lbs
                                  {material.co2e_kg > 0
                                    ? ` • ${material.co2e_kg.toFixed(1)} kg CO₂e`
                                    : ""}
                                </p>
                              ))}
                              {materials.length > 3 && (
                                <p className="text-emerald-100/60">
                                  +{materials.length - 3} more material
                                  {materials.length - 3 > 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          )}
                          {totalWeight > 0 && (
                            <p className="text-xs text-emerald-100/70">
                              Total ≈ {totalWeight.toLocaleString()} lbs
                              {totalCo2 > 0
                                ? ` • ${totalCo2.toFixed(1)} kg CO₂e`
                                : ""}
                            </p>
                          )}
                          {saleType === "resale" && (
                            <p className="text-xs text-amber-100/80">
                              {salePrice
                                ? `Requested $${salePrice.toLocaleString(
                                    undefined,
                                    {
                                      maximumFractionDigits: 0,
                                    },
                                  )}. `
                                : ""}
                              Payment terms are negotiated in person. Funds
                              never move through CircularBuild.
                            </p>
                          )}
                        </div>
                        {owner && (
                          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white">
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
                                    <title>Profile icon</title>
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span>
                                {owner.name ?? "CircularBuild member"}
                              </span>
                              {ownerOrganizationName && (
                                <span className="text-xs text-emerald-100/70">
                                  {ownerOrganizationName}
                                </span>
                              )}
                              {owner.bio && (
                                <span className="text-xs text-emerald-100/70">
                                  {owner.bio}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </button>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                            saved
                              ? "border-emerald-300/60 bg-emerald-500/10 text-emerald-200"
                              : "border-white/20 text-emerald-100/80 hover:border-white hover:text-white"
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            void toggleWishlist(l.id);
                          }}
                        >
                          {saved ? "Saved to wishlist" : "Save to wishlist"}
                        </button>
                      </div>
                    </article>
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
