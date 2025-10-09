"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AuthWall from "@/component/AuthWall";
import ListingCard, { type ListingCardData } from "@/component/ListingCard";
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

const QUICK_FILTERS = [
  "Lumber",
  "Steel",
  "Fixtures",
  "Finishes",
  "Nonprofit priorities",
  "Campus builds",
  "Humanitarian",
];

const RADIUS_OPTIONS = ["10", "25", "50", "100"];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72";

const MATERIALS_BREAKDOWN = [
  {
    title: "Dimensional lumber",
    description:
      "Bundles, offcuts, and glulam ready for framing or fabrication.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c",
  },
  {
    title: "Precision steel",
    description: "Beams and plate stock catalogued after deconstruction.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
  },
  {
    title: "Fixtures & finishes",
    description:
      "Lighting, cabinetry, tile, and salvaged architectural details.",
    image: "https://images.unsplash.com/photo-1523419409543-0c1df022bdd1",
  },
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
  const router = useRouter();
  const authStatus = useRequireAuth();
  const isAuthenticated = authStatus === "authenticated";

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState<string>("25");
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    [q, type, address, radiusMiles, origin],
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

  const listingCards: ListingCardData[] = items.map((listing) => ({
    id: listing.id,
    title: listing.title,
    image: listing.photos?.[0] ?? FALLBACK_IMAGE,
    tags: [listing.type, listing.shape].filter(Boolean),
    location: listing.location_text,
    available: `Available until ${listing.available_until}`,
    footer: (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
          onClick={() => handleViewListing(listing.id)}
        >
          View listing
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            wishlistIds.has(listing.id)
              ? "border border-emerald-500 text-emerald-600"
              : "border border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-600"
          }`}
          onClick={() => toggleWishlist(listing.id)}
        >
          {wishlistIds.has(listing.id) ? "Saved" : "Save"}
        </button>
      </div>
    ),
  }));

  const dismissAuthPrompt = () => setAuthPrompt(null);

  const applyQuickFilter = (chip: string) => {
    setType(chip === type ? "" : chip);
    void fetchListings();
  };

  const filtersPanel = (
    <div className="flex flex-col gap-4">
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-600">Keywords</span>
          <input
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="Search by title, shape, description"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-600">Material</span>
          <select
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
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
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-600">Address or region</span>
          <input
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="ZIP code or full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-600">Radius (miles)</span>
          <select
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          >
            {RADIUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Within {option} miles
              </option>
            ))}
            <option value="0">Exact location</option>
          </select>
        </label>
        <div className="flex flex-col gap-3 pt-2 text-sm">
          <button
            type="button"
            className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
            onClick={() => fetchListings()}
            disabled={loading}
          >
            {loading ? "Searching…" : "Apply filters"}
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-500 transition hover:text-emerald-600"
            onClick={() => {
              setQ("");
              setType("");
              setAddress("");
              setRadius("25");
              void fetchListings({ initial: true });
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-600">
        <p className="font-semibold text-slate-900">
          Using your device location
        </p>
        <p className="mt-2 leading-6">
          Share your current location to surface nearby materials and keep
          pickup logistics efficient.
        </p>
        <button
          type="button"
          className="mt-3 rounded-full border border-emerald-500 px-4 py-2 font-semibold text-emerald-600 transition hover:bg-emerald-50"
          onClick={handleUseCurrentLocation}
        >
          Use my location
        </button>
        {locStatus && (
          <p className="mt-2 text-xs text-slate-500">{locStatus}</p>
        )}
      </div>
    </div>
  );

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        Loading marketplace…
      </main>
    );
  }

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

      {isFilterOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500"
                onClick={() => setIsFilterOpen(false)}
              >
                Close
              </button>
            </div>
            {filtersPanel}
          </div>
        </div>
      )}

      <main className="w-full bg-slate-50 pb-16 pt-8">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.35em] text-emerald-600">
                Marketplace preview
              </span>
              <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold text-slate-900">
                Explore reuse-ready materials across the network.
              </h1>
              <p className="text-sm text-slate-600 lg:text-base">
                Preview available lots before creating an account. Sign in when
                you&apos;re ready to save, chat, or coordinate pickups.
              </p>
            </div>
            <div className="flex gap-3 lg:hidden">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() => setIsFilterOpen(true)}
              >
                Filters
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
                onClick={() =>
                  setViewMode(viewMode === "list" ? "map" : "list")
                }
              >
                {viewMode === "list" ? "Map" : "List"} view
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <aside className="hidden shrink-0 lg:block lg:w-72">
              <div className="sticky top-24 space-y-6">{filtersPanel}</div>
            </aside>

            <section className="w-full flex-1 space-y-8">
              <div className="hidden items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 lg:flex">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={`rounded-full px-4 py-1.5 font-semibold transition ${
                      viewMode === "list"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-500"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    List view
                  </button>
                  <button
                    type="button"
                    className={`rounded-full px-4 py-1.5 font-semibold transition ${
                      viewMode === "map"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-500"
                    }`}
                    onClick={() => setViewMode("map")}
                  >
                    Map view
                  </button>
                </div>
                <span>
                  Showing {items.length} listing{items.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 overflow-x-auto rounded-3xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
                {QUICK_FILTERS.map((chip) => (
                  <button
                    key={`chip-${chip}`}
                    type="button"
                    onClick={() => applyQuickFilter(chip)}
                    className={`rounded-full px-4 py-2 font-semibold transition ${
                      type === chip
                        ? "bg-emerald-600 text-white shadow"
                        : "border border-slate-200 bg-white hover:border-emerald-400 hover:text-emerald-600"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {msg && (
                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  {msg}
                </div>
              )}
              {wishlistMsg && (
                <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {wishlistMsg}
                </div>
              )}

              {viewMode === "map" ? (
                <div className="h-[520px] overflow-hidden rounded-3xl border border-slate-200">
                  <ListingMap
                    listings={items}
                    radius={radiusMiles}
                    origin={origin}
                  />
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {listingCards.map((card) => (
                      <ListingCard key={card.id} listing={card} />
                    ))}
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-500"
                      disabled
                    >
                      Load more listings (coming soon)
                    </button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-3">
                    {MATERIALS_BREAKDOWN.map((card) => (
                      <article
                        key={card.title}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="relative h-40 w-full">
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-2 p-5">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {card.title}
                          </h3>
                          <p className="text-sm text-slate-600 leading-6">
                            {card.description}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
