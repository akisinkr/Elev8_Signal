import { NextRequest } from "next/server";

const CLERK_FAPI_ORIGIN = "https://frontend-api.clerk.services";
const CLERK_HOST = "clerk.elev8-signal.com";

async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const clerkPath = url.pathname.replace(/^\/api\/clerk-proxy/, "");
  const target = `${CLERK_FAPI_ORIGIN}${clerkPath}${url.search}`;

  const headers = new Headers();
  for (const [key, value] of req.headers.entries()) {
    if (
      !["host", "connection", "keep-alive", "transfer-encoding"].includes(
        key.toLowerCase()
      )
    ) {
      headers.set(key, value);
    }
  }
  headers.set("Host", CLERK_HOST);
  headers.set("X-Forwarded-Host", CLERK_HOST);

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      // @ts-expect-error duplex needed for streaming body
      duplex: "half",
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("connection");

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("Clerk proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Proxy failed", detail: String(err) }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;

export const runtime = "nodejs";
