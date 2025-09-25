import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const body = String(form.get("body") ?? "").trim();

    if (!name || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const attachments = form
      .getAll("attachments")
      .filter((item) => item instanceof File) as File[];

    const uploadedFiles: string[] = [];
    if (attachments.length && supabaseAdmin) {
      for (const file of attachments) {
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Attachments must be under 10 MB." },
            { status: 400 },
          );
        }
        const safeName = file.name.replace(/[^\w.-]/g, "_");
        const key = `contact/${Date.now()}_${safeName}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabaseAdmin.storage
          .from("contact-uploads")
          .upload(key, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });
        if (uploadError) {
          return NextResponse.json(
            { error: uploadError.message },
            { status: 500 },
          );
        }
        const { data } = supabaseAdmin.storage
          .from("contact-uploads")
          .getPublicUrl(key);
        uploadedFiles.push(data.publicUrl);
      }
    }

    if (supabaseAdmin) {
      const { error: insertError } = await supabaseAdmin
        .from("contact_requests")
        .insert({
          name,
          subject,
          body,
          attachments: uploadedFiles,
        });
      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 },
        );
      }
    }

    let emailSent = false;
    let emailError: string | null = null;
    const transporter = getTransport();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `CircularBuild <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL ?? "mattwyattcooper@gmail.com",
          subject: `[CircularBuild] ${subject}`,
          text: `Name: ${name}\nSubject: ${subject}\n\n${body}\n\nAttachments:\n${uploadedFiles.join("\n") || "None"}`,
        });
        emailSent = true;
      } catch (mailError) {
        console.error("Email delivery failed", mailError);
        emailError =
          mailError instanceof Error
            ? mailError.message
            : "Email delivery failed";
      }
    } else {
      emailError = "SMTP settings are not configured";
    }

    return NextResponse.json({
      status: "ok",
      emailSent,
      stored: Boolean(supabaseAdmin),
      emailError,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Failed to submit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
