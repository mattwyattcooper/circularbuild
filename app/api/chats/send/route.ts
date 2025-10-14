import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

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

    const { data: chatInfo } = await supabase
      .from("chats")
      .select("buyer_id, seller_id, listing:listings(title)")
      .eq("id", chatId)
      .maybeSingle();

    if (chatInfo) {
      const participantIds = [chatInfo.buyer_id, chatInfo.seller_id].filter(
        (id): id is string => Boolean(id && id !== userId),
      );

      if (participantIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id,name,email")
          .in("id", participantIds);

        if (profileError) {
          console.error("Failed to load participant profiles", profileError);
        } else {
          const listingData = Array.isArray(chatInfo.listing)
            ? (chatInfo.listing[0] ?? null)
            : (chatInfo.listing ?? null);
          const listingTitle = listingData?.title ?? "a listing";

          const recipients = (profileRows ?? [])
            .filter((row) => Boolean(row.email))
            .map((row) => ({
              email: row.email as string,
              name: row.name ?? "CircularBuild member",
            }));

          if (recipients.length > 0) {
            const transporter = getTransport();
            if (!transporter) {
              console.error(
                "Chat email skipped: SMTP credentials are not configured in the server environment.",
              );
            } else {
              const senderName =
                (session.user.user_metadata?.full_name as string | undefined) ??
                "A CircularBuild member";
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
                        process.env.SMTP_FROM ??
                        "CircularBuild <no-reply@circularbuild.org>",
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
    }

    return NextResponse.json({ message: messageData });
  } catch (error) {
    console.error("Send message failed", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error sending message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
