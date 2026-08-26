import { ProfylPageData } from "@/types/profyl-page";
import { ProfylPublicNav } from "./ProfylPublicNav";
import { ProfylHero } from "./ProfylHero";
import { ProfylAISummary } from "./ProfylAISummary";
import { ProfylQuantifiedSignals } from "./ProfylQuantifiedSignals";
import { ProfylProjects } from "./ProfylProjects";
import { ProfylGithubAnalytics } from "./ProfylGithubAnalytics";
import { ProfylLeetcodeAnalytics } from "./ProfylLeetcodeAnalytics";
import { ProfylManifesto } from "./ProfylManifesto";
import { ProfylFooter } from "./ProfylFooter";

interface ProfylPageProps {
  data: ProfylPageData;
  mode: "preview" | "public";
}

/**
 * Reusable master renderer for the Profyl profile page.
 * Unifies render structure for both Public route and Dashboard Preview modes.
 */
export function ProfylPage({ data, mode }: ProfylPageProps) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans overflow-x-hidden relative">
      {/* 1. Public Navbar (rendered only in public mode) */}
      {mode === "public" && <ProfylPublicNav />}

      {/* Profile Sections */}
      <div className={mode === "public" ? "profyl-public-view pt-16" : ""}>
        {/* 2. Hero (Identity + Score Evaluation) */}
        <ProfylHero data={data} />

        {/* 3. AI Developer Summary */}
        <ProfylAISummary data={data} />

        {/* 4. Quantified Key Highlights */}
        <ProfylQuantifiedSignals data={data} />

        {/* 5. Shipped Projects */}
        <ProfylProjects data={data} />

        {/* 6. GitHub Analytics */}
        <ProfylGithubAnalytics data={data} />

        {/* 7. LeetCode Analytics */}
        <ProfylLeetcodeAnalytics data={data} />

        {/* 8. Manifesto & CTA */}
        <ProfylManifesto />

        {/* 9. Minimal Footer */}
        <ProfylFooter />
      </div>
    </div>
  );
}
