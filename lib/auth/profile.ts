// @ts-nocheck
import type { Account, User } from "next-auth";

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

function resolveProfileId(user: User, account: Account | null): string {
  if (typeof user.id === "string" && user.id.length > 0) {
    return user.id;
  }
  if (account && typeof account.providerAccountId === "string") {
    return account.providerAccountId;
  }
  if (user.email) {
    return user.email;
  }
  throw new Error("Unable to determine profile identifier");
}

export async function upsertProfileFromAuth(
  user: User,
  account: Account | null,
) {
  const admin = getSupabaseAdminClient();

  const email = user.email ?? null;
  const id = resolveProfileId(user, account);

  await admin.from("profiles").upsert(
    {
      id,
      email,
      name: user.name ?? null,
      avatar_url: user.image ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}
