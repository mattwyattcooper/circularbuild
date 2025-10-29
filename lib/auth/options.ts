import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { upsertProfileFromAuth } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

const sessionCallback: NonNullable<AuthOptions["callbacks"]>["session"] =
  async ({ session, token }) => {
    if (session.user) {
      const userId = (token as unknown as { userId?: string }).userId;
      session.user.id = userId ?? token.sub ?? session.user.id ?? null;
    }
    return session;
  };

const signInCallback: NonNullable<AuthOptions["callbacks"]>["signIn"] = async ({
  user,
  account,
}) => {
  try {
    const admin = getSupabaseAdminClient();
    const email = user.email?.toLowerCase() ?? null;

    let resolvedId: string | null =
      (account as unknown as { resolvedUserId?: string })?.resolvedUserId ??
      (user as unknown as { resolvedUserId?: string })?.resolvedUserId ??
      null;

    if (!resolvedId && email) {
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .ilike("email", email)
        .maybeSingle();
      if (existing?.id) {
        resolvedId = existing.id;
      }
    }

    if (!resolvedId && email) {
      const { data: adminUsers, error: adminLookupError } =
        await admin.auth.admin.listUsers();
      if (!adminLookupError) {
        const matchingUser = adminUsers.users?.find(
          (candidate) => candidate.email?.toLowerCase() === email,
        );
        if (matchingUser?.id) {
          resolvedId = matchingUser.id;
        }
      }
    }

    if (!resolvedId) {
      resolvedId = randomUUID();
    }

    await upsertProfileFromAuth(user, resolvedId);

    (user as unknown as { id?: string | null }).id = resolvedId;

    if (account) {
      (account as unknown as { resolvedUserId?: string }).resolvedUserId =
        resolvedId;
    }
    (user as unknown as { resolvedUserId?: string }).resolvedUserId =
      resolvedId;
  } catch (error) {
    console.error("Failed to sync profile", error);
    return false;
  }
  return true;
};

const jwtCallback: NonNullable<AuthOptions["callbacks"]>["jwt"] = async ({
  token,
  account,
  user,
}) => {
  const resolvedId =
    (account as unknown as { resolvedUserId?: string })?.resolvedUserId ??
    (user as unknown as { resolvedUserId?: string })?.resolvedUserId ??
    (token as unknown as { userId?: string }).userId ??
    token.sub;

  if (resolvedId) {
    token.sub = resolvedId;
    (token as unknown as { userId?: string }).userId = resolvedId;
  }

  return token;
};

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  throw new Error("Missing Google OAuth environment variables");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase credentials for auth");
}

const createSupabaseAuthClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;
        if (!email || !password) {
          throw new Error("Email and password are required.");
        }

        const supabase = createSupabaseAuthClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          throw new Error(error?.message ?? "Invalid email or password.");
        }

        const user = {
          id: data.user.id,
          email: data.user.email ?? email,
          name:
            (data.user.user_metadata?.full_name as string | undefined) ?? null,
        };

        (user as unknown as { resolvedUserId?: string }).resolvedUserId =
          data.user.id;

        return user;
      },
    }),
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
    jwt: jwtCallback,
  },
};
