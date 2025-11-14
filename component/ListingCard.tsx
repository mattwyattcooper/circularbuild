"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type ListingCardData = {
  id: string;
  title: string;
  image: string;
  tags?: string[];
  location?: string;
  availableLabel?: string;
  weightLbs?: number | null;
  co2eKg?: number | null;
  footer?: ReactNode;
  owner?: {
    id: string;
    name?: string | null;
    avatarUrl?: string | null;
    organizationName?: string | null;
  };
};

type Props = {
  listing: ListingCardData;
};

export default function ListingCard({ listing }: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[5/3] w-full overflow-hidden">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-slate-950/20" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-white">{listing.title}</h3>
          {listing.location && (
            <p className="text-sm text-emerald-100/80">{listing.location}</p>
          )}
        </div>
        {listing.tags?.length ? (
          <div className="flex flex-wrap gap-2 text-xs text-emerald-100/90">
            {listing.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/15 px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {listing.availableLabel && (
          <p className="text-sm font-semibold text-emerald-200">
            {listing.availableLabel}
          </p>
        )}
        {listing.weightLbs && listing.weightLbs > 0 && (
          <p className="text-xs text-emerald-100/80">
            ≈ {listing.weightLbs.toLocaleString()} lbs
            {typeof listing.co2eKg === "number" && listing.co2eKg > 0
              ? ` • ${listing.co2eKg.toFixed(1)} kg CO₂e`
              : ""}
          </p>
        )}
        <div className="mt-auto space-y-4">
          {listing.owner && (
            <Link
              href={`/profile/${listing.owner.id}`}
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition hover:border-white/40 hover:bg-white/15"
            >
              <div className="h-9 w-9 overflow-hidden rounded-full border border-white/30 bg-white/20">
                {listing.owner.avatarUrl ? (
                  <Image
                    src={listing.owner.avatarUrl}
                    alt={listing.owner.name ?? "User avatar"}
                    width={36}
                    height={36}
                    className="h-9 w-9 object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-emerald-200">
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
                <span className="font-medium">
                  {listing.owner.name ?? "CircularBuild member"}
                </span>
                {listing.owner.organizationName && (
                  <span className="text-xs text-emerald-100/80">
                    {listing.owner.organizationName}
                  </span>
                )}
              </div>
            </Link>
          )}
          <div>
            {listing.footer ? (
              listing.footer
            ) : (
              <Link
                href={`/listing/${listing.id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition hover:text-emerald-100"
              >
                View details
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
