import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";

export async function getCurrentMember() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";

  // Try to find by clerkId first
  let member = await prisma.member.findUnique({
    where: { clerkId: user.id },
  });

  if (!member) {
    // Check if a member with this email already exists (from production Clerk)
    if (email) {
      member = await prisma.member.findUnique({
        where: { email },
      });
      if (member) {
        // Link existing member to this Clerk ID
        member = await prisma.member.update({
          where: { id: member.id },
          data: { clerkId: user.id },
        });
        return member;
      }
    }

    // Create new member
    member = await prisma.member.create({
      data: {
        clerkId: user.id,
        email: email || `${user.id}@clerk.dev`,
        firstName: firstName || "Member",
        lastName: lastName || "",
        imageUrl: user.imageUrl ?? null,
      },
    });
  }

  return member;
}

export async function requireMember() {
  // Try Clerk auth first
  let member = await getCurrentMember();

  // Fall back to OTP session (for members who signed in via magic link)
  if (!member) {
    try { member = await getMemberSession(); } catch { /* ignore */ }
  }

  if (!member) {
    redirect("/sign-in");
  }

  return member;
}

export async function requireAdmin() {
  const member = await requireMember();

  if (member.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return member;
}
