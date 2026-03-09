import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.CLERK_SECRET_KEY || process.env.ADMIN_JWT_SECRET || "member-secret-change-me"
);

const COOKIE_NAME = "member-session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days
const OTP_DURATION = 60 * 10; // 10 minutes

/** Generate a 6-digit OTP and a signed token containing both the code and email */
export async function createOtp(email: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

  const token = await new SignJWT({ email: email.toLowerCase(), code })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${OTP_DURATION}s`)
    .sign(JWT_SECRET);

  return { code, token };
}

/** Verify an OTP code against the signed token */
export async function verifyOtp(token: string, code: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.code !== code) return null;
    return payload.email as string;
  } catch {
    return null; // expired or invalid
  }
}

/** Set the member session cookie */
export async function createMemberSession(memberId: string, email: string) {
  const token = await new SignJWT({ memberId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });

  return token;
}

/** Get the current member from the session cookie */
export async function getMemberSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const memberId = payload.memberId as string;
    if (!memberId) return null;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    return member;
  } catch {
    return null;
  }
}

/** Destroy the member session */
export async function destroyMemberSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
