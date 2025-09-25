"use client";

import { useCallback, useEffect, useState } from "react";
import AuthWall from "@/component/AuthWall";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/lib/useRequireAuth";

type ListingRow = {
  id: string;
  title: string;
  type: string;
  shape: string;
  count: number;
  available_until: string;
  status: string;
  updated_at: string;
  description: string | null;
};

type EditDraft = {
  available_until: string;
  count: number;
  description: string;
};

export default function MyListingsPage() {
  const authStatus = useRequireAuth();
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft>({
    available_until: "",
    count: 1,
    description: "",
  });

  const loadListings = useCallback(async () => {
    setLoading(true);
    setMsg("");
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,title,type,shape,count,available_until,status,updated_at,description",
      )
      .eq("owner_id", uid)
      .order("updated_at", { ascending: false });
    if (error) {
      setMsg(`Failed to load listings: ${error.message}`);
      setRows([]);
    } else {
      setRows(data as ListingRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    void loadListings();
  }, [authStatus, loadListings]);

  function beginEdit(row: ListingRow) {
    setEditing(row.id);
    setDraft({
      available_until: row.available_until,
      count: row.count,
      description: row.description ?? "",
    });
  }

  async function saveEdit(id: string) {
    setMsg("");
    try {
      const { error } = await supabase
        .from("listings")
        .update({
          available_until: draft.available_until,
          count: draft.count,
          description: draft.description,
        })
        .eq("id", id);
      if (error) throw error;
      setEditing(null);
      await loadListings();
      setMsg("Listing updated.");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Update failed: ${message}`);
    }
  }

  async function updateStatus(id: string, status: string) {
    setMsg("");
    try {
      if (status === "procured") {
        const confirmed = window.confirm(
          "Marking this item as procured will close any active chats. Continue?",
        );
        if (!confirmed) return;
      }
      if (status === "removed") {
        const confirmed = window.confirm(
          "Removing this listing hides it from search and closes chats with interested builders. Are you sure?",
        );
        if (!confirmed) return;
      }
      const { error } = await supabase
        .from("listings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      await supabase
        .from("chats")
        .update({ is_active: status === "active" })
        .eq("listing_id", id);
      await loadListings();
      setMsg(
        status === "procured"
          ? "Listing marked as procured."
          : "Listing removed.",
      );
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";
      setMsg(`Could not update status: ${message}`);
    }
  }

  if (authStatus === "checking") {
    return (
      <main className="mx-auto max-w-4xl p-6">Checking authentication…</main>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <AuthWall message="Sign in to manage your listings." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 text-gray-900">
      <div>
        <h1 className="text-2xl font-bold">My listings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review active and archived donations. Mark them as procured once a
          pickup is complete—this automatically closes chats so recipients know
          the item is no longer available.
        </p>
      </div>

      {loading ? (
        <div>Loading your listings…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
          You don&apos;t have any listings yet. Head to the Donate tab to share
          surplus material.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const isEditing = editing === row.id;
            return (
              <div
                key={row.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{row.title}</h2>
                    <p className="text-xs text-gray-500">
                      {row.type} • {row.shape} • {row.count} pcs
                    </p>
                    <p className="text-xs text-gray-500">
                      Status:{" "}
                      <span className="font-medium uppercase">
                        {row.status}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Updated {new Date(row.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {row.status !== "procured" && (
                      <button
                        type="button"
                        className="rounded-lg border border-emerald-500 px-3 py-1 text-emerald-600"
                        onClick={() => updateStatus(row.id, "procured")}
                      >
                        Mark procured
                      </button>
                    )}
                    {row.status !== "removed" && (
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 px-3 py-1 text-red-500"
                        onClick={() => updateStatus(row.id, "removed")}
                      >
                        Remove listing
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 px-3 py-1"
                      onClick={() =>
                        isEditing ? setEditing(null) : beginEdit(row)
                      }
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className="font-medium">Available until</span>
                      <input
                        type="date"
                        className="rounded-lg border px-3 py-2"
                        value={draft.available_until}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            available_until: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="font-medium">Count</span>
                      <input
                        type="number"
                        min={1}
                        className="rounded-lg border px-3 py-2"
                        value={draft.count}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            count: Number(e.target.value) || 1,
                          }))
                        }
                      />
                    </label>
                    <label className="md:col-span-2 flex flex-col gap-1">
                      <span className="font-medium">Description</span>
                      <textarea
                        className="min-h-[120px] rounded-lg border px-3 py-2"
                        value={draft.description}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-4 py-2"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
                        onClick={() => saveEdit(row.id)}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {msg && <div className="text-sm">{msg}</div>}
    </main>
  );
}
