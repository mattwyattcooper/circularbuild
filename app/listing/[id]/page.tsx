"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthWall from "@/component/AuthWall";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { supabase } from "../../../lib/supabaseClient";

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
    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", params.id)
        .single();
      if (error) {
        setMsg(`Error loading listing: ${error.message}`);
      } else {
        setL(data);
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user.id;
        if (uid) {
          const { data: wish } = await supabase
            .from("wishlists")
            .select("id")
            .eq("user_id", uid)
            .eq("listing_id", params.id)
            .maybeSingle();
          setSaved(Boolean(wish));
        }
      }
      setLoading(false);
    })();
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

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{l.title}</h1>

      {l.photos && l.photos.length > 0 && (
        <Image
          src={l.photos[0]}
          alt={l.title}
          width={1024}
          height={512}
          sizes="(max-width: 768px) 100vw, 960px"
          className="mb-4 h-64 w-full rounded-lg object-cover"
        />
      )}

      <div className="text-sm text-gray-600 mb-2">
        {l.type} • {l.shape} • {l.count} pcs
      </div>
      <div className="text-xs text-gray-500 mb-4">
        Available until {l.available_until} • {l.location_text}
      </div>
      <p className="mb-4">{l.description}</p>

      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-blue-600 text-white"
        onClick={contact}
      >
        Contact lister
      </button>

      <button
        type="button"
        className={`ml-3 px-4 py-2 rounded-lg border ${
          saved
            ? "border-emerald-500 text-emerald-600"
            : "border-gray-300 text-gray-700"
        }`}
        onClick={toggleWishlist}
      >
        {saved ? "Saved to wishlist" : "Save to wishlist"}
      </button>

      {msg && <div className="mt-3 text-sm text-red-600">{msg}</div>}
    </main>
  );
}
