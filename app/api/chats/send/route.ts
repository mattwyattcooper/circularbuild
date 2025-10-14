import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const portString = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !portString || !user || !pass) return null;
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
    const { chatId, body } = (await request.json()) as {
      chatId?: string;
      body?: string;
    };

    if (!chatId || typeof chatId !== "string") {
      return NextResponse.json(
        { error: "Chat id is required." },
        { status: 400 },
      );
    }
    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return NextResponse.json(
        { error: "Message body is required." },
        { status: 400 },
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = session.user.id;

    const { data: participant } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .eq("chat_id", chatId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!participant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { data: messageData, error: insertError } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        sender_id: userId,
        body: body.trim(),
      })
      .select("id, chat_id, sender_id, body, created_at")
      .single();

    if (insertError || !messageData) {
      const message = insertError?.message ?? "Unable to send message.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceUrl && serviceRoleKey) {
      const adminClient = createClient(serviceUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: chatInfo } = await adminClient
        .from("chats")
        .select(
          "id, listing:listings(title), buyer:profiles!chats_buyer_id_fkey(id,name,email), seller:profiles!chats_seller_id_fkey(id,name,email)"
        )
        .eq("id", chatId)
        .maybeSingle();

      if (chatInfo) {
        const recipients = [chatInfo.buyer, chatInfo.seller]
          .filter(
            (
              recipient,
            ): recipient is { id: string; name: string | null; email: string | null } =>
              Boolean(recipient && recipient.email && recipient.id !== userId),
          )
          .map((recipient) => ({
            email: recipient.email as string,
            name: recipient.name ?? "CircularBuild member",
          }));

        if (recipients.length > 0) {
          const transporter = getTransport();
          if (transporter) {
            const senderName =
              (session.user.user_metadata?.full_name as string | undefined) ??
              "A CircularBuild member";
            const listingTitle = chatInfo.listing?.title ?? "a listing";
            const linkBase =
              process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
              request.headers.get("origin") ||
              "https://www.circularbuild.org";
            const chatLink = `${linkBase}/chats/${chatId}`;

           await Promise.all(
             recipients.map(async ({ email, name }) => {
               try {
                  const textBody = `Hi ${name},\n\n${senderName} just sent you a message about "${listingTitle}".\n\nOpen the chat to reply: ${chatLink}\n\n– CircularBuild`;
                  const htmlBody = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
                      <p>Hi ${name},</p>
                      <p><strong>${senderName}</strong> just sent you a message about <em>${listingTitle}</em>.</p>
                      <p style="margin: 20px 0;">
                        <a href="${chatLink}" style="display: inline-block; padding: 12px 24px; background: #047857; color: #fff; border-radius: 9999px; text-decoration: none;">Open chat</a>
                      </p>
                      <p>Log in to CircularBuild to keep the conversation going.</p>
                      <p style="margin-top: 32px; font-size: 12px; color: #475569;">
                        If you weren’t expecting this message, contact support at <a href="mailto:contact@circularbuild.org">contact@circularbuild.org</a>.
                      </p>
                    </div>
                  `;

                  await transporter.sendMail({
                    from:
                      process.env.SMTP_FROM ?? "CircularBuild <no-reply@circularbuild.org>",
                    to: email,
                    subject: `New message about ${listingTitle}`,
                    text: textBody,
                    html: htmlBody,
                  });
                } catch (emailError) {
                  console.error("Failed to send chat email", emailError);
                }
              }),
            );
          }
        }
      }
    }

    return NextResponse.json({ message: messageData });
  } catch (error) {
    console.error("Send message failed", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error sending message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
