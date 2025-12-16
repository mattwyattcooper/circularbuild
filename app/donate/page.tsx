"use client";

import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import AuthWall from "@/component/AuthWall";
import ParallaxSection from "@/component/ParallaxSection";
import { MATERIAL_OPTIONS } from "@/lib/diversion";
import { useRequireAuth } from "@/lib/useRequireAuth";

// ----- helpers -----
function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function daysFromNowISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

const MAX_MATERIAL_ENTRIES = 4;
type MaterialEntry = { material: string; weight: string };
type ProfileRequirementStatus =
  | "idle"
  | "checking"
  | "ready"
  | "incomplete"
  | "error";

export default function DonatePage() {
  const authStatus = useRequireAuth();
  // ----- form state -----
  const [title, setTitle] = useState("");
  const [shape, setShape] = useState("");
  const [count, setCount] = useState<number>(1);
  const [materials, setMaterials] = useState<MaterialEntry[]>([
    { material: MATERIAL_OPTIONS[0], weight: "" },
  ]);
  const [available, setAvailable] = useState(daysFromNowISO(14)); // default 2 weeks ahead
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [consentContact, setConsentContact] = useState(false);
  const [isDeconstruction, setIsDeconstruction] = useState(false);
  const [saleType, setSaleType] = useState<"donation" | "resale">("donation");
  const [salePrice, setSalePrice] = useState("");

  // ----- ui state -----
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profileStatus, setProfileStatus] =
    useState<ProfileRequirementStatus>("idle");
  const [profileStatusMessage, setProfileStatusMessage] = useState("");

  const addMaterialEntry = () => {
    setMaterials((prev) => {
      if (prev.length >= MAX_MATERIAL_ENTRIES) return prev;
      return [...prev, { material: MATERIAL_OPTIONS[0], weight: "" }];
    });
  };

  const updateMaterialEntry = (
    index: number,
    payload: Partial<MaterialEntry>,
  ) => {
    setMaterials((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...payload } : entry)),
    );
  };

  const removeMaterialEntry = (index: number) => {
    setMaterials((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const fetchProfileStatus = useCallback(async () => {
    if (authStatus !== "authenticated") return;
    setProfileStatus("checking");
    setProfileStatusMessage("");
    try {
      const response = await fetch("/api/account/profile", {
        cache: "no-store",
      });
      if (!response.ok) {
        const fallbackMessage =
          response.status === 401
            ? "Please sign in again to continue."
            : "Unable to verify your account profile.";
        throw new Error(fallbackMessage);
      }
      const data = (await response.json()) as {
        profile?: { name?: string | null } | null;
      };
      const profile = data?.profile ?? null;
      const hasName =
        typeof profile?.name === "string" && profile.name.trim().length > 0;
      if (hasName) {
        setProfileStatus("ready");
      } else {
        setProfileStatus("incomplete");
        setProfileStatusMessage(
          "Add your name on the Account page before publishing donations.",
        );
      }
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify account profile.";
      setProfileStatus("error");
      setProfileStatusMessage(message);
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setProfileStatus("idle");
      setProfileStatusMessage("");
      return;
    }
    void fetchProfileStatus();
  }, [authStatus, fetchProfileStatus]);

  const recheckProfileStatus = () => {
    void fetchProfileStatus();
  };

  async function submit() {
    setMsg("");
    setSubmitting(true);
    try {
      if (profileStatus !== "ready") {
        throw new Error(
          "Please complete your account profile before publishing a listing.",
        );
      }
      if (!title.trim()) throw new Error("Title is required.");
      if (!shape.trim()) throw new Error("Shape is required.");
      if (!available)
        throw new Error("Please select an 'Available until' date.");
      if (!locationText.trim()) throw new Error("Address or ZIP is required.");
      if (!agreed)
        throw new Error("You must agree to the terms and conditions.");
      if (!signature.trim()) throw new Error("Signature is required.");
      if (!consentContact)
        throw new Error("Consent to be contacted is required.");
      if (!files || files.length === 0) {
        throw new Error("Please upload at least one photo of the donation.");
      }

      const normalizedMaterials = materials
        .map((entry) => ({
          type: entry.material,
          weightLbs: Number(entry.weight),
        }))
        .filter(
          (entry) =>
            entry.type &&
            Number.isFinite(entry.weightLbs) &&
            entry.weightLbs > 0,
        );

      if (normalizedMaterials.length === 0) {
        throw new Error("Please include at least one material with a weight.");
      }

      const totalWeight = normalizedMaterials.reduce(
        (sum, entry) => sum + entry.weightLbs,
        0,
      );

      if (totalWeight <= 0) {
        throw new Error("Approximate weight (lbs) is required.");
      }

      let salePriceValue: number | null = null;
      if (saleType === "resale") {
        const parsed = Number(salePrice);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new Error("Please enter a positive asking price.");
        }
        salePriceValue = parsed;
      }

      const primaryMaterial =
        normalizedMaterials[0]?.type ?? MATERIAL_OPTIONS[0];

      const availableDate = new Date(available);
      if (Number.isNaN(availableDate.getTime()))
        throw new Error("Invalid 'Available until' date.");
      const availableISO = availableDate.toISOString().slice(0, 10);

      const geoRes = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: locationText }),
      });
      if (!geoRes.ok) throw new Error("Geocoding failed.");
      const g = await geoRes.json();
      const lat = g?.lat ?? null;
      const lng = g?.lng ?? null;

      const piecesCount = Number.isFinite(count) && count > 0 ? count : 1;
      const detailedDescription = `${description.trim()}

---
Donor declaration: Information provided is truthful.
Signer: ${signature.trim()}
Consented to contact: ${consentContact ? "Yes" : "No"}`;

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("type", primaryMaterial);
      formData.append("shape", shape.trim());
      formData.append("count", String(piecesCount));
      formData.append("approximateWeightLbs", String(totalWeight));
      formData.append("materials", JSON.stringify(normalizedMaterials));
      formData.append("isDeconstruction", String(isDeconstruction));
      formData.append("saleType", saleType);
      if (saleType === "resale" && salePriceValue) {
        formData.append("salePrice", String(salePriceValue));
      }
      formData.append("availableUntil", availableISO);
      formData.append("locationText", locationText.trim());
      formData.append("description", detailedDescription);
      formData.append("signature", signature.trim());
      formData.append("consentContact", String(consentContact));
      if (lat != null) formData.append("lat", String(lat));
      if (lng != null) formData.append("lng", String(lng));

      if (files?.length) {
        for (const file of Array.from(files)) {
          formData.append("photos", file, file.name);
        }
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        body: formData,
      });
      const rawResponse = await response.text();
      let payload: {
        error?: string;
        message?: string;
        requiresProfile?: boolean;
      } | null = null;
      if (rawResponse) {
        try {
          payload = JSON.parse(rawResponse) as {
            error?: string;
            message?: string;
          };
        } catch (error) {
          console.warn("Non-JSON response from /api/listings", error);
        }
      }
      if (!response.ok) {
        if (payload?.requiresProfile) {
          setProfileStatus("incomplete");
          setProfileStatusMessage(
            "Please complete your account profile before publishing donations.",
          );
        }
        const unauthorizedMessage =
          response.status === 401 || response.status === 403
            ? "You are not authorized to publish listings. Please sign in again."
            : null;
        const fallbackMessage =
          "We couldn’t publish your listing. Double-check the required fields and try again.";
        throw new Error(
          payload?.error ??
            unauthorizedMessage ??
            (rawResponse?.trim() || null) ??
            fallbackMessage,
        );
      }

      setMsg(payload?.message ?? "✅ Listing published.");
      setTitle("");
      setMaterials([{ material: MATERIAL_OPTIONS[0], weight: "" }]);
      setShape("");
      setCount(1);
      setAvailable(daysFromNowISO(14));
      setLocationText("");
      setDescription("");
      setSignature("");
      setAgreed(false);
      setConsentContact(false);
      setIsDeconstruction(false);
      setSaleType("donation");
      setSalePrice("");
      const el = document.getElementById("photos") as HTMLInputElement | null;
      if (el) el.value = "";
      setFiles(null);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      const friendlyMessage = message.startsWith("Please ")
        ? message
        : `We couldn't publish your listing. ${message}`;
      setMsg(`Error: ${friendlyMessage}`);
    } finally {
      setSubmitting(false);
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submit();
  };

  const isErrorMessage = msg.trim().toLowerCase().startsWith("error");

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
            <AuthWall
              title="Sign in required"
              message="Sign in to donate materials through CircularBuild."
              nextPath="/donate"
              secondaryHref="/"
            />
          </div>
        </div>
      </main>
    );
  }

  if (authStatus === "authenticated" && profileStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-emerald-100">
        Verifying your account profile…
      </main>
    );
  }

  if (authStatus === "authenticated" && profileStatus === "error") {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)]" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-lg">
            <h1 className="text-xl font-semibold text-white">
              We can&apos;t confirm your account
            </h1>
            <p className="mt-4 text-sm text-emerald-100/80">
              {profileStatusMessage ||
                "Please try again or refresh the page before donating."}
            </p>
            <button
              type="button"
              onClick={recheckProfileStatus}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (authStatus === "authenticated" && profileStatus === "incomplete") {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)]" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-xl space-y-6 rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-lg">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Action required
            </span>
            <h1 className="text-2xl font-bold text-white">
              Finish your profile before donating
            </h1>
            <p className="text-sm text-emerald-100/80">
              {profileStatusMessage ||
                "Add your name and organization details on the Account page to let recipients know who they are coordinating with."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/account"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-400"
              >
                Update profile
              </Link>
              <button
                type="button"
                onClick={recheckProfileStatus}
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                I updated it
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col text-white">
      <ParallaxSection
        imageSrc="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2400&q=80"
        imageAlt="Contractors preparing reclaimed structural lumber"
        overlayClassName="bg-slate-950/65"
        className="mt-[-1px]"
        speed={0.24}
        maxOffset={220}
      >
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
          <div className="flex-1 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Share surplus materials
            </span>
            <h1 className="text-[clamp(2.25rem,4vw,3.75rem)] font-extrabold leading-tight">
              Publish donations that keep projects stocked and landfill waste
              low.
            </h1>
            <p className="max-w-2xl text-base text-emerald-100/90 sm:text-lg">
              Verified nonprofits, student builders, and neighbors rely on your
              leftover materials. List availability, upload quick photos, and
              we’ll take care of matching requests and coordinating pickups.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-lg">
            <h2 className="text-lg font-semibold text-white">
              Donation quick facts
            </h2>
            <ul className="space-y-3 text-sm text-emerald-100/90">
              <li>• Listings notify builders in your region instantly.</li>
              <li>• Chat threads and pickup notes keep handoffs simple.</li>
              <li>
                • Diversion metrics are logged automatically for your records.
              </li>
            </ul>
          </div>
        </div>
      </ParallaxSection>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(74,222,128,0.35),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-8 shadow-2xl backdrop-blur-xl sm:px-10 lg:px-12">
            <div className="mb-10 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Donation details
              </span>
              <p className="max-w-3xl text-sm text-emerald-100/85 sm:text-base">
                Share accurate specifications so recipients can plan labor and
                transport. All fields marked with an asterisk are required.
              </p>
            </div>

            <form className="space-y-10" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Title *
                  </span>
                  <input
                    className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g., 2x4 offcuts bundle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Shape *
                  </span>
                  <input
                    className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder={`e.g., 2x4, 1" pipe`}
                    value={shape}
                    onChange={(e) => setShape(e.target.value)}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Number of pieces *
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={count}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value, 10);
                      setCount(
                        Number.isNaN(value)
                          ? 1
                          : Math.max(1, Math.min(9999, value)),
                      );
                    }}
                  />
                  <span className="text-xs text-emerald-100/70">
                    Use the best estimate if you are unsure.
                  </span>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Available until *
                  </span>
                  <input
                    type="date"
                    className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={available}
                    onChange={(e) => setAvailable(e.target.value)}
                    min={todayISO()}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Location (address or ZIP) *
                  </span>
                  <input
                    className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="ZIP or full address"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Materials & approximate weight*
                    </p>
                    <p className="text-xs text-emerald-100/70">
                      Add up to four material/weight combinations for bulk{" "}
                      listings.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/80 transition hover:border-white hover:text-white"
                    onClick={addMaterialEntry}
                    disabled={materials.length >= MAX_MATERIAL_ENTRIES}
                  >
                    Add material
                  </button>
                </div>
                <div className="space-y-4">
                  {materials.map((entry, index) => (
                    <div
                      key={`${entry.material}-${index}`}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      <label className="flex flex-col gap-2 text-sm">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                          Material #{index + 1}
                        </span>
                        <select
                          className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          value={entry.material}
                          onChange={(e) =>
                            updateMaterialEntry(index, {
                              material: e.target.value,
                            })
                          }
                        >
                          {MATERIAL_OPTIONS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-2 text-sm">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                          Approximate weight (lbs)
                        </span>
                        <input
                          type="number"
                          min={1}
                          className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          value={entry.weight}
                          onChange={(e) =>
                            updateMaterialEntry(index, {
                              weight: e.target.value,
                            })
                          }
                          placeholder="e.g., 1200"
                        />
                      </label>
                      {materials.length > 1 && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-rose-200 transition hover:text-white"
                          onClick={() => removeMaterialEntry(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-emerald-100/85">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-white/40 bg-white/20 text-emerald-500 focus:ring-emerald-400"
                    checked={isDeconstruction}
                    onChange={(e) => setIsDeconstruction(e.target.checked)}
                  />
                  <span>
                    Mark as a <strong>deconstruction listing</strong>. These
                    posts are highlighted for builders seeking full-structure
                    dismantles.
                  </span>
                </label>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-emerald-100/85">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/40 bg-white/20 text-emerald-500 focus:ring-emerald-400"
                      checked={saleType === "resale"}
                      onChange={(e) =>
                        setSaleType(e.target.checked ? "resale" : "donation")
                      }
                    />
                    <span>
                      Offer as <strong>resale</strong> (payment negotiated in
                      person).
                    </span>
                  </label>
                  {saleType === "resale" && (
                    <div className="mt-4 space-y-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                          Requested price (USD)
                        </span>
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          placeholder="e.g., 250"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          required={saleType === "resale"}
                        />
                      </label>
                      <p className="text-xs text-emerald-100/70">
                        Payments are renegotiable and must be exchanged in
                        person. Transactions do not run through CircularBuild.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Description *
                  </span>
                  <textarea
                    className="min-h-[140px] rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Details, dimensions, condition, pickup instructions…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Upload photos (optional)
                  </span>
                  <input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-emerald-400"
                    onChange={(e) => setFiles(e.target.files)}
                  />
                  <span className="text-xs text-emerald-100/70">
                    JPG or PNG up to 10MB each. Clear, well-lit photos
                    accelerate matches.
                  </span>
                </label>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 shadow-inner">
                <p className="text-sm text-emerald-100/85">
                  Confirm the information below so builders can proceed with
                  confidence.
                </p>
                <label className="flex items-start gap-3 text-sm text-emerald-100/85">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-white/40 bg-white/20 text-emerald-500 focus:ring-emerald-400"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span>
                    I agree to the CircularBuild{" "}
                    <Link
                      href="/terms"
                      className="text-emerald-200 underline underline-offset-4 hover:text-emerald-100"
                    >
                      Terms &amp; Conditions
                    </Link>
                    , confirm the listing is accurate, and understand donations
                    are made in good faith.
                  </span>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Digital signature *
                  </span>
                  <input
                    className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </label>
                <label className="flex items-start gap-3 text-sm text-emerald-100/85">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-white/40 bg-white/20 text-emerald-500 focus:ring-emerald-400"
                    checked={consentContact}
                    onChange={(e) => setConsentContact(e.target.checked)}
                  />
                  <span>
                    I consent to be contacted by verified CircularBuild users.
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                {msg && (
                  <span
                    className={`text-sm ${
                      isErrorMessage ? "text-rose-200" : "text-emerald-200"
                    }`}
                  >
                    {msg}
                  </span>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-500 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Publishing…" : "Publish donation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
