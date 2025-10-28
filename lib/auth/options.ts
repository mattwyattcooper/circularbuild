import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { upsertProfileFromAuth } from "@/lib/auth/profile";

const sessionCallback: NonNullable<AuthOptions["callbacks"]>["session"] =
  async ({ session, token }) => {
    if (session.user) {
      session.user.id = token.sub ?? session.user.id;
    }
    return session;
  };

const signInCallback: NonNullable<AuthOptions["callbacks"]>["signIn"] = async ({
  user,
  account,
}) => {
  try {
    await upsertProfileFromAuth(user, account ?? null);
  } catch (error) {
    console.error("Failed to sync profile", error);
    return false;
  }
  return true;
};

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  throw new Error("Missing Google OAuth environment variables");
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    session: sessionCallback,
    signIn: signInCallback,
  },
};
