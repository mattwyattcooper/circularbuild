"use client";

import { type FormEvent, useState } from "react";
import AuthWall from "@/component/AuthWall";
import ParallaxSection from "@/component/ParallaxSection";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { supabase } from "../../lib/supabaseClient";

const MATERIALS = [
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

export default function DonatePage() {
  const authStatus = useRequireAuth();
  // ----- form state -----
  const [title, setTitle] = useState("");
  const [type, setType] = useState(MATERIALS[0]);
  const [shape, setShape] = useState("");
  const [count, setCount] = useState<number>(1);
  const [available, setAvailable] = useState(daysFromNowISO(14)); // default 2 weeks ahead
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [consentContact, setConsentContact] = useState(false);

  // ----- ui state -----
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setMsg("");
    setSubmitting(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) throw new Error("Please sign in first (top-right).");

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

      const photoUrls: string[] = [];
      if (files?.length) {
        for (const file of Array.from(files)) {
          const safeName = file.name.replace(/[^\w.-]/g, "_");
          const key = `u_${sess.session.user.id}/${Date.now()}_${safeName}`;
          const { error: upErr } = await supabase.storage
            .from("listing-photos")
            .upload(key, file, { upsert: false });
          if (upErr) throw upErr;

          const { data } = supabase.storage
            .from("listing-photos")
            .getPublicUrl(key);
          photoUrls.push(data.publicUrl);
        }
      }

      const piecesCount = Number.isFinite(count) && count > 0 ? count : 1;
      const detailedDescription = `${description.trim()}

---
Donor declaration: Information provided is truthful.
Signer: ${signature.trim()}
Consented to contact: ${consentContact ? "Yes" : "No"}`;

      const { error: insErr } = await supabase.from("listings").insert({
        owner_id: sess.session.user.id,
        title,
        type,
        shape,
        count: piecesCount,
        available_until: availableISO,
        location_text: locationText,
        lat,
        lng,
        description: detailedDescription,
        photos: photoUrls,
        status: "active",
      });
      if (insErr) throw insErr;

      setMsg("✅ Listing published.");
      setTitle("");
      setType(MATERIALS[0]);
      setShape("");
      setCount(1);
      setAvailable(daysFromNowISO(14));
      setLocationText("");
      setDescription("");
      setSignature("");
      setAgreed(false);
      setConsentContact(false);
      const el = document.getElementById("photos") as HTMLInputElement | null;
      if (el) el.value = "";
      setFiles(null);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setMsg(`Error: ${message}`);
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
                    Material type *
                  </span>
                  <select
                    className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {MATERIALS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
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
                    I agree to the CircularBuild terms, confirm the listing is
                    accurate, and understand donations are made in good faith.
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
