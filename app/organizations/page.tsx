"use client";

import { useState } from "react";

const orgSizes = ["Local", "Universities", "National", "Global"];

type FormState = {
  name: string;
  website: string;
  email: string;
  blurb: string;
  size: string;
  goal: string;
  goalMetric: "lbs" | "kg";
};

const initialState: FormState = {
  name: "",
  website: "",
  email: "",
  blurb: "",
  size: orgSizes[0],
  goal: "",
  goalMetric: "lbs",
};

export default function OrganizationsPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setMsg("");
    setSubmitting(true);
    try {
      if (!form.name.trim()) throw new Error("Organization name is required.");
      if (!form.email.trim()) throw new Error("Email is required.");
      if (!form.blurb.trim()) throw new Error("Blurb is required.");
      if (form.blurb.length > 100)
        throw new Error("Blurb must be 100 characters or fewer.");
      if (!form.goal.trim()) throw new Error("Diversion goal is required.");

      const response = await fetch("/api/organizations/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to submit application");
      }
      setMsg(data.message ?? "Thanks! We'll review your application shortly.");
      setForm(initialState);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setMsg(`Error: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-col text-white">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.3),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Partner with CircularBuild
          </span>
          <h1 className="text-[clamp(2.2rem,4vw,3.6rem)] font-extrabold leading-tight">
            Join the reuse network accelerating landfill diversion.
          </h1>
          <p className="text-sm text-emerald-100/85 sm:text-base">
            Organizations that partner with CircularBuild unlock impact
            dashboards, promote mission-aligned donations, and connect their
            members to a steady supply of reclaimed materials. Submit the
            information below and our team will follow up to finalize your
            affiliation.
          </p>
        </div>
      </section>

      <section className="relative isolate w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          aria-hidden
        >
          <div className="h-full w-full bg-[radial-gradient(circle_at_bottom_right,_rgba(74,222,128,0.3),_transparent_60%)]" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <form
            className="space-y-6 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Organization name *
                </span>
                <input
                  className="rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Website
                </span>
                <input
                  className="rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  placeholder="https://example.org"
                />
              </label>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Contact email *
                </span>
                <input
                  type="email"
                  className="rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Organization size
                </span>
                <select
                  className="rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                >
                  {orgSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Short blurb (100 characters max) *
              </span>
              <input
                className="rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={form.blurb}
                onChange={(e) =>
                  setForm({ ...form, blurb: e.target.value.slice(0, 100) })
                }
                maxLength={100}
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Yearly diversion goal *
                </span>
                <input
                  type="number"
                  min={1}
                  className="rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  placeholder="e.g., 50000"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Goal metric
                </span>
                <select
                  className="rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  value={form.goalMetric}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      goalMetric: e.target.value as FormState["goalMetric"],
                    })
                  }
                >
                  <option value="lbs">Pounds diverted</option>
                  <option value="kg">CO₂e saved (kg)</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit application"}
            </button>
            {msg && (
              <p
                className={`text-sm ${msg.toLowerCase().startsWith("error") ? "text-rose-200" : "text-emerald-200"}`}
              >
                {msg}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
