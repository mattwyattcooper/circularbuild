"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthWall from "@/component/AuthWall";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/lib/useRequireAuth";

type SavedListing = {
  id: string;
  listing_id: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    type: string;
    shape: string;
    status: string;
    location_text: string;
    available_until: string;
    photos: string[] | null;
  } | null;
};

export default function WishlistPage() {
  const authStatus = useRequireAuth();
  const [rows, setRows] = useState<SavedListing[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    (async () => {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("wishlists")
        .select(
          "id, listing_id, created_at, listing:listings(id, title, type, shape, status, location_text, available_until, photos)",
        )
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (error) {
        setMsg(`Could not load wishlist: ${error.message}`);
        setRows([]);
      } else {
        setRows(data as SavedListing[]);
      }
      setLoading(false);
    })();
  }, [authStatus]);

  async function remove(listingId: string) {
    setMsg("");
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", uid)
      .eq("listing_id", listingId);
    if (error) {
      setMsg(`Unable to remove: ${error.message}`);
      return;
    }
    setRows((prev) => prev.filter((row) => row.listing_id !== listingId));
  }

  if (authStatus === "checking") {
    return (
      <main className="mx-auto max-w-4xl p-6">Checking authentication…</main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <AuthWall message="Sign in to see saved materials." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold">My wishlist</h1>
        <p className="mt-2 text-sm text-gray-600">
          Bookmark materials to revisit later. We&apos;ll keep them here until
          the listing is marked procured or removed.
        </p>
      </div>

      {loading ? (
        <div>Loading saved items…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Your wishlist is empty. Switch to map or list view on the Search tab
          to add items that fit your next project.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => {
            const listing = row.listing;
            return (
              <div
                key={row.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {listing?.title ?? "Listing"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {listing?.type} • {listing?.shape}
                    </p>
                    <p className="text-xs text-gray-500">
                      Available until {listing?.available_until ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Saved {new Date(row.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-red-500"
                    onClick={() => remove(row.listing_id)}
                  >
                    Remove
                  </button>
                </div>
                {listing?.status !== "active" && (
                  <p className="mt-2 text-xs text-orange-600">
                    This listing is marked {listing?.status}. Reach out to the
                    donor to confirm availability.
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/listing/${row.listing_id}`}
                    className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    View listing
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {msg && <div className="text-sm">{msg}</div>}
    </main>
  );
}
