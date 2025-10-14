import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const portString = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !portString || !user || !pass) {
    return null;
  }
  const port = Number.parseInt(portString, 10);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const fullName = String(body.name ?? "").trim();
    const nextPath = typeof body.nextPath === "string" ? body.nextPath : "/";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: "Please include your full name." },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase admin credentials are not configured." },
        { status: 500 },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const userLookupResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: "no-store",
      },
    );
    let existingUser: { id: string; email?: string | null; email_confirmed_at?: string | null } | null = null;
    if (userLookupResponse.ok) {
      const payload = (await userLookupResponse.json()) as {
        users: Array<{ id: string; email?: string; email_confirmed_at?: string | null; user_metadata?: Record<string, unknown> }>;
      };
      existingUser = payload.users?.find(
        (user) => user.email?.toLowerCase() === email,
      ) ?? null;
    }

    if (existingUser?.email_confirmed_at) {
      return NextResponse.json(
        { error: "That email is already registered. Please sign in." },
        { status: 400 },
      );
    }

    let userId = existingUser?.id ?? null;

    if (!existingUser) {
      const createResponse = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name: fullName || null },
      });
      if (createResponse.error || !createResponse.data?.user) {
        const message =
          createResponse.error?.message ?? "Unable to start sign-up process.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
      userId = createResponse.data.user.id;
    } else if (userId) {
      await adminClient.auth.admin.updateUserById(userId, {
        password,
        user_metadata: { full_name: fullName || null },
      });
    }

    if (userId) {
      await adminClient
        .from("profiles")
        .upsert(
          {
            id: userId,
            name: fullName || null,
            email,
          },
          { onConflict: "id" },
        );
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      request.headers.get("origin") ??
      "https://circularbuild.org";

    const redirectSuffix =
      nextPath && nextPath !== "/"
        ? `?next=${encodeURIComponent(nextPath)}`
        : "";
    const redirectTo = `${origin}/auth/verified${redirectSuffix}`;

    const linkResponse = await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName } : undefined,
        redirectTo,
      },
    });

    if (linkResponse.error || !linkResponse.data?.properties?.action_link) {
      const message =
        linkResponse.error?.message ?? "Failed to generate verification link.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const verifyUrl = linkResponse.data.properties.action_link;
    const transporter = getTransport();
    if (!transporter) {
      return NextResponse.json(
        { error: "SMTP settings are not configured on the server." },
        { status: 500 },
      );
    }

    const fromAddress =
      process.env.SMTP_FROM ?? "CircularBuild <no-reply@circularbuild.org>";

    const subject = "Welcome to CircularBuild";
    const intro = fullName ? `Hi ${fullName.split(" ")[0]},` : "Hi there,";
    const textBody = `${intro}

Thanks for creating a CircularBuild account. We connect donors and builders to keep construction materials in circulation.

Please verify your email to activate your account:
${verifyUrl}

Once verified, you can sign in and start exploring donations, posting listings, and coordinating pickups.

– The CircularBuild Team`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <p>${intro}</p>
        <p>
          Thanks for creating a CircularBuild account. We connect donors and builders
          to keep construction materials in circulation.
        </p>
        <p>Please verify your email to activate your account:</p>
        <p style="margin: 24px 0;">
          <a
            href="${verifyUrl}"
            style="display: inline-block; padding: 12px 24px; border-radius: 9999px; background: #047857; color: #ffffff; text-decoration: none;"
          >
            Verify my email
          </a>
        </p>
        <p>
          Once verified, you can sign in and start exploring donations, posting listings,
          and coordinating pickups.
        </p>
        <p style="margin-top: 32px;">– The CircularBuild Team</p>
        <p style="margin-top: 32px; font-size: 12px; color: #475569;">
          If you didn't create this account, you can ignore this message or
          <a href="mailto:contact@circularbuild.org">contact us for help</a>.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return NextResponse.json({
      status: "ok",
      message: `Check ${email} for a verification link.`,
    });
  } catch (error) {
    console.error("Sign-up failed", error);
    const message =
      error instanceof Error ? error.message : "Unexpected sign-up error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
