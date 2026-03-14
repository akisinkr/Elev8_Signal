import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createAdminSession } from "@/lib/admin-auth";
import { adminLoginRatelimit, getIp } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    if (adminLoginRatelimit) {
      const ip = getIp(req);
      const { success } = await adminLoginRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many login attempts. Try again later." },
          { status: 429 }
        );
      }
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { email },
    });

    if (!member || member.role !== "ADMIN" || !member.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, member.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createAdminSession(member.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
