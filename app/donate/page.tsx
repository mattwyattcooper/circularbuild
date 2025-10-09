"use client";

import { useState } from "react";
import AuthWall from "@/component/AuthWall";
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

  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-900">
      {authStatus === "checking" && <div>Checking authentication…</div>}
      {authStatus === "unauthenticated" && (
        <AuthWall
          title="Sign in required"
          message="Sign in to donate materials through CircularBuild."
          nextPath="/donate"
        />
      )}
      {authStatus === "authenticated" && (
        <>
          <h1 className="mb-4 text-3xl font-semibold text-emerald-700">
            Donate an item
          </h1>
          <p className="mb-6 max-w-2xl text-sm text-gray-600">
            Share surplus material so it can find a second life instead of
            heading to landfill. Provide accurate details, photos, and
            availability to help builders plan pickups.
          </p>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-emerald-100 bg-white p-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Title *</span>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="e.g., 2x4 offcuts bundle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Material type *</span>
              <select
                className="rounded-lg border px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {MATERIALS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Shape *</span>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder={`e.g., 2x4, 1" pipe`}
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Number of pieces *</span>
              <input
                type="number"
                min={1}
                max={9999}
                className="rounded-lg border px-3 py-2"
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
              <span className="text-xs text-gray-500">
                Use the best estimate if you are unsure.
              </span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Available until *</span>
              <input
                type="date"
                className="rounded-lg border px-3 py-2"
                value={available}
                onChange={(e) => setAvailable(e.target.value)}
                min={todayISO()}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Location (address or ZIP) *
              </span>
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="ZIP or full address"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium">Description *</span>
              <textarea
                className="min-h-[120px] w-full rounded-lg border px-3 py-2"
                placeholder="Details, dimensions, condition, pickup instructions…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm font-medium">Photos</span>
              <input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(e.target.files)}
              />
              <span className="text-xs text-gray-500">
                Upload clear photos of every bundle or piece being offered.
              </span>
            </label>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-white p-4 text-sm">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>
                  I agree to CircularBuild&apos;s{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-900"
                  >
                    Terms &amp; Conditions
                  </a>{" "}
                  and confirm that the material is free to donate.
                </span>
              </label>
              <label className="mt-4 block">
                <span className="font-medium">
                  Signature (type your full name) *
                </span>
                <input
                  className="mt-2 w-full rounded-lg border px-3 py-2"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </label>
              <label className="mt-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={consentContact}
                  onChange={(e) => setConsentContact(e.target.checked)}
                />
                <span>
                  I consent to be contacted by verified CircularBuild users.
                </span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? "Publishing…" : "Publish"}
              </button>
            </div>

            {msg && <div className="mt-3 text-sm">{msg}</div>}
          </div>
        </>
      )}
    </main>
  );
}
