import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 500;

export default async function RedirectPage() {
  const { userId } = await auth();

  // No Clerk session → actually unauthenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Wait briefly for the Clerk webhook to provision the Profyl user.
  let user = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (user) {
      break;
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // Clerk authentication succeeded, but Profyl user provisioning failed/didn't complete.
  if (!user) {
    throw new Error(
      "Your account is still being set up. Please try again in a moment.",
    );
  }

  switch (user.profileStatus) {
    case "INCOMPLETE":
      redirect("/onboarding");

    case "DRAFT":
    case "PUBLISHED":
      redirect("/dashboard");

    default:
      throw new Error("Invalid profile status");
  }
}
