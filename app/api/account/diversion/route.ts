// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { summarizeListingMaterials } from "@/lib/diversion";
import { getOrganizationBySlug } from "@/lib/organizations";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type ListingRow = {
  count?: number | null;
  approximate_weight_lbs?: number | null;
  type?: string | null;
  materials?: unknown;
};

type Metrics = {
  pounds: number;
  co2Kg: number;
  listings: number;
};

function reduceMetrics(rows: ListingRow[] | null | undefined): Metrics {
  const safeRows = rows ?? [];
  const totals = safeRows.reduce<Metrics>(
    (acc, row) => {
      const summary = summarizeListingMaterials(row);
      if (summary.totalWeight > 0) {
        acc.pounds += summary.totalWeight;
        acc.co2Kg += summary.totalCo2;
      }
      return acc;
    },
    { pounds: 0, co2Kg: 0, listings: safeRows.length },
  );
  totals.co2Kg = Number(totals.co2Kg.toFixed(2));
  totals.pounds = Number(totals.pounds.toFixed(2));
  return totals;
}

function combineMetrics(a: Metrics, b: Metrics): Metrics {
  return {
    pounds: Number((a.pounds + b.pounds).toFixed(2)),
    co2Kg: Number((a.co2Kg + b.co2Kg).toFixed(2)),
    listings: a.listings + b.listings,
  };
}

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdminClient();

    const [{ data: profile }] = await Promise.all([
      supabase
        .from("profiles")
        .select("organization_slug")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    const { data: donatedRows } = await supabase
      .from("listings")
      .select("count,approximate_weight_lbs,type,id,materials")
      .eq("owner_id", user.id)
      .eq("status", "procured");
    const donatedMetrics = reduceMetrics(donatedRows);

    const { data: buyerChats } = await supabase
      .from("chats")
      .select("listing_id")
      .eq("buyer_id", user.id);

    let acceptedRows: ListingRow[] = [];
    if (buyerChats?.length) {
      const listingIds = Array.from(
        new Set(
          buyerChats
            .map((row) => row.listing_id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      if (listingIds.length) {
        const { data } = await supabase
          .from("listings")
          .select("id,count,approximate_weight_lbs,type,materials")
          .in("id", listingIds)
          .eq("status", "procured");
        acceptedRows = data ?? [];
      }
    }
    const acceptedMetrics = reduceMetrics(acceptedRows);

    let organization: null | {
      slug: string;
      name: string;
      memberCount: number;
      pounds: number;
      co2Kg: number;
      listings: number;
    } = null;

    const orgSlug = profile?.organization_slug ?? null;
    if (orgSlug) {
      const { data: memberRows } = await supabase
        .from("profiles")
        .select("id")
        .eq("organization_slug", orgSlug);
      const memberIds = (memberRows ?? [])
        .map((row) => row.id)
        .filter((id): id is string => Boolean(id));

      if (memberIds.length) {
        const [{ data: orgDonatedRows }, { data: orgBuyerChats }] =
          await Promise.all([
            supabase
              .from("listings")
              .select("id,count,approximate_weight_lbs,type,materials")
              .in("owner_id", memberIds)
              .eq("status", "procured"),
            supabase
              .from("chats")
              .select("listing_id,buyer_id")
              .in("buyer_id", memberIds),
          ]);

        let orgAcceptedRows: ListingRow[] = [];
        if (orgBuyerChats?.length) {
          const orgListingIds = Array.from(
            new Set(
              orgBuyerChats
                .map((row) => row.listing_id)
                .filter((id): id is string => Boolean(id)),
            ),
          );
          if (orgListingIds.length) {
            const { data } = await supabase
              .from("listings")
              .select("id,count,approximate_weight_lbs,type,materials")
              .in("id", orgListingIds)
              .eq("status", "procured");
            orgAcceptedRows = data ?? [];
          }
        }

        const orgDonatedMetrics = reduceMetrics(orgDonatedRows);
        const orgAcceptedMetrics = reduceMetrics(orgAcceptedRows);
        const orgTotals = combineMetrics(orgDonatedMetrics, orgAcceptedMetrics);
        const orgMeta = getOrganizationBySlug(orgSlug);

        organization = {
          slug: orgSlug,
          name: orgMeta?.name ?? orgSlug,
          memberCount: memberIds.length,
          pounds: Number(orgTotals.pounds.toFixed(2)),
          co2Kg: orgTotals.co2Kg,
          listings: orgTotals.listings,
        };
      }
    }

    const personalTotals = combineMetrics(donatedMetrics, acceptedMetrics);

    return NextResponse.json({
      personal: {
        pounds: Number(personalTotals.pounds.toFixed(2)),
        co2Kg: personalTotals.co2Kg,
        listings: personalTotals.listings,
      },
      organization,
    });
  } catch (error) {
    console.error("Diversion stats failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to load diversion stats";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
