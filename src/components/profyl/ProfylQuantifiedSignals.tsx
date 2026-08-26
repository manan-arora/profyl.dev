import { ProfylPageData } from "@/types/profyl-page";
import { SectionHeader } from "./ProfylAISummary";

export function ProfylQuantifiedSignals({ data }: { data: ProfylPageData }) {
  const { quantifiedSignals } = data;

  const signals = [
    {
      value: quantifiedSignals.leetcodeProblemsSolved !== null ? quantifiedSignals.leetcodeProblemsSolved.toLocaleString() : "—",
      label: "DSA Problems Solved",
      tag: "LEETCODE",
    },
    {
      value: quantifiedSignals.leetcodePercentile !== null ? `Top ${(100 - quantifiedSignals.leetcodePercentile).toFixed(0)}%` : "—",
      label: "Of All Leetcode users",
      tag: "LEETCODE",
    },
    {
      value: quantifiedSignals.leetcodeContestRating !== null ? Math.round(quantifiedSignals.leetcodeContestRating).toString() : "—",
      label: "Contest Rating",
      tag: "LEETCODE",
    },
    {
      value: quantifiedSignals.githubContributionsLast12Months !== null ? quantifiedSignals.githubContributionsLast12Months.toLocaleString() : "—",
      label: "GitHub Contributions",
      tag: "LAST 12 MONTHS",
    },
    {
      value: quantifiedSignals.githubPublicRepositories !== null ? quantifiedSignals.githubPublicRepositories.toString() : "—",
      label: "Public Repositories",
      tag: "GITHUB",
    },
    {
      value: quantifiedSignals.connectedProjects.toString(),
      label: "Featured Projects",
      tag: "SHIPPED",
    },
  ];

  return (
    <section id="highlights" className="pt-12 pb-20 border-t hairline bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader
          tag="◇ Key Highlights"
          title="Quantified signals"
          subtitle="Numbers pulled directly from connected sources. Refreshed every 12 hrs."
        />
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 ">
          {signals.map((s, idx) => (
            <div
              key={idx}
              className="group bg-[#0D0D0D] p-6 lg:p-8 hover:bg-[#121212] transition-colors relative"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                  / {s.tag}
                </span>
                <span className="size-1.5 bg-neon rounded-full" />
              </div>
              <div className="font-display text-5xl lg:text-6xl font-semibold tracking-tight text-white group-hover:text-[var(--neon)] transition-all duration-200">
                {s.value}
              </div>
              <div className="mt-3 font-mono text-xs uppercase tracking-widest text-white/55">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
