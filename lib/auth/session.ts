import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";

type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
};

export async function requireUser(): Promise<AuthUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    throw new Error("Unauthorized");
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
  };
}

export async function getOptionalUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
  };
}
