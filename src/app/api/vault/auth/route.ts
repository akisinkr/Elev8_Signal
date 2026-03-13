import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === process.env.VAULT_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("elev8-vault-auth", "authenticated", {
      httpOnly: true,
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
