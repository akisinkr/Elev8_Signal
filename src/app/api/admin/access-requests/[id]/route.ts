import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendEmail } from "@/lib/sendgrid";
import { generateApprovalToken } from "@/lib/approval-token";

const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().max(500).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.accessRequest.update({
      where: { id },
      data: {
        status: data.status,
        note: data.note ?? null,
      },
    });

    // Send approval email with sign-up link
    if (data.status === "APPROVED") {
      const token = generateApprovalToken(updated.id, updated.email);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}` || "https://elev8-signal.vercel.app";
      const welcomeUrl = `${baseUrl}/welcome?token=${token}`;
      const firstName = updated.name.split(" ")[0];

      await sendEmail({
        to: updated.email,
        subject: "You're In — Welcome to Elev8",
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 16px;">
        <div style="margin-bottom: 32px;">
          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1;">Membership Approved</span>
        </div>

        <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 12px; color: #111; line-height: 1.3;">
          Welcome to the table, ${firstName}.
        </h2>

        <p style="font-size: 15px; color: #555; line-height: 1.7; margin: 0 0 24px;">
          Your application to Elev8 has been reviewed and approved. You now have access to exclusive peer insights from senior leaders who share the expertise that took them decades to build.
        </p>

        <div style="background: #fafafa; border-radius: 12px; padding: 24px; margin-bottom: 28px;">
          <p style="font-size: 13px; font-weight: 600; color: #111; margin: 0 0 12px;">As a member, you can:</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="padding: 0 0 10px 0; vertical-align: top; width: 24px; color: #6366f1; font-size: 16px;">&#x2022;</td>
              <td style="padding: 0 0 10px 8px; font-size: 14px; color: #333; line-height: 1.5;">Vote on weekly Signal questions alongside senior leaders</td>
            </tr>
            <tr>
              <td style="padding: 0 0 10px 0; vertical-align: top; width: 24px; color: #6366f1; font-size: 16px;">&#x2022;</td>
              <td style="padding: 0 0 10px 8px; font-size: 14px; color: #333; line-height: 1.5;">See how your perspective compares with peers</td>
            </tr>
            <tr>
              <td style="padding: 0; vertical-align: top; width: 24px; color: #6366f1; font-size: 16px;">&#x2022;</td>
              <td style="padding: 0 0 0 8px; font-size: 14px; color: #333; line-height: 1.5;">Access curated insights and peer commentary</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin-bottom: 40px;">
          <a href="${welcomeUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
            Create Your Account &rarr;
          </a>
        </div>

        <p style="font-size: 13px; color: #999; text-align: center; margin: 0 0 32px;">
          This link is unique to you. Do not share it.
        </p>

        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #aaa; margin: 0;">
            Elev8 — Where leaders exchange superpowers
          </p>
        </div>
      </div>
        `,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to update access request:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
