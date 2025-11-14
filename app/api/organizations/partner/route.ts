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
    const body = (await request.json()) as {
      name?: string;
      website?: string;
      email?: string;
      blurb?: string;
      size?: string;
      goal?: string;
      goalMetric?: "lbs" | "kg";
    };

    const name = body.name?.trim();
    const website = body.website?.trim();
    const email = body.email?.trim();
    const blurb = body.blurb?.trim();
    const size = body.size?.trim() || "";
    const goal = body.goal?.trim();
    const goalMetric = body.goalMetric === "kg" ? "kg" : "lbs";

    if (!name || !email || !blurb || !goal) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (blurb.length > 100) {
      return NextResponse.json(
        { error: "Blurb must be 100 characters or fewer." },
        { status: 400 },
      );
    }

    const transporter = getTransport();
    if (!transporter) {
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 },
      );
    }

    const to = "mattwyattcooper@gmail.com";
    const from =
      process.env.SMTP_FROM ?? "CircularBuild <no-reply@circularbuild.org>";

    const lines = [
      `Organization: ${name}`,
      `Contact: ${email}`,
      `Website: ${website || "(not provided)"}`,
      `Size: ${size || "(not provided)"}`,
      `Goal: ${goal} ${goalMetric}`,
      `Blurb: ${blurb}`,
    ];

    await transporter.sendMail({
      to,
      from,
      subject: `New organization partner inquiry: ${name}`,
      text: lines.join("\n"),
    });

    return NextResponse.json({ message: "Application submitted." });
  } catch (error) {
    console.error("Org intake failed", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
