"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import AuthWall from "@/component/AuthWall";
import { cleanListingDescription } from "@/lib/cleanListingDescription";
import { summarizeListingMaterials } from "@/lib/diversion";
import { getOrganizationBySlug } from "@/lib/organizations";
import { useRequireAuth } from "@/lib/useRequireAuth";

type ListingOwner = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  organization_slug?: string | null;
} | null;

type Listing = {
  id: string;
  owner_id: string;
  title: string;
  type: string;
  shape: string;
  count: number;
  approximate_weight_lbs: number | null;
  available_until: string;
  location_text: string;
  description: string;
  photos: string[] | null;
  status: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  owner?: ListingOwner;
  materials?: unknown;
  is_deconstruction?: boolean | null;
  sale_type?: string | null;
  sale_price?: number | null;
};

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const authStatus = useRequireAuth();
  const { status: sessionStatus } = useSession();
  const [l, setL] = useState<Listing | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated" || !params?.id) return;
    let active = true;
    setLoading(true);
    setMsg("");
    (async () => {
      try {
        const res = await fetch(`/api/listings/${params.id}`);
        const payload = (await res.json()) as {
          listing?: Listing;
          isSaved?: boolean;
          error?: string;
        };
        if (!res.ok || !payload.listing) {
          if (!active) return;
          setMsg(`Error loading listing: ${payload.error ?? res.statusText}`);
          setL(null);
          return;
        }
        if (!active) return;
        setL(payload.listing);
        setSaved(Boolean(payload.isSaved));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load listing";
        if (!active) return;
        setMsg(`Error loading listing: ${message}`);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [authStatus, params?.id]);

  async function contact() {
    setMsg("");
    try {
      if (sessionStatus !== "authenticated") {
        router.push(
          `/auth?next=${encodeURIComponent(`/listing/${params?.id ?? ""}`)}`,
        );
        return;
      }
      if (!l) throw new Error("Listing not loaded");

      const response = await fetch("/api/chats/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: l.id }),
      });

      const data = (await response.json()) as {
        chatId?: string;
        error?: string;
      };

      if (!response.ok || !data?.chatId) {
        throw new Error(data?.error ?? "Unable to start chat.");
      }

      router.push(`/chats/${data.chatId}`);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Error contacting lister: ${message}`);
    }
  }

  async function toggleWishlist() {
    setMsg("");
    try {
      if (sessionStatus !== "authenticated") {
        window.alert("Please sign in first.");
        return;
      }
      if (!l) return;
      const method = saved ? "DELETE" : "POST";
      const response = await fetch("/api/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: l.id }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update wishlist.");
      }
      setSaved(!saved);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Could not update wishlist: ${message}`);
    }
  }

  if (authStatus === "checking") {
    return <main className="p-6">Checking authentication…</main>;
  }

  if (authStatus === "unauthenticated") {
    return <AuthWall message="Sign in to view donation details." />;
  }

  if (loading) {
    return <main className="p-6">Loading...</main>;
  }
  if (!l) {
    return <main className="p-6">Listing not found.</main>;
  }

  const owner: ListingOwner = l.owner ?? null;

  const visibleDescription = cleanListingDescription(l.description);
  const saleType = l.sale_type === "resale" ? "resale" : ("donation" as const);
  const salePrice =
    saleType === "resale" && typeof l.sale_price === "number"
      ? l.sale_price
      : null;
  const {
    entries: materials,
    totalWeight,
    totalCo2,
  } = summarizeListingMaterials(l);
  const ownerOrganizationName = owner?.organization_slug
    ? (getOrganizationBySlug(owner.organization_slug)?.name ?? null)
    : null;

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 text-white">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/search")}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100/90 shadow transition hover:border-white hover:text-white"
        >
          ← Back to search
        </button>
        <span className="text-xs uppercase tracking-[0.3em] text-emerald-200">
          Listing detail
        </span>
      </div>
      <section className="rounded-3xl border border-white/15 bg-white/10 px-6 py-6 shadow-lg backdrop-blur-lg">
        <h1 className="text-2xl font-bold text-white">{l.title}</h1>

        {l.photos && l.photos.length > 0 && (
          <Image
            src={l.photos[0]}
            alt={l.title}
            width={1024}
            height={512}
            sizes="(max-width: 768px) 100vw, 960px"
            className="mt-4 h-64 w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-100/80">
          <span
            className={`rounded-full border px-3 py-1 ${
              saleType === "resale"
                ? "border-amber-200/60 bg-amber-500/15 text-amber-100"
                : "border-emerald-200/40 bg-emerald-500/15 text-emerald-100"
            }`}
          >
            {saleType === "resale" ? "Resale" : "Donation"}
          </span>
          {l.is_deconstruction && (
            <span className="rounded-full border border-cyan-200/60 bg-cyan-500/15 px-3 py-1 text-cyan-100">
              Deconstruction
            </span>
          )}
        </div>
        <div className="mt-4 text-sm text-emerald-100/90">
          {l.type} • {l.shape} • {l.count} pcs
        </div>
        <div className="text-xs text-emerald-100/70">
          Available until {l.available_until} • {l.location_text}
        </div>
        {totalWeight > 0 && (
          <div className="mt-1 text-xs text-emerald-100/70">
            Approx. {totalWeight.toLocaleString()} lbs • {totalCo2.toFixed(1)}{" "}
            kg CO₂e saved
          </div>
        )}
        {saleType === "resale" ? (
          <div className="mt-4 rounded-2xl border border-amber-200/50 bg-amber-500/10 p-4 text-sm text-amber-100/90">
            <p className="font-semibold uppercase tracking-[0.3em] text-amber-200">
              Resale terms
            </p>
            <p className="mt-2">
              {salePrice
                ? `Requested contribution: $${salePrice.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    },
                  )}. `
                : ""}
              Buyers and sellers negotiate the final amount directly and must
              exchange any funds in person. CircularBuild does not process or
              guarantee payments for resale listings.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-xs text-emerald-100/80">
            Listed as a donation. Recipients coordinate pickup logistics and no
            money changes hands through CircularBuild.
          </p>
        )}
        <p className="mt-4 text-sm leading-6 text-emerald-100/90">
          {visibleDescription || "No additional description provided."}
        </p>
        {materials.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-emerald-100/85">
            <h2 className="text-base font-semibold text-white">
              Material breakdown
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {materials.map((material) => (
                <li
                  key={`${material.type}-${material.weight_lbs}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-emerald-100/85"
                >
                  <span className="font-medium">{material.type}</span>
                  <span>
                    {material.weight_lbs.toLocaleString()} lbs
                    {material.co2e_kg > 0
                      ? ` • ${material.co2e_kg.toFixed(1)} kg CO₂e`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-emerald-100/70">
              Total ≈ {totalWeight.toLocaleString()} lbs • {totalCo2.toFixed(1)}{" "}
              kg CO₂e
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400"
            onClick={contact}
          >
            Contact lister
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
              saved
                ? "border border-emerald-300/60 bg-emerald-500/10 text-emerald-200"
                : "border border-white/20 bg-white/10 text-emerald-100/80 hover:border-white hover:text-white"
            }`}
            onClick={toggleWishlist}
          >
            {saved ? "Saved to wishlist" : "Save to wishlist"}
          </button>
        </div>
      </section>

      {owner && (
        <section className="rounded-3xl border border-white/15 bg-white/10 px-6 py-6 shadow-lg backdrop-blur-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="overflow-hidden rounded-full border border-white/30 bg-white/10">
                {owner.avatar_url ? (
                  <Image
                    src={owner.avatar_url}
                    alt={owner.name ?? "Donor avatar"}
                    width={72}
                    height={72}
                    className="h-16 w-16 object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center text-emerald-100/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      className="h-8 w-8"
                    >
                      <title>Profile icon</title>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-emerald-100/70">Listed by</p>
                <Link
                  href={`/profile/${owner.id}`}
                  className="text-lg font-semibold text-white underline-offset-4 hover:underline"
                >
                  {owner.name ?? "CircularBuild member"}
                </Link>
                {ownerOrganizationName && (
                  <p className="text-xs text-emerald-100/70">
                    {ownerOrganizationName}
                  </p>
                )}
              </div>
            </div>
            <div className="max-w-xl text-sm text-emerald-100/80">
              {owner.bio ? owner.bio : "This donor hasn’t added a bio yet."}
            </div>
          </div>
        </section>
      )}

      {msg && (
        <div className="rounded-3xl border border-rose-200/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-100 shadow-lg backdrop-blur-lg">
          {msg}
        </div>
      )}
    </main>
  );
}
