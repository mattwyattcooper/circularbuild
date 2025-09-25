"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthWall from "@/component/AuthWall";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { supabase } from "../../lib/supabaseClient";

type Chat = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  is_active: boolean;
  created_at: string;
};

type Listing = {
  id: string;
  title: string;
  photos: string[] | null;
};

export default function ChatsIndex() {
  const authStatus = useRequireAuth();
  const [rows, setRows] = useState<(Chat & { listing: Listing | null })[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id ?? null;
      if (!uid) return;

      // load chats where I'm buyer or seller
      const { data: chats, error } = await supabase
        .from("chats")
        .select("*")
        .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
        .order("created_at", { ascending: false });

      if (error) {
        setMsg(`Error: ${error.message}`);
        return;
      }

      // fetch listing titles (simple n+1 for MVP)
      const results: (Chat & { listing: Listing | null })[] = [];
      for (const c of chats ?? []) {
        const { data: l } = await supabase
          .from("listings")
          .select("id,title,photos")
          .eq("id", c.listing_id)
          .maybeSingle();
        results.push({ ...c, listing: l ?? null });
      }
      setRows(results);
    })();
  }, [authStatus]);

  if (authStatus === "checking") {
    return (
      <main className="max-w-4xl mx-auto p-6">Checking authentication…</main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <AuthWall message="Sign in to see conversations with donors." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-semibold text-emerald-700">Chats</h1>
      <p className="mt-1 mb-4 text-sm text-gray-600">
        Keep pickup logistics organized and document material transfers with a
        clear audit trail. Once a listing is marked procured, the conversation
        is archived automatically.
      </p>
      {msg && (
        <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
          {msg}
        </div>
      )}
      <div className="space-y-3">
        {rows.map((c) => (
          <Link
            key={c.id}
            href={`/chats/${c.id}`}
            className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            {/* thumb */}
            {c.listing?.photos?.[0] ? (
              <Image
                src={c.listing.photos[0]}
                alt={c.listing.title}
                width={64}
                height={64}
                sizes="64px"
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg grid place-items-center text-xs text-gray-500">
                No photo
              </div>
            )}
            {/* info */}
            <div className="flex-1">
              <div className="font-medium">{c.listing?.title ?? "Listing"}</div>
              <div className="text-xs text-gray-600">
                {new Date(c.created_at).toLocaleString()}
                {" • "}
                {c.is_active ? "Active" : "Closed"}
              </div>
            </div>
            <div className="rounded-full border border-emerald-300 px-3 py-1 text-sm text-emerald-700">
              Open
            </div>
          </Link>
        ))}
        {rows.length === 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-800">
            No chats yet. Once you reach out about a listing—or a donor contacts
            you—the conversation will appear here for easy follow-up.
          </div>
        )}
      </div>
    </main>
  );
}
