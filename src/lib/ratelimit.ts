import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only initialise if env vars are present (skips in local dev without Upstash)
function makeRatelimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// 10 vote attempts per IP per hour — a real member only needs 1
export const voteRatelimit = makeRatelimiter(10, "1 h");

// 5 access requests per IP per hour — prevents spam applications
export const accessRequestRatelimit = makeRatelimiter(5, "1 h");

// 20 email checks per IP per hour — prevents member email enumeration
export const checkEmailRatelimit = makeRatelimiter(20, "1 h");

/**
 * Returns the requester's IP from Next.js request headers.
 * Falls back to "anonymous" if not available (e.g. local dev).
 */
export function getIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "anonymous";
}
