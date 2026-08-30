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

  return (
    <div className="space-y-4 lg:h-full lg:flex lg:flex-col">
      {/* Top Card: Score, Tier, Percentile */}
      <div className="relative shrink-0">
        <CornerMarkers />
        <div className="relative bg-[#141414] border hairline">
          <div className="flex items-center justify-between px-5 py-3 border-b hairline">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
              Profyl Score
            </span>

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

          <div className="relative bg-[#141414] border hairline min-h-[220px] lg:h-full flex flex-col justify-between">
            <div className="flex items-center justify-between px-5 py-3 border-b hairline">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                Specialization Radar
              </span>
            </div>

            <div className="radar-chart-container w-full flex items-center justify-center p-4">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="60%"
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
