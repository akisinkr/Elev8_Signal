import { createHmac } from "crypto";

const SECRET = process.env.SIGNAL_TOKEN_SECRET || process.env.CLERK_SECRET_KEY || "elev8-approval-fallback";

export function generateApprovalToken(requestId: string, email: string): string {
  const payload = `${requestId}:${email}`;
  const hmac = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

export function verifyApprovalToken(token: string): { requestId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;

    const [requestId, email, providedHmac] = parts;
    const expectedHmac = createHmac("sha256", SECRET)
      .update(`${requestId}:${email}`)
      .digest("hex");

    if (providedHmac !== expectedHmac) return null;

    return { requestId, email };
  } catch {
    return null;
  }
}
