import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { accessRequestRatelimit, getIp } from "@/lib/ratelimit";
import { z } from "zod";

const accessRequestSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  linkedinUrl: z
    .string()
    .url()
    .refine((url) => url.includes("linkedin.com/"), {
      message: "Must be a LinkedIn URL",
    }),
});

export async function POST(req: Request) {
  try {
    // Rate limit: 5 access requests per IP per hour
    if (accessRequestRatelimit) {
      const { success } = await accessRequestRatelimit.limit(getIp(req));
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const data = accessRequestSchema.parse(body);

    const accessRequest = await prisma.accessRequest.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        linkedinUrl: data.linkedinUrl,
      },
    });

    return NextResponse.json({ id: accessRequest.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
