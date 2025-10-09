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
  footer?: ReactNode;
};

type Props = {
  listing: ListingCardData;
};

export default function ListingCard({ listing }: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {listing.title}
          </h3>
          {listing.location && (
            <p className="text-sm text-slate-500">{listing.location}</p>
          )}
        </div>
        {listing.tags?.length ? (
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {listing.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-slate-100 px-2 py-1">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {listing.availableLabel && (
          <p className="text-sm font-medium text-emerald-600">
            {listing.availableLabel}
          </p>
        )}
        <div className="mt-auto">
          {listing.footer ? (
            listing.footer
          ) : (
            <Link
              href={`/listing/${listing.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              View details
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
