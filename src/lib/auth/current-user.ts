import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { User } from "@/generated/prisma/client";

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });
}
