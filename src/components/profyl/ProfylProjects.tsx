"use client";

import { useRef, useState, useEffect } from "react";
import { ProfylPageData } from "@/types/profyl-page";
import { CornerMarkers, SectionHeader } from "./ProfylAISummary";
import { ExternalLink, Star } from "lucide-react";
import { ProjectAISummary } from "./ProjectAISummary";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

function TopicChips({ topics }: { topics: string[] }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(topics.length);

  useEffect(() => {
    const checkHeight = () => {
      const container = measureRef.current;
      if (!container) return;

      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      const baseTop = children[0].offsetTop;
      const rowTops = Array.from(new Set(children.map((c) => c.offsetTop))).sort((a, b) => a - b);

      if (rowTops.length <= 2) {
        setVisibleCount(topics.length);
        return;
      }

      const thirdRowTop = rowTops[2];
      const firstRow3Index = children.findIndex((c) => c.offsetTop >= thirdRowTop);

      if (firstRow3Index !== -1) {
        // Leave room for "+N more" non-clickable text indicator
        setVisibleCount(Math.max(1, firstRow3Index - 1));
      }
    };

    checkHeight();
    const timer = setTimeout(checkHeight, 150);
    window.addEventListener("resize", checkHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkHeight);
    };
  }, [topics]);

  const visibleTopics = topics.slice(0, visibleCount);
  const hiddenCount = topics.length - visibleCount;

  if (topics.length === 0) {
    return (
      <span className="font-mono text-[10px] text-white/40 italic select-none">
        No topics available yet
      </span>
    );
  }

  return (
    <div className="relative w-full">
      {/* Invisible measurement container to avoid infinite layout loops */}
      <div
        ref={measureRef}
        className="absolute inset-x-0 top-0 opacity-0 pointer-events-none flex flex-wrap gap-1.5 overflow-hidden"
        style={{ height: "60px" }}
      >
        {topics.map((topic, i) => (
          <span
            key={`measure-${topic}-${i}`}
            className="font-mono text-[10px] px-1.5 py-0.5 border hairline"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Visible container */}
      <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-hidden">
        {visibleTopics.map((topic) => (
          <span
            key={topic}
            className="font-mono text-[10px] px-1.5 py-0.5 border hairline text-white/70 bg-[#141414] whitespace-nowrap"
          >
            {topic}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 border hairline text-white/40 bg-[#141414]/55 whitespace-nowrap select-none">
            +{hiddenCount} more
          </span>
        )}
      </div>
    </div>
  );
}

function ProfylUnderTheHood({ data }: { data: ProfylPageData }) {
  const [open, setOpen] = useState(false);
  const [allTech, setAllTech] = useState(false);

  const underTheHood = data.underTheHood;
  if (!underTheHood) return null;

  const { capabilities, technologies } = underTheHood;
  const TECH_PREVIEW = 8;
  const techToShow = allTech ? technologies : technologies.slice(0, TECH_PREVIEW);
  const hiddenTech = technologies.length - TECH_PREVIEW;

  if (capabilities.length === 0 && technologies.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <div className="group border border-[#C7FF41]/20 hover:border-[#C7FF41]/35 bg-[#C7FF41]/[0.02] rounded-md [box-shadow:inset_0_0_28px_-18px_rgba(199,255,65,0.55)] transition-colors">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-6 px-5 py-4 text-left cursor-pointer"
        >
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-neon">
              ◇ Under the hood
            </div>
            <div className="font-display text-sm sm:text-base font-medium tracking-tight text-white/90 mt-1">
              What Profyl found beneath the surface
            </div>
          </div>
          <span className="shrink-0 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50  hover:text-[var(--neon)] transition-colors">
            <span className="hidden sm:inline">View findings</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <div
          className={`grid transition-all duration-300 ease-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-5 pb-5">
              <div className="h-px bg-[#C7FF41]/12" />

              {/* Engineering Capabilities */}
              {capabilities.length > 0 && (
                <div className="pt-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--neon)]/40">
                    / ENGINEERING CAPABILITIES · PROJECTS
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {capabilities.map((c) => (
                      <span
                        key={c.label}
                        className="inline-flex items-baseline gap-1.5 rounded-sm border border-[#C7FF41]/15 bg-white/[0.03] px-2.5 py-1 text-[12px] font-medium text-white/85"
                      >
                        {c.label}
                        <span className="font-mono text-[10px] text-white/40">· {c.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {capabilities.length > 0 && technologies.length > 0 && (
                <div className="my-4 h-px bg-white/8" />
              )}

              {/* Technologies Found */}
              {technologies.length > 0 && (
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--neon)]/40">
                    / Technologies found
                  </div>
                  <div className="mt-2 font-mono text-[11px] leading-relaxed text-white/55">
                    {techToShow.map((t, i) => (
                      <span key={t}>
                        {i > 0 && <span className="text-white/20"> · </span>}
                        <span className="text-white/70">{t}</span>
                      </span>
                    ))}
                    {!allTech && hiddenTech > 0 && (
                      <button
                        onClick={() => setAllTech(true)}
                        className="ml-2 text-white/40 hover:text-neon transition-colors cursor-pointer"
                      >
                        + {hiddenTech} more
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Methodology footnote */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/35">
                <span>Derived from analysis of the featured projects</span>
                <span>Portfolio-level aggregation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfylProjects({ data }: { data: ProfylPageData }) {
  if (data.projects.length === 0) {
    return null;
  }

  const handleCardClick = (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section
      id="projects"
      className="pt-12 pb-20 border-t hairline bg-[#0D0D0D]"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader
          tag="◇ Featured Projects"
          title="What's actually been shipped"
          subtitle="Auto-detected from GitHub. Tech stack inferred. AI summaries generated."
        />
        
        <div className="mt-10 grid md:grid-cols-2 gap-px bg-white/8 border hairline">

          {data.projects.map((project) => {
            const cardTargetUrl =
              project.liveDemoUrl ?? project.githubUrl;

            return (
              <div
                key={project.id}
                onClick={() => handleCardClick(cardTargetUrl)}
                className="
                  group
                  bg-[#0D0D0D]
                  p-6 lg:p-8
                  hover:bg-[#141A0C]
                  hover:neon-glow
                  hover:z-10
                  transition-all
                  duration-200
                  cursor-pointer
                  relative
                  flex flex-col
                  min-h-[360px]
                  border
                  hairline
                "
              >
                {/* ===================================================== */}
                {/* PROJECT HEADER                                         */}
                {/* ===================================================== */}
                <div className="h-16 shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div
                        className="
                          font-display
                          text-xl
                          font-semibold
                          tracking-tight
                          text-white
                          line-clamp-2
                        "
                      >
                        {project.name}
                      </div>

                      <div className="font-mono text-[10px] text-white/40 mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <Star className="size-3 text-white/40 shrink-0" />
                          {project.stars}
                        </span>

                        {project.primaryLanguage && (
                          <>
                            <span>·</span>
                            <span className="truncate">
                              {project.primaryLanguage}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {project.liveDemoUrl ? (
                        <span className="font-mono text-[9px] px-2 py-1 border border-neon text-neon uppercase tracking-wider animate-pulse-neon">
                          LIVE
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] px-2 py-1 border hairline text-white/50 uppercase tracking-wider">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ===================================================== */}
                {/* DESCRIPTION                                            */}
                {/* ===================================================== */}
                <div className="h-[72px] shrink-0 overflow-hidden">
                  {project.description ? (
                    <p
                      className="
                        text-white/65
                        leading-relaxed
                        text-sm
                        line-clamp-3
                      "
                    >
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-white/40 leading-relaxed text-sm italic">
                      No repository description available.
                    </p>
                  )}
                </div>

                {/* ===================================================== */}
                {/* TOPIC CHIPS                                           */}
                {/* ===================================================== */}
                <div className="h-[48px] mt-3 shrink-0 overflow-hidden group-hover:text-[var(--neon)]
                          transition-colors">
                  <TopicChips topics={project.topics} />
                </div>

                {/* ===================================================== */}
                {/* AI SUMMARY                                             */}
                {/* ===================================================== */}
                <div className="shrink-0">
                  <ProjectAISummary
                    summary={project.projectSummary || "Summary unavailable: repository lacks sufficient metadata."}
                  />
                </div>

                {/* ===================================================== */}
                {/* FOOTER                                                 */}
                {/* ===================================================== */}
                <div className="mt-auto pt-6 flex items-center gap-3 font-mono text-[11px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        project.githubUrl,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-white/70
                      hover:text-[var(--neon)]
                      transition-colors
                      cursor-pointer
                    "
                  >
                    <GithubIcon className="size-3.5" />
                    github ↗
                  </button>

                  {project.liveDemoUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          project.liveDemoUrl!,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                      className="
                        inline-flex
                        items-center
                        gap-1
                        text-white/70
                        hover:text-[var(--neon)]
                        transition-colors
                        cursor-pointer
                      "
                    >
                      <ExternalLink className="size-3.5" />
                      demo ↗
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ===================================================== */}
        {/* UNDER THE HOOD SECTION                                 */}
        {/* ===================================================== */}
        <ProfylUnderTheHood data={data} />
      </div>
    </section>
  );
}