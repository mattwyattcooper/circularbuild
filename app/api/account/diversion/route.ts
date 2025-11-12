// @ts-nocheck
import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/session";
import { getOrganizationBySlug } from "@/lib/organizations";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

type ListingRow = { count?: number | null };

function sumUnits(rows: ListingRow[] | null | undefined) {
  return (rows ?? []).reduce((total, row) => {
    const value = Number(row.count);
    if (Number.isFinite(value) && value > 0) {
      return total + value;
    }
    return total + 1;
  }, 0);
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
      .select("count,id")
      .eq("owner_id", user.id)
      .eq("status", "procured");

    const donatedUnits = sumUnits(donatedRows);
    const donatedListings = donatedRows?.length ?? 0;

    const { data: buyerChats } = await supabase
      .from("chats")
      .select("listing_id")
      .eq("buyer_id", user.id);

    let acceptedUnits = 0;
    let acceptedListings = 0;
    if (buyerChats?.length) {
      const listingIds = Array.from(
        new Set(
          buyerChats
            .map((row) => row.listing_id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      if (listingIds.length) {
        const { data: acceptedRows } = await supabase
          .from("listings")
          .select("id,count")
          .in("id", listingIds)
          .eq("status", "procured");
        acceptedUnits = sumUnits(acceptedRows);
        acceptedListings = acceptedRows?.length ?? 0;
      }
    }

    let organization: null | {
      slug: string;
      name: string;
      memberCount: number;
      donated: { units: number; listings: number };
      accepted: { units: number; listings: number };
      totalUnits: number;
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
              .select("id,count")
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
              .select("id,count")
              .in("id", orgListingIds)
              .eq("status", "procured");
            orgAcceptedRows = data ?? [];
          }
        }

        const orgDonatedUnits = sumUnits(orgDonatedRows);
        const orgAcceptedUnits = sumUnits(orgAcceptedRows);
        const orgMeta = getOrganizationBySlug(orgSlug);

        organization = {
          slug: orgSlug,
          name: orgMeta?.name ?? orgSlug,
          memberCount: memberIds.length,
          donated: {
            units: orgDonatedUnits,
            listings: orgDonatedRows?.length ?? 0,
          },
          accepted: {
            units: orgAcceptedUnits,
            listings: orgAcceptedRows.length,
          },
          totalUnits: orgDonatedUnits + orgAcceptedUnits,
        };
      }
    }

    return NextResponse.json({
      personal: {
        donated: { units: donatedUnits, listings: donatedListings },
        accepted: { units: acceptedUnits, listings: acceptedListings },
        totalUnits: donatedUnits + acceptedUnits,
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
