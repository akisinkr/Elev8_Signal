import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

function getVaultSecret(): string {
  const s = process.env.VAULT_PASSWORD;
  if (!s) throw new Error("Missing VAULT_PASSWORD env var");
  return s;
}

function generateVaultToken(): string {
  const secret = getVaultSecret();
  const payload = `vault:${Date.now()}`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

export function verifyVaultToken(token: string): boolean {
  try {
    const secret = getVaultSecret();
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;

    const [prefix, timestamp, providedHmac] = parts;
    const payload = `${prefix}:${timestamp}`;
    const expectedHmac = createHmac("sha256", secret).update(payload).digest("hex");

    if (providedHmac !== expectedHmac) return false;

    // Check token age — max 7 days
    const age = Date.now() - parseInt(timestamp, 10);
    if (isNaN(age) || age > 7 * 24 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === process.env.VAULT_PASSWORD) {
    const token = generateVaultToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set("elev8-vault-auth", token, {
      httpOnly: false, // Client-side needs to detect presence for routing
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/vault",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  return NextResponse.json(
    { success: false, error: "Invalid password" },
    { status: 401 }
  );
}
