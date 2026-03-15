import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    await prisma.member.upsert({
      where: { clerkId: id },
      update: {
        email: primaryEmail,
        firstName: first_name || "",
        lastName: last_name || "",
        imageUrl: image_url || null,
      },
      create: {
        clerkId: id,
        email: primaryEmail,
        firstName: first_name || "",
        lastName: last_name || "",
        imageUrl: image_url || null,
      },
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    await prisma.member.updateMany({
      where: { clerkId: id },
      data: {
        email: primaryEmail,
        firstName: first_name || "",
        lastName: last_name || "",
        imageUrl: image_url || null,
      },
    });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await prisma.member.deleteMany({ where: { clerkId: id } });
    }
  }

  return NextResponse.json({ received: true });
}
