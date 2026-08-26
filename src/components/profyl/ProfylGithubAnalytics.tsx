"use client";

import { ProfylPageData } from "@/types/profyl-page";
import { SectionHeader } from "./ProfylAISummary";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  LabelList,
  LineChart,
  Line,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#141414] border hairline px-3 py-2 font-mono text-xs select-none">
        <div className="text-white/40 mb-1 uppercase tracking-wider">{label}</div>
        <div className="text-neon font-semibold">
          {payload[0].value.toLocaleString()} contributions
        </div>
      </div>
    );
  }
  return null;
};

export function ProfylGithubAnalytics({ data }: { data: ProfylPageData }) {
  const { github } = data;

  const stats = [
    {
      value: github.ossPrsMerged !== null ? github.ossPrsMerged.toString() : "—",
      label: "OSS PRs Merged",
    },
    {
      value: github.starsEarned !== null ? github.starsEarned.toLocaleString() : "—",
      label: "Stars Earned",
    },
    {
      value: github.longestStreak !== null ? `${github.longestStreak} days` : "—",
      label: "Longest Streak",
    },
    {
      value: github.activeWeeks !== null ? `${github.activeWeeks} weeks` : "—",
      label: "Active Weeks",
    },
  ];

  // Map weeks and days for contribution calendar grid
  const weeks = github.contributionCalendar?.weeks || [];
  const daysInGrid = weeks.flatMap((w: any) => w.days || []);

  return (
    <section id="github" className="pt-12 pb-20 border-t hairline bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader
          tag="◇ GitHub Analytics"
          title="The work, indexed."
          subtitle={`Activity across public repositories and open-source contributions over the last 12 months.`}
        />

        {/* Heatmap + Stats Row */}
        <div className="mt-10 grid lg:grid-cols-[2fr_1fr] gap-px bg-white/8 border hairline">
          {/* Contribution Heatmap */}
          <div className="bg-[#141414] p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/55">
                Contribution Heatmap · 12 months
              </span>
              {github.totalContributionsLast12Months !== null && (
                <span className="font-mono text-[10px] text-neon uppercase tracking-wider">
                  {github.totalContributionsLast12Months.toLocaleString()} contributions
                </span>
              )}
            </div>

            {daysInGrid.length > 0 ? (
              <div
                className="grid gap-[3px] select-none"
                style={{
                  gridTemplateColumns: `repeat(${weeks.length || 52}, minmax(0, 1fr))`,
                  gridAutoFlow: "column",
                  gridTemplateRows: "repeat(7, minmax(0, 1fr))",
                }}
              >
                {daysInGrid.map((day: any, i: number) => {
                  let bg = "rgba(255, 255, 255, 0.05)";
                  if (day.count > 0) {
                    const lvl = day.level || "";
                    if (lvl === "FOURTH_QUARTILE" || lvl === "HIGHER") bg = "#C7FF41";
                    else if (lvl === "THIRD_QUARTILE") bg = "rgba(199, 255, 65, 0.6)";
                    else if (lvl === "SECOND_QUARTILE") bg = "rgba(199, 255, 65, 0.28)";
                    else bg = "rgba(199, 255, 65, 0.12)";
                  }
                  return (
                    <span
                      key={i}
                      className="aspect-square rounded-[1px] hover:ring-1 hover:ring-neon transition-shadow"
                      style={{ background: bg }}
                      title={`${day.count} contributions on ${day.date}`}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center font-mono text-xs text-white/40">
                No contribution calendar data available.
              </div>
            )}

            <div className="mt-4 flex justify-between font-mono text-[9px] text-white/40 uppercase tracking-widest px-1">
              <span>Jan</span>
              <span>Apr</span>
              <span>Jul</span>
              <span>Oct</span>
              <span>Dec</span>
            </div>
          </div>

          {/* GitHub Stats Grid */}
          <div className="bg-[#141414] p-6 lg:p-8 grid grid-cols-2 gap-6 content-start">
            {stats.map((s, idx) => (
              <div key={idx}>
                <div className="font-display text-3xl font-semibold text-white tracking-tight">
                  {s.value}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-white/45 mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="mt-px grid lg:grid-cols-2 gap-px bg-white/8">
          {/* Language Distribution */}
          <div className="flex flex-col bg-[#141414] p-6 lg:p-8 border-l border-b hairline lg:border-b-0">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Language Distribution
            </div>
            {github.languageDistribution.length > 0 ? (
              <div className="flex flex-1 items-center">
                <div className="w-full space-y-4 py-2">
                  {github.languageDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                    {/* Column 1: Language Name (aligned consistent left column) */}
                    <span className="font-mono text-xs text-white/90 w-24 shrink-0 truncate">
                      {item.language}
                    </span>

                    {/* Column 2: Full-width Bar Track */}
                    <div className="flex-1 h-1.5 bg-white/5 relative">
                      <div
                        className="h-full bg-neon transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    {/* Column 3: Percentage (aligned consistent right column) */}
                    <span className="font-mono text-xs text-white/60 w-10 text-right shrink-0">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center font-mono text-xs text-white/40">
                No language distribution data detected.
              </div>
            )}
          </div>

          {/* Activity Trend */}
          <div className="bg-[#141414] p-6 lg:p-8 border-r border-b hairline lg:border-b-0">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Activity Trend · 12 months
            </div>
            {github.monthlyContributionSeries.length > 0 ? (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart
                    data={github.monthlyContributionSeries}
                    margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C7FF41" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#C7FF41" stopOpacity={0}/>
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="month"
                      stroke="rgba(255, 255, 255, 0.3)"
                      fontSize={10}
                      tickLine={false}
                      className="font-mono text-white/40"
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.3)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      className="font-mono text-white/40"
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="contributions"
                      stroke="#C7FF41"
                      strokeWidth={1.5}
                      fill="url(#colorContributions)"
                      dot={{ r: 3, fill: "#C7FF41", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center font-mono text-xs text-white/40">
                No monthly contributions activity trend available.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
