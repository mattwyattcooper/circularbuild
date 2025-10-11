"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AuthWall from "@/component/AuthWall";
import { cleanListingDescription } from "@/lib/cleanListingDescription";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { supabase } from "@/lib/supabaseClient";

type ListingOwner = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
} | null;

type Listing = {
  id: string;
  owner_id: string;
  title: string;
  type: string;
  shape: string;
  count: number;
  available_until: string;
  location_text: string;
  description: string;
  photos: string[] | null;
  status: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  owner?: ListingOwner;
};

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const authStatus = useRequireAuth();
  const [l, setL] = useState<Listing | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated" || !params?.id) return;
    let active = true;
    setLoading(true);
    setMsg("");
    (async () => {
      try {
        const res = await fetch(`/api/listings/${params.id}`);
        const payload = (await res.json()) as { listing?: Listing; error?: string };
        if (!res.ok || !payload.listing) {
          if (!active) return;
          setMsg(`Error loading listing: ${payload.error ?? res.statusText}`);
          setL(null);
          return;
        }
        if (!active) return;
        setL(payload.listing);

        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user.id;
        if (uid) {
          const { data: wish } = await supabase
            .from("wishlists")
            .select("id")
            .eq("user_id", uid)
            .eq("listing_id", params.id)
            .maybeSingle();
          if (!active) return;
          setSaved(Boolean(wish));
        } else {
          setSaved(false);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load listing";
        if (!active) return;
        setMsg(`Error loading listing: ${message}`);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [authStatus, params?.id]);

  async function contact() {
    setMsg("");
    try {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // redirect to sign in if not signed in
        return router.push("/auth");
      }
      if (!l) throw new Error("Listing not loaded");

      const buyer = sess.session.user.id;
      const seller = l.owner_id;
      const listingId = l.id;

      // Check if chat already exists
      const { data: existing, error: existingError } = await supabase
        .from("chats")
        .select("id")
        .eq("listing_id", listingId)
        .eq("buyer_id", buyer)
        .eq("seller_id", seller)
        .maybeSingle();

      if (existingError) throw existingError;

      let chatId = existing?.id;

      if (!chatId) {
        const { data, error: insErr } = await supabase
          .from("chats")
          .insert({ listing_id: listingId, buyer_id: buyer, seller_id: seller })
          .select("id")
          .single();
        if (insErr) throw insErr;
        chatId = data.id;
      }

      // go to the chat page
      router.push(`/chats/${chatId}`);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Error contacting lister: ${message}`);
    }
  }

  async function toggleWishlist() {
    setMsg("");
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        window.alert("Please sign in first.");
        return;
      }
      if (!l) return;
      if (saved) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", uid)
          .eq("listing_id", l.id);
        if (error) throw error;
        setSaved(false);
      } else {
        const { error } = await supabase.from("wishlists").insert({
          user_id: uid,
          listing_id: l.id,
        });
        if (error) throw error;
        setSaved(true);
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Could not update wishlist: ${message}`);
    }
  }

  if (authStatus === "checking") {
    return <main className="p-6">Checking authentication…</main>;
  }

  if (authStatus === "unauthenticated") {
    return <AuthWall message="Sign in to view donation details." />;
  }

  if (loading) {
    return <main className="p-6">Loading...</main>;
  }
  if (!l) {
    return <main className="p-6">Listing not found.</main>;
  }

  const owner: ListingOwner = l.owner ?? null;

  const visibleDescription = cleanListingDescription(l.description);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 text-white">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/search")}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100/90 shadow transition hover:border-white hover:text-white"
        >
          ← Back to search
        </button>
        <span className="text-xs uppercase tracking-[0.3em] text-emerald-200">
          Listing detail
        </span>
      </div>
      <section className="rounded-3xl border border-white/15 bg-white/10 px-6 py-6 shadow-lg backdrop-blur-lg">
        <h1 className="text-2xl font-bold text-white">{l.title}</h1>

        {l.photos && l.photos.length > 0 && (
          <Image
            src={l.photos[0]}
            alt={l.title}
            width={1024}
            height={512}
            sizes="(max-width: 768px) 100vw, 960px"
            className="mt-4 h-64 w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-4 text-sm text-emerald-100/90">
          {l.type} • {l.shape} • {l.count} pcs
        </div>
        <div className="text-xs text-emerald-100/70">
          Available until {l.available_until} • {l.location_text}
        </div>
        <p className="mt-4 text-sm leading-6 text-emerald-100/90">
          {visibleDescription || "No additional description provided."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400"
            onClick={contact}
          >
            Contact lister
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
              saved
                ? "border border-emerald-300/60 bg-emerald-500/10 text-emerald-200"
                : "border border-white/20 bg-white/10 text-emerald-100/80 hover:border-white hover:text-white"
            }`}
            onClick={toggleWishlist}
          >
            {saved ? "Saved to wishlist" : "Save to wishlist"}
          </button>
        </div>
      </section>

      {owner && (
        <section className="rounded-3xl border border-white/15 bg-white/10 px-6 py-6 shadow-lg backdrop-blur-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="overflow-hidden rounded-full border border-white/30 bg-white/10">
                {owner.avatar_url ? (
                  <Image
                    src={owner.avatar_url}
                    alt={owner.name ?? "Donor avatar"}
                    width={72}
                    height={72}
                    className="h-16 w-16 object-cover"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center text-xs text-emerald-100/70">
                    No photo
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-emerald-100/70">Listed by</p>
                <Link
                  href={`/profile/${owner.id}`}
                  className="text-lg font-semibold text-white underline-offset-4 hover:underline"
                >
                  {owner.name ?? "CircularBuild member"}
                </Link>
              </div>
            </div>
            <div className="max-w-xl text-sm text-emerald-100/80">
              {owner.bio ? owner.bio : "This donor hasn’t added a bio yet."}
            </div>
          </div>
        </section>
      )}

      {msg && (
        <div className="rounded-3xl border border-rose-200/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-100 shadow-lg backdrop-blur-lg">
          {msg}
        </div>
      )}
    </main>
  );
}
