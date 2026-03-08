import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/sendgrid";

export async function POST() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const members = await prisma.member.findMany({
      where: { role: "MEMBER" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        company: true,
        jobTitle: true,
        cardCompletedAt: true,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `https://${process.env.VERCEL_URL}` ||
      "https://elev8-signal.com";

    const cardUrl = `${baseUrl}/profile`;
    const subject = "Your Elev8 Member Card is ready — complete it in 2 minutes";

    let sent = 0;
    let skipped = 0;
    const errors: { email: string; reason: string }[] = [];

    for (const member of members) {
      // Skip members who already completed their card
      if (member.cardCompletedAt) {
        skipped++;
        continue;
      }

      try {
        const initials = `${member.firstName[0] || ""}${member.lastName[0] || ""}`;
        const displayTitle = [member.jobTitle, member.company]
          .filter(Boolean)
          .join(" · ");

        const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 16px; color: #111;">

  <div style="margin-bottom: 32px;">
    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1;">Elev8 Member Card</span>
  </div>

  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px; color: #333;">
    ${member.firstName}님,
  </p>

  <p style="font-size: 15px; line-height: 1.7; margin: 0 0 24px; color: #333;">
    Your Elev8 Member Card is ready. We've pre-filled it with what we know — complete it by adding three things that will help us connect you with the right peers.
  </p>

  <!-- Card Preview -->
  <div style="background: #0d0d1a; border-radius: 16px; overflow: hidden; margin-bottom: 28px; border: 1px solid rgba(255,255,255,0.08);">
    <!-- Header band -->
    <div style="padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
      <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #6366f1;">Elev8 Member</span>
    </div>

    <!-- Profile -->
    <div style="padding: 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align: top; padding-right: 16px;">
            ${
              member.imageUrl
                ? `<img src="${member.imageUrl}" alt="${member.firstName}" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(99,102,241,0.3); object-fit: cover;" />`
                : `<div style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.15); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #6366f1; text-align: center; line-height: 56px;">${initials}</div>`
            }
          </td>
          <td style="vertical-align: top;">
            <div style="font-size: 18px; font-weight: 700; color: #f0f0f5; line-height: 1.3;">
              ${member.firstName} ${member.lastName}
            </div>
            ${
              displayTitle
                ? `<div style="font-size: 13px; color: #888; margin-top: 2px;">${displayTitle}</div>`
                : ""
            }
          </td>
        </tr>
      </table>
    </div>

    <!-- Empty sections preview -->
    <div style="padding: 0 24px 20px;">
      <div style="border: 1px dashed rgba(99,102,241,0.3); border-radius: 10px; padding: 16px; margin-bottom: 10px;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; margin-bottom: 6px; font-weight: 600;">⚡ Superpowers</div>
        <div style="font-size: 13px; color: #666;">What are you best at?</div>
      </div>
      <div style="border: 1px dashed rgba(251,146,60,0.3); border-radius: 10px; padding: 16px; margin-bottom: 10px;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #fb923c; margin-bottom: 6px; font-weight: 600;">🎯 Challenges</div>
        <div style="font-size: 13px; color: #666;">What do you need help with?</div>
      </div>
      <div style="border: 1px dashed rgba(52,211,153,0.3); border-radius: 10px; padding: 16px;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #34d399; margin-bottom: 6px; font-weight: 600;">👥 Dream Connection</div>
        <div style="font-size: 13px; color: #666;">Who do you most want to meet?</div>
      </div>
    </div>
  </div>

  <p style="font-size: 14px; line-height: 1.7; margin: 0 0 28px; color: #555;">
    Takes about 2 minutes. This is how we'll match you with peers through Elev8 Superpower — our 1:1 peer matching system launching soon.
  </p>

  <div style="text-align: center; margin-bottom: 40px;">
    <a href="${cardUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
      Complete My Card →
    </a>
  </div>

  <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
    <p style="font-size: 12px; color: #aaa; margin: 0;">
      Elev8 — Where leaders exchange superpowers
    </p>
  </div>
</div>
        `;

        await sendEmail({ to: member.email, subject, html });
        sent++;
      } catch (err: unknown) {
        const sgError = err as {
          response?: { body?: unknown };
          message?: string;
        };
        const reason = JSON.stringify(
          sgError.response?.body ?? sgError.message ?? "Unknown"
        );
        errors.push({ email: member.email, reason });
      }
    }

    return NextResponse.json({
      sent,
      skipped,
      total: members.length,
      errors,
    });
  } catch (error) {
    console.error("Failed to send card invites:", error);
    return NextResponse.json(
      { error: "Failed to send invitations" },
      { status: 500 }
    );
  }
}
