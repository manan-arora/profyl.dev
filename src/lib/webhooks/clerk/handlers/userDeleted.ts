import { DeletedObjectJSON } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function handleUserDeleted(data: DeletedObjectJSON) {
  const clerkId = data.id;

  if (!clerkId) {
    throw new Error("[Clerk Webhook] Missing clerkId in deleted event payload");
  }

  console.log(`[Clerk Webhook] Deleting user: ${clerkId}`);

  // Use a Prisma transaction to allow additional cleanup logic later.
  await prisma.$transaction(async (tx) => {
    // Check if user exists
    const user = await tx.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      console.log(`[Clerk Webhook] User to delete not found: ${clerkId}`);
      return;
    }

    // Delete the user record
    await tx.user.delete({
      where: { clerkId },
    });

    // CASCADE constraints on schema.prisma handle deleting related records
    // (Profile, Repository, GitHubCache, etc.) at the database level.
    // Place future cleanup logic below (e.g. deleting cached files, index updates).
  });
}
