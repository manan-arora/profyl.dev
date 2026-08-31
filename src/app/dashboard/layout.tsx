import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { getProfylPageData } from "@/lib/services/profyl-page.service";
import DashboardShell from "@/components/dashboard/DashboardShell";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch canonical profile data for the Preview tab
  const initialData = await getProfylPageData({ userId: user.id });

  if (!initialData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 bg-[#0D0D0D] font-mono text-xs text-white/45">
        Failed to initialize dashboard. Please ensure onboarding was completed correctly.
      </div>
    );
  }

  // Fetch raw records from DB to initialize editing state
  const rawProfile = await prisma.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  const rawRepositories = await prisma.repository.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      githubUpdatedAt: "desc",
    },
  });

  // Typecast user record for Dashboard shell compatibility
  const typedUser = {
    id: user.id,
    githubUsername: user.githubUsername,
    slug: user.slug,
    avatarUrl: user.avatarUrl,
    name: user.name,
    profileStatus: user.profileStatus,
    isLeetcodeVerified: user.isLeetcodeVerified,
  };

  return (
    <DashboardShell
      user={typedUser}
      initialData={initialData}
      rawProfile={rawProfile}
      rawRepositories={rawRepositories}
    >
      {children}
    </DashboardShell>
  );
}
