import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getCurrentMember() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Find existing member or auto-create from Clerk user data
  const member = await prisma.member.upsert({
    where: { clerkId: user.id },
    update: {},
    create: {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      imageUrl: user.imageUrl ?? null,
    },
  });

  return member;
}

export async function requireMember() {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/sign-in");
  }

  return member;
}

export async function requireAdmin() {
  const member = await requireMember();

  if (member.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return member;
}
