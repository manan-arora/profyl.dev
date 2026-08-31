import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ProfylFooter } from "@/components/profyl/ProfylFooter";
import { DocsNav } from "@/components/docs/DocsNav";

export const metadata: Metadata = {
  title: "How Profyl Works - Methodology & Scoring",
  description: "Learn how the Profyl Score, Specialization Radar, and other engineering signals are computed from developer activity.",
};

const DOC_SECTIONS = [
  { id: "profyl-rating", label: "Profyl Rating" },
  { id: "score-composition", label: "Score Composition" },
  { id: "specialization-radar", label: "Specialization Radar" },
  { id: "build-activity", label: "Build Activity" },
  { id: "technical-range", label: "Technical Range" },
  { id: "problem-solving", label: "Problem Solving" },
  { id: "consistency", label: "Consistency" },
  { id: "open-source", label: "Open Source" },
  { id: "tiers", label: "Tiers & Percentile" },
  { id: "data-limitations", label: "Data & Limitations" },
];

export default function DocsScoringPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Visual background grid */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header navbar */}
      <header className="border-b hairline bg-[#0D0D0D]/80 backdrop-blur-md h-16 flex items-center shrink-0 z-25 relative sticky top-0">
        <div className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 z-30">
            <Image
              src="/profyl-logo.svg"
              alt="Profyl logo"
              width={28}
              height={28}
              className="size-7 object-contain"
            />
            <span className="font-display font-semibold tracking-tight text-lg text-white">
              profyl
            </span>
          </Link>
          <div className="flex gap-4 font-mono text-[11px] uppercase tracking-widest text-white/55 z-30">
            <Link href="/" className="hover:text-neon transition-colors">
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-10 py-12 md:py-16 z-10 relative flex flex-col lg:flex-row gap-10">
        {/* Navigation - Sidebar for Desktop, Hamburger Menu/Dropdown on Mobile */}
        <aside className="lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit">
          <DocsNav sections={DOC_SECTIONS} />
        </aside>

        {/* Content Area */}
        <article className="flex-1 max-w-3xl space-y-16">
          <div className="space-y-4">
            <h1 className="font-display font-semibold text-3xl md:text-4xl tracking-tight text-white uppercase">
              HOW PROFYL WORKS
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed font-sans">
              Profyl turns observable developer activity into a small set of understandable engineering signals.
              It is designed to make the evidence available across connected sources easier to understand.
            </p>
          </div>

          {/* 1. Profyl Rating */}
          <section id="profyl-rating" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Profyl Score
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                Profyl Score is the overall rating shown on a profile.
              </p>
              <div className="font-mono text-xs bg-white/5 py-2 px-3 border border-white/5 inline-block text-neon">
                GitHub &middot; Projects &middot; LeetCode &middot; Consistency
              </div>
              <p>
                Each signal captures a different part of the developer&apos;s public and connected profile before being combined into the final rating.
              </p>
              <p className="text-white/55 text-xs italic font-sans border-l-2 border-white/10 pl-3">
                The rating is an evidence-based profile signal, not a definitive measure of engineering ability.
              </p>
            </div>
          </section>

          {/* 2. Score Composition */}
          <section id="score-composition" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Score Composition
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                The overall rating is built from four signals.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#141414] border hairline p-4 relative">
                  <h3 className="font-mono text-xs text-neon uppercase tracking-wider mb-2">GitHub</h3>
                  <p className="text-white/60 text-xs">Building and open-source activity drawn from GitHub.</p>
                </div>
                <div className="bg-[#141414] border hairline p-4 relative">
                  <h3 className="font-mono text-xs text-neon uppercase tracking-wider mb-2">Projects</h3>
                  <p className="text-white/60 text-xs">Technical evidence from the projects selected for the profile.</p>
                </div>
                <div className="bg-[#141414] border hairline p-4 relative">
                  <h3 className="font-mono text-xs text-neon uppercase tracking-wider mb-2">LeetCode</h3>
                  <p className="text-white/60 text-xs">Demonstrated problem-solving activity and competitive performance.</p>
                </div>
                <div className="bg-[#141414] border hairline p-4 relative">
                  <h3 className="font-mono text-xs text-neon uppercase tracking-wider mb-2">Consistency</h3>
                  <p className="text-white/60 text-xs">How regularly activity is distributed across GitHub and LeetCode.</p>
                </div>
              </div>
              <p>
                Each signal is evaluated independently before being combined into the overall rating.
              </p>
            </div>
          </section>

          {/* 3. Specialization Radar */}
          <section id="specialization-radar" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Specialization Radar
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                The radar is different from the overall rating.
              </p>
              <p>
                It describes the shape of the engineering profile across five dimensions: Build Activity, Technical Range, Problem Solving, Consistency, and Open Source.
              </p>
              <p>
                The radar helps show where the strongest engineering signals are concentrated.
              </p>
            </div>
          </section>

          {/* 4. Build Activity */}
          <section id="build-activity" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Build Activity
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                Build Activity reflects observable software-building activity.
              </p>
              <p>
                Profyl considers GitHub contribution activity and eligible public projects showing recent activity.
              </p>
              <p>
                The evaluation uses diminishing returns so unusually large amounts of activity do not overwhelm the rest of the profile.
              </p>
            </div>
          </section>

          {/* 5. Technical Range */}
          <section id="technical-range" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Technical Range
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                Technical Range reflects the breadth of technical capabilities that Profyl can reliably detect across featured projects.
              </p>
              <p>
                Profyl looks for recognizable repository evidence such as dependencies, manifests, and supported configuration artifacts. Detected technologies are grouped into broader capability areas rather than simply being counted individually.
              </p>
              <p>
                Profyl does not attempt to understand every technology or every repository in V1. Unsupported or ambiguous evidence is not treated as positive evidence.
              </p>
              <div className="bg-[#141414] border hairline p-4">
                <h4 className="font-mono text-xs uppercase tracking-wider mb-2 text-white/80">Analysis Coverage</h4>
                <p className="text-white/60 text-xs leading-relaxed mb-3">
                  Technical Range is based on featured projects that contain sufficient supported technical evidence. If only some projects are supported, only those projects are used.
                </p>
                <div className="text-white/50 text-[11px] font-mono border-t border-white/5 pt-2">
                  Supported stacks: Javascript/Typescript, Java, Python, Go
                </div>
              </div>
            </div>
          </section>

          {/* 6. Problem Solving */}
          <section id="problem-solving" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Problem Solving
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                Problem Solving reflects demonstrated LeetCode problem-solving activity.
              </p>
              <p>
                Profyl considers problem-solving volume, difficulty exposure, and competitive performance.
              </p>
              <p className="text-white/55 text-xs italic font-sans border-l-2 border-white/10 pl-3">
                It is a signal of observable problem-solving evidence, not a complete measure of real-world engineering ability.
              </p>
            </div>
          </section>

          {/* 7. Consistency */}
          <section id="consistency" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Consistency
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                Consistency reflects how regularly engineering and problem-solving activity appears over time.
              </p>
              <p>
                Profyl combines activity patterns from GitHub and LeetCode and considers both activity coverage and gaps over time.
              </p>
            </div>
          </section>

          {/* 8. Open Source */}
          <section id="open-source" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Open Source
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                Open Source reflects participation in and external interaction with the open-source ecosystem.
              </p>
              <p>
                Profyl considers merged contributions to repositories and external interest in repositories owned by the developer, including stars and forks.
              </p>
              <p className="text-white/55 text-xs italic font-sans border-l-2 border-white/10 pl-3">
                These signals indicate observable participation and external interaction; they do not independently establish software quality.
              </p>
            </div>
          </section>

          {/* 9. Tiers & Percentile */}
          <section id="tiers" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Tiers & Percentile
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                Tiers provide a simple way to interpret the overall rating.
              </p>

              {/* Tiers Table */}
              <div className="overflow-hidden border hairline bg-[#141414] max-w-sm">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b hairline bg-white/5">
                      <th className="p-3 text-white/50 font-medium">Profyl Score</th>
                      <th className="p-3 text-white/50 font-medium">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hairline">
                      <td className="p-3 font-semibold text-neon">850+</td>
                      <td className="p-3 text-white">Exceptional</td>
                    </tr>
                    <tr className="border-b hairline">
                      <td className="p-3 font-semibold text-white/80">700–849</td>
                      <td className="p-3 text-white">Strong</td>
                    </tr>
                    <tr className="border-b hairline">
                      <td className="p-3 font-semibold text-white/60">550–699</td>
                      <td className="p-3 text-white">Solid</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white/40">Below 550</td>
                      <td className="p-3 text-white">Growing</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Percentile, when available, compares a profile with the Profyl user base rather than with developers globally.
              </p>
              <p>
                Percentile is hidden during the cold-start period and becomes available once Profyl has at least 100 registered users.
              </p>
            </div>
          </section>

          {/* 10. Data & Limitations */}
          <section id="data-limitations" className="space-y-4 scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-white tracking-tight border-b hairline pb-2">
              Data & Limitations
            </h2>
            <div className="text-white/70 text-sm leading-relaxed space-y-4 font-sans">
              <p>
                Profyl works from the data available through connected sources and the evidence it can reliably interpret.
              </p>
              <p>
                Missing or unavailable data should not automatically be interpreted as poor performance.
              </p>
              <p>
                Technical analysis is intentionally limited in V1. Profyl does not attempt to understand every language, framework, repository, or implementation detail.
              </p>
              <p className="text-white/55 text-xs italic font-sans border-l-2 border-white/10 pl-3">
                Profyl Score should be treated as an evidence-based profile signal, not as an objective measurement of intelligence, seniority, engineering quality, or overall programming ability.
              </p>
              <p className="text-white/60 text-xs mt-4">
                Numerical evaluation signals are computed from connected-source data. AI is used separately to interpret evidence into profile narratives.
              </p>
            </div>
          </section>
        </article>
      </main>

      <ProfylFooter />
    </div>
  );
}
