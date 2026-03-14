import { createHmac } from "crypto";

function getSecret(): string {
  const s = process.env.SIGNAL_TOKEN_SECRET || process.env.CLERK_SECRET_KEY;
  if (!s) throw new Error("Missing SIGNAL_TOKEN_SECRET or CLERK_SECRET_KEY");
  return s;
}
const SECRET = getSecret();

export function generateSignalToken(memberId: string, signalNumber: number): string {
  const payload = `${memberId}:${signalNumber}`;
  const hmac = createHmac("sha256", SECRET).update(payload).digest("hex");
  // Encode: base64url(memberId:signalNumber:hmac)
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

export function verifySignalToken(token: string): { memberId: string; signalNumber: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;

    const [memberId, signalNumberStr, providedHmac] = parts;
    const signalNumber = parseInt(signalNumberStr, 10);
    if (isNaN(signalNumber)) return null;

    const expectedHmac = createHmac("sha256", SECRET)
      .update(`${memberId}:${signalNumber}`)
      .digest("hex");

    if (providedHmac !== expectedHmac) return null;

    return { memberId, signalNumber };
  } catch {
    return null;
  }
}
