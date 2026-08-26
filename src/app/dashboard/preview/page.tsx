import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getProfylPageData } from "@/lib/services/profyl-page.service";
import { ProfylPage } from "@/components/profyl/ProfylPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preview Profile",
};

export default async function PreviewPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Guard: if onboarding is incomplete, redirect back to onboarding wizard
  if (user.profileStatus === "INCOMPLETE") {
    redirect("/onboarding/projects");
  }

  const data = await getProfylPageData({ userId: user.id });

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 bg-[#0D0D0D] font-mono text-xs text-white/45">
        Failed to load profile data. Please ensure onboarding was completed correctly.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0D0D0D]">
      {/* 1. Preview Mode Header Banner */}
      <div className="bg-[#141414] border-b hairline py-3 px-6 lg:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="size-2 bg-neon rounded-full animate-pulse-neon" />
          <span className="font-mono text-xs uppercase tracking-widest text-neon">
            ● Preview Mode
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline font-mono text-[10px] text-white/45">
            This is exactly what people see when visiting your Profyl.
          </span>
        </div>
        <a
          href={`/${user.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-neon hover:underline flex items-center gap-1 transition-colors cursor-pointer"
        >
          Open in new tab ↗
        </a>
      </div>

      {/* 2. Embedded ProfylPage Renderer in Preview Mode */}
      <div className="flex-1">
        <ProfylPage data={data} mode="preview" />
      </div>
    </div>
  );
}
