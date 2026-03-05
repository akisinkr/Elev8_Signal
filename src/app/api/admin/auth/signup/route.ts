import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, hashPassword } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A member with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const member = await prisma.member.create({
      data: {
        clerkId: `admin_${Date.now()}`,
        email,
        firstName,
        lastName,
        passwordHash,
        role: "ADMIN",
        onboardingState: "COMPLETED",
      },
    });

    return NextResponse.json(
      { success: true, memberId: member.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
