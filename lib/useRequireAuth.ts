"use client";

import { useSession } from "next-auth/react";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export function useRequireAuth(): AuthStatus {
  const { status } = useSession();
  if (status === "loading") return "checking";
  return status;
}
