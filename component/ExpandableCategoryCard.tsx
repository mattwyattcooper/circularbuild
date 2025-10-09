"use client";

import { useState } from "react";

type Props = {
  title: string;
  description: string;
};

export default function ExpandableCategoryCard({ title, description }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-3xl border border-white/30 bg-white/10 text-left shadow-lg backdrop-blur-lg transition">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="group flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white/5"
        aria-expanded={open}
      >
        <span className="text-lg sm:text-xl">{title}</span>
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-base font-semibold transition group-hover:border-white"
        >
          {open ? "−" : "+"}
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden px-6 pb-6 text-sm text-emerald-100 sm:text-base">
          <p>{description}</p>
        </div>
      </div>
    </article>
  );
}
