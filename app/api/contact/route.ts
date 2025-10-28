// @ts-nocheck
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

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
    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const subject = String(
      formData.get("subject") ?? "CircularBuild contact form",
    ).trim();

    if (!body) {
      return NextResponse.json(
        { error: "Message body is required." },
        { status: 400 },
      );
    }

    const attachments = formData
      .getAll("attachments")
      .filter((item): item is File => item instanceof File);

    let supabase = null;
    try {
      supabase = getSupabaseAdminClient();
    } catch (error) {
      console.warn("Supabase admin client not configured", error);
    }

    const storedFiles: Array<{ filename: string; url: string }> = [];

    if (attachments.length && supabase) {
      for (const file of attachments) {
        const safeName = file.name.replace(/[^\w.-]/g, "_");
        const key = `contact/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("contact-uploads")
          .upload(key, file, { upsert: false });
        if (uploadError) {
          console.error("Failed to upload attachment", uploadError);
          continue;
        }
        const { data } = supabase.storage
          .from("contact-uploads")
          .getPublicUrl(key);
        storedFiles.push({ filename: file.name, url: data.publicUrl });
      }
    }

    const transporter = getTransport();
    if (transporter) {
      const to = process.env.CONTACT_EMAIL ?? "contact@circularbuild.org";
      const from =
        process.env.SMTP_FROM ?? "CircularBuild <no-reply@circularbuild.org>";
      const attachmentLines = storedFiles
        .map((file) => `• ${file.filename}: ${file.url}`)
        .join("\n");
      const textBody = `From: ${name || "CircularBuild user"} (${email || "no email provided"})\n\n${body}${
        attachmentLines ? `\n\nUploaded files:\n${attachmentLines}` : ""
      }`;

      await transporter.sendMail({
        to,
        from,
        subject,
        text: textBody,
      });
    }

    if (supabase) {
      const { error: insertError } = await supabase
        .from("contact_messages")
        .insert({
          name: name || null,
          email: email || null,
          subject,
          body,
          attachments: storedFiles,
          stored: Boolean(storedFiles.length),
        });
      if (insertError) {
        console.error("Failed to log contact message", insertError);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Contact form failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
