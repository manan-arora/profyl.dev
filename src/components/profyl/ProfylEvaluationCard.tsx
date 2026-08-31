"use client";

import { useEffect, useState } from "react";
import { ProfylPageData } from "@/types/profyl-page";
import { CornerMarkers } from "./ProfylAISummary";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { RadarTick } from "./RadarTick";
import Link from "next/link";
import { Info } from "lucide-react";

function AnimatedScore({ targetScore }: { targetScore: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let current = 0;
    if (targetScore <= 0) {
      setAnimatedScore(0);
      return;
    }
    const step = Math.ceil(targetScore / 40); // animate in ~40 frames
    const timer = setInterval(() => {
      current += step;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [targetScore]);

  return (
    <span className="font-display font-semibold text-7xl text-neon neon-text-glow leading-none tabular-nums">
      {animatedScore}
    </span>
  );
}

export function ProfylEvaluationCard({ data }: { data: ProfylPageData }) {
  const { evaluation, ai } = data;
  const targetScore = evaluation.profylScore || 0;
  const [activePopover, setActivePopover] = useState<"score" | "radar" | null>(null);

  useEffect(() => {
    if (!activePopover) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePopover(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".info-popover-trigger") && !target.closest(".info-popover-content")) {
        setActivePopover(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePopover]);

  return (
    <div className="space-y-4 lg:h-full lg:flex lg:flex-col">
      {/* Top Card: Score, Tier, Percentile */}
      <div className="relative shrink-0">
        <CornerMarkers />
        <div className="relative bg-[#141414] border hairline">
          <div className="flex items-center justify-between px-5 py-3 border-b hairline relative">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                Profyl Score
              </span>
              <div className="relative inline-block">
                <button
                  type="button"
                  aria-label="About Profyl Score"
                  className="info-popover-trigger inline-flex items-center justify-center text-white/40 hover:text-white focus-visible:text-white transition-colors focus:outline-none"
                  onClick={() => setActivePopover(activePopover === "score" ? null : "score")}
                >
                  <Info className="size-3" />
                </button>

                {/* Score Popover */}
                {activePopover === "score" && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden" 
                      onClick={() => setActivePopover(null)} 
                    />
                    <div 
                      role="dialog"
                      aria-modal="true"
                      className="info-popover-content fixed left-4 right-4 top-[30%] -translate-y-1/2 z-50 md:absolute md:top-3 md:translate-y-0 md:left-full md:ml-3 md:w-[320px] md:right-auto bg-[#141414] border border-white/10 hairline p-5 text-left shadow-2xl focus:outline-none"
                    >
                      <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/80 mb-3">Profyl Score</h4>
                      <div className="font-sans text-white/70 text-xs leading-relaxed space-y-3">
                        <p>
                          A single rating built from four signals: GitHub, Projects, LeetCode, and Consistency.
                        </p>
                        <p>
                          Each signal captures a different part of the profile and is combined into the overall rating.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <Link 
                          href="/docs/scoring#profyl-rating" 
                          className="inline-flex items-center text-neon font-mono text-[10px] uppercase tracking-wider hover:opacity-85 transition-opacity"
                          onClick={() => setActivePopover(null)}
                        >
                          Learn how Profyl Rating works →
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-6 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <AnimatedScore targetScore={targetScore} />
              </div>
              {evaluation.percentile !== null && (
                <div className="font-mono text-[10px] text-white/45 mt-2 uppercase tracking-widest">
                  Top {(100 - evaluation.percentile)}% on Profyl
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                Tier
              </div>
              <div className="font-display text-3xl font-semibold text-white mt-1">
                {evaluation.tier || "Solid"}
              </div>
            </div>
          </div>

          {/* Score percentage progress strip */}
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-neon transition-all duration-1000"
              style={{ width: `${(targetScore / 1000) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Radar + Signal Breakdown Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:flex-1">

        {/* Specialization Radar */}
        <div className="relative lg:h-full">
          <CornerMarkers />

          <div className="relative bg-[#141414] border hairline min-h-[220px] h-full flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b hairline relative">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                  Specialization Radar
                </span>
                <div className="relative inline-block">
                  <button
                    type="button"
                    aria-label="About Specialization Radar"
                    className="info-popover-trigger inline-flex items-center justify-center text-white/40 hover:text-white focus-visible:text-white transition-colors focus:outline-none"
                    onClick={() => setActivePopover(activePopover === "radar" ? null : "radar")}
                  >
                    <Info className="size-3" />
                  </button>

                  {/* Radar Popover */}
                  {activePopover === "radar" && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden" 
                        onClick={() => setActivePopover(null)} 
                      />
                      <div 
                        role="dialog"
                        aria-modal="true"
                        className="info-popover-content fixed left-4 right-4 top-[30%] -translate-y-1/2 z-50 md:absolute md:top-3 md:translate-y-0 md:left-full md:ml-3 md:w-[320px] md:right-auto bg-[#141414] border border-white/10 hairline p-5 text-left shadow-2xl focus:outline-none"
                      >
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/80 mb-3">Specialization Radar</h4>
                        <div className="font-sans text-white/70 text-xs leading-relaxed space-y-3">
                          <p>
                            Shows your engineering profile across: Build Activity, Technical Range, Problem Solving, Consistency, and Open Source.
                          </p>
                          <p>
                            Technical Range is based on signals detected from your featured projects. A 0 means no supported signals were detected or the tech stack isn't currently supported by Profyl.
                          </p>
                          <p>
                            If only some projects are supported, only those projects are used.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5">
                          <Link 
                            href="/docs/scoring#specialization-radar" 
                            className="inline-flex items-center text-neon font-mono text-[10px] uppercase tracking-wider hover:opacity-85 transition-opacity"
                            onClick={() => setActivePopover(null)}
                          >
                            Learn how the radar works →
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="radar-chart-container flex-1 w-full flex items-center justify-center p-4">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="55%"
                  data={evaluation.radar}
                >
                  <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="rgba(255, 255, 255, 0.4)"
                    fontSize={8}
                    className="font-mono uppercase"
                    tick={RadarTick}
                    tickLine={false}
                  />
                  <Radar
                    name="Radar"
                    dataKey="value"
                    stroke="#C7FF41"
                    fill="#C7FF41"
                    dot={{
                      r: 1,
                      fill: "#C7FF41",
                      stroke: "#C7FF41",
                      strokeWidth: 1,
                    }}
                    fillOpacity={0.15}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Score Composition / Signal Breakdown */}
        <div className="relative lg:h-full">
          <CornerMarkers />

          <div className="relative bg-[#141414] border hairline min-h-[220px] h-full flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b hairline">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                Score Composition
              </span>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-center p-5 min-h-[170px]">
              {evaluation.signalBreakdown.map((sig, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-white/70 w-24">
                    {sig.name}
                  </span>

                  <div className="flex-1 h-1.5 bg-white/5">
                    <div
                      className="h-full bg-neon transition-all duration-1000"
                      style={{ width: `${sig.value}%` }}
                    />
                  </div>

                  <span className="font-mono text-[10px] text-white/50 tabular-nums w-8 text-right">
                    {sig.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t hairline px-5 py-3 bg-[#111111]/10">
              <p className="font-mono text-[10px] text-white/40 tracking-tight">
                Performance across four engineering signals.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
