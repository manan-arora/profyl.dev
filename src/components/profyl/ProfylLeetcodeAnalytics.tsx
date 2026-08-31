"use client";
import { useState } from "react";
import { ProfylPageData } from "@/types/profyl-page";
import { SectionHeader } from "./ProfylAISummary";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const ContestTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#141414] border hairline px-3 py-2 font-mono text-xs select-none">
        <div className="text-white/40 mb-1 uppercase tracking-wider">{label}</div>
        <div className="text-neon font-semibold">
          Rating: {Math.round(payload[0].value).toLocaleString("en-US")}
        </div>
      </div>
    );
  }
  return null;
};

const formatContestLabel = (value: string) => {
  if (!value) return "";
  return value
    .replace(/Weekly Contest\s*/i, "WC")
    .replace(/Biweekly Contest\s*/i, "BWC");
};

export function ProfylLeetcodeAnalytics({ data }: { data: ProfylPageData }) {
  const { leetcode } = data;
  const [hoveredDifficulty, setHoveredDifficulty] = useState<string | null>(null);

  const stats = [
    {
      value: leetcode.contestRating !== null ? Math.round(leetcode.contestRating).toLocaleString("en-US") : "—",
      label: "Rating",
      sub: "Current contest standing",
    },
    {
      value: leetcode.overallRank !== null ? `#${leetcode.overallRank.toLocaleString("en-US")}` : "—",
      label: "Overall Rank",
      sub: data.quantifiedSignals.leetcodePercentile !== null ?  `Top ${(
          100 - data.quantifiedSignals.leetcodePercentile
        ).toFixed(2)}%` : "Global Standing",
    },
    {
      value: leetcode.problemsSolved !== null ? leetcode.problemsSolved.toString() : "—",
      label: "Problems Solved",
      sub: "Across all difficulty levels",
    },
    {
      value: leetcode.contestsParticipated !== null ? leetcode.contestsParticipated.toString() : "—",
      label: "Contests Entered",
      sub: "Competitive participation",
    },
  ];

  // Donut chart difficulty distribution data
  const pieData = [
    { name: "Easy", value: leetcode.difficultyDistribution.easy || 0, color: "rgba(199, 255, 65, 0.4)" },
    { name: "Medium", value: leetcode.difficultyDistribution.medium || 0, color: "#C7FF41" },
    { name: "Hard", value: leetcode.difficultyDistribution.hard || 0, color: "#a1e800" },
  ].filter((d) => d.value > 0);

  const totalSolved =
    leetcode.difficultyDistribution.easy +
    leetcode.difficultyDistribution.medium +
    leetcode.difficultyDistribution.hard;

  return (
    <section id="leetcode" className="pt-12 pb-20 border-t hairline bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader
          tag="◇ LeetCode Analytics"
          title="Problem-solving signal"
          subtitle="Numbers pulled directly from LeetCode. Contest performance and problem-solving activity analyzed."
        />

        {/* LeetCode Stats Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/8 border hairline">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-[#141414] p-6 lg:p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/45 mb-2">
                {s.label}
              </div>
              <div className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-neon neon-text-glow">
                {s.value}
              </div>
              <div className="font-mono text-[10px] text-white/40 mt-2">
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="mt-px grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/8 border-x border-b hairline">
          {/* Difficulty Donut Chart */}
          <div className="bg-[#141414] p-6 lg:p-8 flex flex-col">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Difficulty Distribution
            </div>

            <div className="flex flex-col sm:flex-row gap-8 items-center justify-between w-full flex-1">
              <div className="flex-1 w-full">
                {totalSolved > 0 ? (
                  <div className="space-y-4 max-w-xs">
                    {pieData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between transition-opacity duration-200"
                        style={{
                          opacity: hoveredDifficulty && hoveredDifficulty !== d.name ? 0.3 : 1
                        }}
                        onMouseEnter={() => setHoveredDifficulty(d.name)}
                        onMouseLeave={() => setHoveredDifficulty(null)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="font-mono text-xs text-white/75">{d.name}</span>
                        </div>
                        <span className="font-mono text-xs text-white/50 tabular-nums">
                          {d.value} solved ({Math.round((d.value / totalSolved) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 font-mono text-xs text-white/40">
                    No difficulty distribution data found.
                  </div>
                )}
              </div>

              {totalSolved > 0 && (
                <div className="size-48 relative flex items-center justify-center shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        onMouseEnter={(data, index) => setHoveredDifficulty(pieData[index].name)}
                        onMouseLeave={() => setHoveredDifficulty(null)}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#141414"
                            strokeWidth={1}
                            style={{
                              opacity: hoveredDifficulty && hoveredDifficulty !== entry.name ? 0.3 : 1,
                              transition: "opacity 0.2s"
                            }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-display text-2xl font-bold text-white leading-none">
                      {totalSolved}
                    </span>
                    <span className="font-mono text-[9px] uppercase text-white/40 mt-1">
                      Solved
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rating History */}
          <div className="bg-[#141414] p-6 lg:p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Contest Rating History
            </div>
            {leetcode.ratingHistory.length > 0 ? (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={leetcode.ratingHistory}
                    margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C7FF41" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#C7FF41" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="contest"
                      stroke="rgba(255, 255, 255, 0.3)"
                      fontSize={9}
                      tickLine={false}
                      tickFormatter={formatContestLabel}
                      className="font-mono text-white/40"
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.3)"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      domain={["dataMin - 100", "dataMax + 100"]}
                      className="font-mono text-white/40"
                    />
                    <Tooltip
                      content={<ContestTooltip />}
                      cursor={{ stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="rating"
                      stroke="#C7FF41"
                      strokeWidth={1.5}
                      fill="url(#colorRating)"
                      dot={{ r: 2.5, fill: "#C7FF41", strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center font-mono text-xs text-white/40">
                No contest rating history data detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
