"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AuthWall from "@/component/AuthWall";
import ParallaxSection from "@/component/ParallaxSection";
import { summarizeListingMaterials } from "@/lib/diversion";
import { useRequireAuth } from "@/lib/useRequireAuth";

type SavedListing = {
  id: string;
  listing_id: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    type: string;
    shape: string;
    count: number | null;
    approximate_weight_lbs: number | null;
    status: string;
    location_text: string;
    available_until: string;
    photos: string[] | null;
    materials?: unknown;
    is_deconstruction?: boolean | null;
    sale_type?: string | null;
    sale_price?: number | null;
  } | null;
};

type WishlistRow = {
  id: string;
  listing_id: string;
  created_at: string;
  listing: SavedListing["listing"] | SavedListing["listing"][];
};

export default function WishlistPage() {
  const authStatus = useRequireAuth();
  const [rows, setRows] = useState<SavedListing[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const messageIsError = /error|unable|could not/i.test(msg);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/account/wishlist");
        if (response.status === 401) {
          setRows([]);
          setLoading(false);
          return;
        }
        const data = (await response.json()) as {
          rows?: WishlistRow[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to load wishlist");
        }
        const normalized = (data.rows ?? []).map((row) => {
          const listingValue = Array.isArray(row.listing)
            ? (row.listing[0] ?? null)
            : (row.listing ?? null);
          return {
            id: row.id,
            listing_id: row.listing_id,
            created_at: row.created_at,
            listing: listingValue,
          } satisfies SavedListing;
        });
        setRows(normalized);
      } catch (error) {
        console.error(error);
        const message =
          error instanceof Error ? error.message : "Unable to load wishlist";
        setMsg(`Could not load wishlist: ${message}`);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [authStatus]);

  async function remove(listingId: string) {
    setMsg("");
    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update wishlist");
      }
      setRows((prev) => prev.filter((row) => row.listing_id !== listingId));
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Unable to remove";
      setMsg(`Unable to remove: ${message}`);
    }
  }

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-emerald-100">
        Checking authentication…
      </main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)]" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <AuthWall message="Sign in to see saved materials." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Builder reviewing project plans"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.22}
        maxOffset={200}
      >
        <div className="mx-auto flex min-h-[45vh] max-w-6xl flex-col justify-center gap-6 px-4 py-14 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Saved materials
          </span>
          <h1 className="text-[clamp(2rem,4vw,3.3rem)] font-extrabold leading-tight">
            Keep potential pickups close while you finalize project needs.
          </h1>
          <p className="max-w-3xl text-sm text-emerald-100/90 sm:text-base">
            Items stay here until a donor marks them procured or removes the
            listing. Reach out early to secure transport and labor.
          </p>
        </div>
      </ParallaxSection>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_right,_rgba(74,222,128,0.3),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-5xl space-y-6 px-4 py-14 sm:px-6 lg:px-8">
          {msg && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-lg ${
                messageIsError
                  ? "border-rose-200/40 bg-rose-500/20 text-rose-100"
                  : "border-emerald-200/40 bg-emerald-500/20 text-emerald-100"
              }`}
            >
              {msg}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-white/15 bg-white/10 px-6 py-10 text-sm text-emerald-100/80 shadow-lg backdrop-blur-lg">
              Loading saved items…
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-3xl border border-white/15 bg-white/10 px-6 py-10 text-sm text-emerald-100/80 shadow-lg backdrop-blur-lg">
              Your wishlist is empty. Head to the{" "}
              <Link
                href="/search"
                className="font-semibold text-emerald-200 underline underline-offset-4 hover:text-white"
              >
                Marketplace
              </Link>{" "}
              to discover materials and save them for later.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rows.map((row) => {
                const listing = row.listing;
                const saleType =
                  listing?.sale_type === "resale"
                    ? "resale"
                    : ("donation" as const);
                const salePrice =
                  saleType === "resale" && listing?.sale_price
                    ? Number(listing.sale_price)
                    : null;
                const {
                  entries: materials,
                  totalWeight,
                  totalCo2,
                } = summarizeListingMaterials(listing ?? {});
                return (
                  <div
                    key={row.id}
                    className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur-lg"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-white">
                          {listing?.title ?? "Listing"}
                        </h2>
                        <p className="text-xs text-emerald-100/70">
                          {listing?.type} • {listing?.shape}
                        </p>
                        <p className="text-xs text-emerald-100/70">
                          Status: {listing?.status ?? "Unknown"}
                        </p>
                        <p className="text-xs text-emerald-100/70">
                          Available until {listing?.available_until ?? "—"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-100/80">
                          <span
                            className={`rounded-full border px-3 py-1 ${
                              saleType === "resale"
                                ? "border-amber-200/60 bg-amber-500/10 text-amber-100"
                                : "border-emerald-200/40 bg-emerald-500/10 text-emerald-100"
                            }`}
                          >
                            {saleType === "resale" ? "Resale" : "Donation"}
                          </span>
                          {listing?.is_deconstruction && (
                            <span className="rounded-full border border-cyan-200/60 bg-cyan-500/10 px-3 py-1 text-cyan-100">
                              Deconstruction
                            </span>
                          )}
                        </div>
                        {materials.length > 0 && (
                          <div className="mt-2 space-y-1 text-xs text-emerald-100/75">
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
                              <p className="text-emerald-100/50">
                                +{materials.length - 3} more material
                                {materials.length - 3 > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        )}
                        {totalWeight > 0 && (
                          <p className="text-xs text-emerald-100/70">
                            Total ≈ {totalWeight.toLocaleString()} lbs •{" "}
                            {totalCo2.toFixed(1)} kg CO₂e
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
                            Payment must be negotiated and exchanged in person.
                          </p>
                        )}
                        <p className="text-xs text-emerald-100/60">
                          Saved {new Date(row.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-200 transition hover:text-white"
                        onClick={() => remove(row.listing_id)}
                      >
                        Remove
                      </button>
                    </div>
                    {listing?.status !== "active" && (
                      <p className="mt-2 text-xs text-amber-200/80">
                        This listing is marked {listing?.status}. Reach out to
                        the donor to confirm availability.
                      </p>
                    )}
                    <div className="mt-4 flex gap-3">
                      <Link
                        href={`/listing/${row.listing_id}`}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400"
                      >
                        View listing
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
