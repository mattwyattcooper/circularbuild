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
  available?: string;
  footer?: ReactNode;
};

type Props = {
  listing: ListingCardData;
};

export default function ListingCard({ listing }: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
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
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {listing.available && (
          <p className="text-sm font-medium text-emerald-600">
            {listing.available}
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
              View listing
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
