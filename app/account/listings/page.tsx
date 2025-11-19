"use client";

import { useCallback, useEffect, useState } from "react";

import AuthWall from "@/component/AuthWall";
import ParallaxSection from "@/component/ParallaxSection";
import { summarizeListingMaterials } from "@/lib/diversion";
import { useRequireAuth } from "@/lib/useRequireAuth";

type ListingRow = {
  id: string;
  title: string;
  type: string;
  shape: string;
  count: number;
  approximate_weight_lbs: number | null;
  available_until: string;
  status: string;
  created_at: string;
  description: string | null;
  materials?: unknown;
  is_deconstruction?: boolean | null;
  sale_type?: string | null;
  sale_price?: number | null;
};

type EditDraft = {
  available_until: string;
  count: number;
  description: string;
  approximate_weight_lbs: string;
};

export default function MyListingsPage() {
  const authStatus = useRequireAuth();
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft>({
    available_until: "",
    count: 1,
    description: "",
    approximate_weight_lbs: "",
  });

  const messageIsError = /error|failed|unable|could not/i.test(msg);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const response = await fetch("/api/account/listings");
      if (response.status === 401) {
        setRows([]);
        setLoading(false);
        return;
      }
      const data = (await response.json()) as {
        listings?: ListingRow[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to load listings");
      }
      setRows(data.listings ?? []);
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Unable to load listings";
      setMsg(`Failed to load listings: ${message}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    void loadListings();
  }, [authStatus, loadListings]);

  function beginEdit(row: ListingRow) {
    setEditing(row.id);
    setDraft({
      available_until: row.available_until,
      count: row.count,
      description: row.description ?? "",
      approximate_weight_lbs: row.approximate_weight_lbs
        ? String(row.approximate_weight_lbs)
        : "",
    });
  }

  async function saveEdit(id: string) {
    setMsg("");
    try {
      const response = await fetch(`/api/account/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          available_until: draft.available_until,
          count: draft.count,
          description: draft.description,
          approximate_weight_lbs:
            Number(draft.approximate_weight_lbs) > 0
              ? Number(draft.approximate_weight_lbs)
              : null,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update listing");
      }
      setEditing(null);
      await loadListings();
      setMsg("Listing updated.");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Update failed: ${message}`);
    }
  }

  async function updateStatus(id: string, status: string) {
    setMsg("");
    try {
      if (status === "procured") {
        const confirmed = window.confirm(
          "Marking this item as procured will close any active chats. Continue?",
        );
        if (!confirmed) return;
      }
      if (status === "removed") {
        const confirmed = window.confirm(
          "Removing this listing hides it from search and closes chats with interested builders. Are you sure?",
        );
        if (!confirmed) return;
      }
      const response = await fetch(`/api/account/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update listing");
      }
      await loadListings();
      setMsg(
        status === "procured"
          ? "Listing marked as procured."
          : "Listing removed.",
      );
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Could not update status: ${message}`);
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
            <AuthWall message="Sign in to manage your listings." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Material inventory organized for donation"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.24}
        maxOffset={220}
      >
        <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col justify-center gap-6 px-4 py-14 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Dashboard
          </span>
          <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-tight">
            Manage your active and archived material donations.
          </h1>
          <p className="max-w-3xl text-sm text-emerald-100/90 sm:text-base">
            Mark pickups as procured, adjust availability, and keep chats
            aligned with status updates.
          </p>
        </div>
      </ParallaxSection>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_left,_rgba(74,222,128,0.3),_transparent_60%)]" />
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
              Loading your listings…
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-3xl border border-white/15 bg-white/10 px-6 py-10 text-sm text-emerald-100/80 shadow-lg backdrop-blur-lg">
              You don&apos;t have any listings yet. Head to the Donate tab to
              share surplus material.
            </div>
          ) : (
            <div className="space-y-5">
              {rows.map((row) => {
                const isEditing = editing === row.id;
                const saleType =
                  row.sale_type === "resale" ? "resale" : ("donation" as const);
                const salePrice =
                  saleType === "resale" && row.sale_price
                    ? Number(row.sale_price)
                    : null;
                const {
                  entries: materials,
                  totalWeight,
                  totalCo2,
                } = summarizeListingMaterials(row);
                return (
                  <article
                    key={row.id}
                    className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur-lg"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-white">
                          {row.title}
                        </h2>
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-100/80">
                          <span
                            className={`rounded-full border px-3 py-1 ${
                              saleType === "resale"
                                ? "border-amber-200/60 bg-amber-500/10 text-amber-100"
                                : "border-emerald-200/40 bg-emerald-500/10 text-emerald-100"
                            }`}
                          >
                            {saleType === "resale" ? "Resale" : "Donation"}
                          </span>
                          {row.is_deconstruction && (
                            <span className="rounded-full border border-cyan-200/60 bg-cyan-500/10 px-3 py-1 text-cyan-100">
                              Deconstruction
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-emerald-100/70">
                          {row.type} • {row.shape} • {row.count} pcs
                        </p>
                        {materials.length > 0 && (
                          <div className="mt-1 space-y-1 text-xs text-emerald-100/75">
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
                            Payment negotiated offline only.
                          </p>
                        )}
                        <p className="text-xs text-emerald-100/70">
                          Status:{" "}
                          <span className="font-medium uppercase text-emerald-200">
                            {row.status}
                          </span>
                        </p>
                        <p className="text-xs text-emerald-100/60">
                          Added {new Date(row.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                        {row.status !== "procured" && (
                          <button
                            type="button"
                            className="rounded-full border border-emerald-300/60 px-3 py-1 font-medium text-emerald-200 transition hover:border-white hover:text-white"
                            onClick={() => updateStatus(row.id, "procured")}
                          >
                            Mark procured
                          </button>
                        )}
                        {row.status !== "removed" && (
                          <button
                            type="button"
                            className="rounded-full border border-white/20 px-3 py-1 font-medium text-rose-200 transition hover:border-rose-200"
                            onClick={() => updateStatus(row.id, "removed")}
                          >
                            Remove listing
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded-full border border-white/20 px-3 py-1 font-medium text-emerald-100/80 transition hover:border-white hover:text-white"
                          onClick={() =>
                            isEditing ? setEditing(null) : beginEdit(row)
                          }
                        >
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                            Available until
                          </span>
                          <input
                            type="date"
                            className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            value={draft.available_until}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                available_until: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                            Count
                          </span>
                          <input
                            type="number"
                            min={1}
                            className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            value={draft.count}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                count: Number(e.target.value) || 1,
                              }))
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                            Approximate weight (lbs)
                          </span>
                          <input
                            type="number"
                            min={0}
                            className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            value={draft.approximate_weight_lbs}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                approximate_weight_lbs: e.target.value,
                              }))
                            }
                            placeholder="Enter a positive number"
                          />
                        </label>
                        <label className="flex flex-col gap-2 sm:col-span-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                            Description
                          </span>
                          <textarea
                            className="min-h-[140px] rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            value={draft.description}
                            onChange={(e) =>
                              setDraft((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
                          <button
                            type="button"
                            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-emerald-100/80 transition hover:border-white hover:text-white"
                            onClick={() => setEditing(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-500"
                            onClick={() => saveEdit(row.id)}
                          >
                            Save changes
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
