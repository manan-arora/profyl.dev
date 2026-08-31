"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Product", href: "#" },
  { label: "Signals", href: "#signals" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Manifesto", href: "#manifesto" },
];

export function ProfylLanding() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-foreground font-sans overflow-x-hidden">
      <Hero />
      <Ticker />
      <Features />
      <SignalSection />
      <Manifesto />
      <CtaBlock />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section id="product" className="relative pt-20 pb-24 lg:pt-24 lg:pb-32">
      <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 grid lg:grid-cols-[1.05fr_1fr] lg:gap-12 items-start">
        <div className="lg:pt-4">
          <h1 className="font-display font-semibold tracking-[-0.03em] text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.95] text-white">
            Stop sending <br />
            <span className="lg:whitespace-nowrap">
              pieces <br /> <span className="text-white/30">of yourself</span>
            </span>{" "}
            <br />
            Send your <br />
            <span className="text-neon neon-text-glow italic">Profyl.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-white/65 leading-relaxed">
            One living profile for everything you code.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="/sign-up"
              className="group relative inline-flex items-center gap-2 bg-neon text-[#0D0D0D] font-semibold px-6 py-3.5 text-sm tracking-tight hover:opacity-90 transition"
            >
              Create Your Profyl
              <span className="font-mono">→</span>
            </a>
            <a
              href="/demo"
              className="inline-flex items-center gap-2 border border-white/15 text-white px-6 py-3.5 text-sm font-medium hover:border-neon hover:text-neon transition"
            >
              <span className="size-1.5 bg-neon rounded-full" />
              View Demo
            </a>
          </div>
        </div>

        <div>
          <ProfileCard />
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-display text-lg sm:text-2xl font-semibold tracking-tight text-white">
        {k}
      </div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-white/45 mt-1">
        {v}
      </div>
    </div>
  );
}

function ProfileCard() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 20;
      if (i >= 815) {
        setScore(815);
        clearInterval(id);
      } else setScore(i);
    }, 15);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      {/* corner markers */}
      <CornerMarkers />

      <div className="relative bg-[#141414] border hairline scan-line">
        {/* identity */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className="size-14 border-neon border bg-[#0D0D0D] flex items-center justify-center font-display font-bold text-neon text-lg">
            AM
          </div>
          <div className="flex-1">
            <div className="font-display text-xl font-semibold tracking-tight text-white">
              Alex Morgan
            </div>
            <div className="font-mono text-[11px] text-white/50 mt-0.5">
              Senior Backend · Berlin · 6y XP
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Go", "Rust", "Distributed", "K8s"].map((t) => (
                <span
                  key={t}
                  className="font-mono text-[10px] px-1.5 py-0.5 border hairline text-white/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* hero score */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between border-t hairline pt-5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                Profyl Score
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display font-semibold text-7xl text-neon neon-text-glow leading-none tabular-nums">
                  {score}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                Tier
              </div>
              <div className="font-display text-2xl font-semibold mt-1 text-white">
                Strong
              </div>
            </div>
          </div>
          {/* meter */}
          <div className="mt-4 h-1 bg-white/5 relative">
            <div
              className="absolute left-0 top-0 h-full bg-neon transition-all duration-1000"
              style={{ width: `${(score / 1000) * 100}%` }}
            />
          </div>
        </div>

        {/* grid panels */}
        <div className="grid grid-cols-2 border-t hairline">
          <Panel label="Engineering Radar" border="r">
            <Radar />
          </Panel>
          <Panel label="Signal Breakdown">
            <div className="mt-1.5 space-y-2">
              <Bar label="GitHub" value={85} />
              <Bar label="Projects" value={78} />
              <Bar label="LeetCode" value={72} />
              <Bar label="Consistency" value={90} />
            </div>
          </Panel>

          <Panel label="AI Signal" border="t r">
            <p className="font-mono text-[10px] leading-relaxed text-white/70">
              Strong backend-oriented builder with consistent engineering
              activity and recurring systems-focused work.
            </p>
          </Panel>

          <Panel label="Featured Project" border="t">
            <div className="font-display text-sm font-semibold text-white">
              orbit/scheduler
            </div>
            <div className="font-mono text-[10px] text-white/50 mt-1">
              Distributed cron · Go · 4.2k★
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function CornerMarkers() {
  const base = "absolute size-3 border-neon";
  return (
    <>
      <span className={`${base} -top-px -left-px border-t border-l`} />
      <span className={`${base} -top-px -right-px border-t border-r`} />
      <span className={`${base} -bottom-px -left-px border-b border-l`} />
      <span className={`${base} -bottom-px -right-px border-b border-r`} />
    </>
  );
}

function Panel({
  label,
  children,
  border = "",
  colSpan = false,
}: {
  label: string;
  children: React.ReactNode;
  border?: string;
  colSpan?: boolean;
}) {
  const cls = [
    "p-4",
    border.includes("r") ? "border-r hairline" : "",
    border.includes("t") ? "border-t hairline" : "",
    colSpan ? "col-span-2" : "",
  ].join(" ");
  return (
    <div className={cls}>
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] w-12 text-white/50 truncate">
        {label}
      </span>
      <div className="flex-1 h-1 bg-white/5">
        <div className="h-full bg-neon" style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-[9px] w-6 text-right text-white/60 tabular-nums">
        {value}
      </span>
    </div>
  );
}

function ContribGrid() {
  const cells = Array.from({ length: 56 });
  return (
    <div
      className="mt-3 grid grid-cols-14 gap-[3px]"
      style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
    >
      {cells.map((_, i) => {
        const intensity = Math.random();
        const bg =
          intensity > 0.85
            ? "#C7FF41"
            : intensity > 0.6
              ? "rgba(199,255,65,0.55)"
              : intensity > 0.35
                ? "rgba(199,255,65,0.2)"
                : "rgba(255,255,255,0.06)";
        return (
          <span key={i} className="aspect-square" style={{ background: bg }} />
        );
      })}
    </div>
  );
}

function Radar() {
  const axes = [
    "Build Activity",
    "Technical Range",
    "Problem Solving",
    "Consistency",
    "Open Source",
  ];
  const values = [0.82, 0.76, 0.71, 0.84, 0.48];
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v];
  };
  const poly = (v: number[]) => v.map((vv, i) => pt(i, vv).join(",")).join(" ");
  return (
    <div className="flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[120px]">
        {[0.25, 0.5, 0.75, 1].map((s) => (
          <polygon
            key={s}
            points={poly(axes.map(() => s))}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.5}
          />
        ))}
        {axes.map((_, i) => {
          const [x, y] = pt(i, 1);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={0.5}
            />
          );
        })}
        <polygon
          points={poly(values)}
          fill="rgba(199,255,65,0.15)"
          stroke="#C7FF41"
          strokeWidth={1}
        />
        {values.map((v, i) => {
          const [x, y] = pt(i, v);
          return <circle key={i} cx={x} cy={y} r={1.8} fill="#C7FF41" />;
        })}
      </svg>
    </div>
  );
}

function Ticker() {
  const items = [
    "GITHUB",
    "LEETCODE",
    "PROJECTS",
    "RESUME",
    "GITHUB",
    "LEETCODE",
    "PROJECTS",
    "RESUME",
  ];
  const row = [...items, ...items, ...items];
  return (
    <div className="border-y hairline py-5 overflow-hidden bg-[#0D0D0D]">
      <div className="flex gap-12 animate-ticker whitespace-nowrap">
        {row.map((t, i) => (
          <span
            key={i}
            className="font-display text-3xl font-semibold tracking-tight text-white/15 flex items-center gap-12 select-none"
          >
            {t}
            <span className="size-1.5 bg-neon rounded-full" />
          </span>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    n: "01",
    tag: "CONNECT",
    title: "Connect the work.",
    desc: "Connect the platforms where your engineering work already exists. No portfolio archaeology. No five-link scavenger hunt.",
    chips: ["GitHub", "LeetCode", "Projects"],
  },
  {
    n: "02",
    tag: "LIVE",
    title: "Never update your portfolio again.",
    desc: "You keep shipping, keep solving. Your profile keeps up. Profyl automatically refreshes connected signals as your work evolves, so the link you sent six months ago doesn't become a fossil.",
    chips: ["Auto-updated", "Always current", "Living profile"],
  },
  {
    n: "03",
    tag: "SIGNAL",
    title: "Turn activity into signal.",
    desc: "Profyl analyzes your repositories and activity to detect engineering patterns. AI interprets those signals into summaries people can understand.",
    chips: ["Profyl Score", "Specialization Radar", "AI Summary"],
  },
  {
    n: "04",
    tag: "SHARE",
    title: "One link. The whole picture.",
    desc: "Stop sending people five different places to understand you. Send your Profyl instead.",
    chips: ["Applications", "Interviews", "Networking", "Profile"],
  },
];

function Features() {
  return (
    <section id="how-it-works" className="py-28 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 mb-20">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon mb-4">
              ◇ THE SYSTEM
            </div>
            <h2 className="font-display font-semibold tracking-tight text-5xl lg:text-6xl leading-[0.95] text-white">
              Four signals. <br />
              <span className="text-white/40">One identity.</span>
            </h2>
          </div>
          <p className="text-white/65 text-lg leading-relaxed lg:pt-12 max-w-xl">
            Your engineering story is scattered by default. Profyl pulls the
            pieces together, finds the signal, and gives it somewhere to live.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-white/8">
          {FEATURES.map((f) => (
            <div
              key={f.n}
              className="group relative bg-[#0D0D0D] p-8 lg:p-10 hover:bg-[#121212] transition-colors"
            >
              <div className="flex items-start justify-between mb-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                  / {f.tag}
                </span>
                <span className="font-display text-5xl font-semibold text-white/10 group-hover:text-[var(--neon)] transition-colors leading-none">
                  {f.n}
                </span>
              </div>
              <h3 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight leading-tight text-white group-hover:text-[var(--neon)] transition-colors">
                {f.title}
              </h3>
              <p className="mt-4 text-white/55 leading-relaxed max-w-md">
                {f.desc}
              </p>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {f.chips.map((c) => (
                  <span
                    key={c}
                    className="font-mono text-[10px] px-2 py-1 border hairline text-white/70"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalSection() {
  return (
    <section
      id="why-profyl"
      className="relative py-28 lg:py-20 border-t hairline"
    >
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon mb-4">
            ◇ WHY PROFYL
          </div>
          <h2 className="font-display font-semibold tracking-tight text-5xl lg:text-6xl leading-[0.95] text-white">
            The internet has your work. <br />
            <span className="text-neon italic">
              It doesn't have your story.
            </span>
          </h2>
          <p className="mt-8 text-white/65 text-lg max-w-lg leading-relaxed">
            Having the evidence isn't the same as being understood. Profyl gives
            context to the work you've already done - so someone can understand
            the engineer behind the activity, not just the activity itself.
          </p>
          <div className="mt-10 space-y-px bg-white/8">
            {[
              [
                "EVIDENCE",
                "Show. Don't oversell. Grounded in observable engineering activity.",
              ],
              [
                "INTERPRETATION",
                "Context, not adjectives. AI surfaces patterns from the evidence.",
              ],
              [
                "CLARITY",
                "Built to be understood. Designed for fast technical scanning.",
              ],
            ].map(([k, v]) => (
              <div
                key={k}
                className="bg-[#0D0D0D] flex items-center justify-between px-5 py-4 border-b border-white/5"
              >
                <span className="font-display font-semibold text-white">
                  {k}
                </span>
                <span className="font-mono text-xs text-white/50 text-right ml-4 max-w-xs">
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        <BigScoreboard />
      </div>
    </section>
  );
}

function BigScoreboard() {
  return (
    <div className="relative bg-[#141414] border hairline p-8 lg:p-10">
      <CornerMarkers />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">
            Scattered Work
          </div>
          <div className="space-y-4">
            {[
              ["GitHub", "1,284 contributions"],
              ["LeetCode", "742 solved"],
              ["Projects", "4 featured"],
              ["Open Source", "12 merged PRs"],
            ].map(([platform, stat]) => (
              <div
                key={platform}
                className="flex flex-col border-b border-white/5 pb-2"
              >
                <span className="font-display text-sm font-semibold text-white/80">
                  {platform}
                </span>
                <span className="font-mono text-xs text-neon mt-0.5">
                  {stat}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="hidden sm:block absolute -left-4 top-0 bottom-0 w-px bg-white/8" />
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon mb-3">
            Meaningful Signal
          </div>
          <div className="space-y-3.5">
            {(
              [
                ["Build Activity", 82],
                ["Technical Range", 76],
                ["Problem Solving", 71],
                ["Consistency", 84],
                ["Open Source", 48],
              ] as [string, number][]
            ).map(([label, val]) => (
              <div key={label as string} className="flex items-center gap-2">
                <span className="font-mono text-xs text-white/70 w-28 shrink-0 truncate">
                  {label}
                </span>
                <div className="flex-1 h-1 bg-white/5">
                  <div
                    className="h-full bg-neon animate-bar-fill"
                    style={{ width: `${val}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-white/50 tabular-nums w-6 text-right">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t hairline">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neon mb-2">
          ◇ AI Signal
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-white/75">
          Strong backend-oriented builder with consistent engineering activity
          and recurring systems-focused work.
        </p>
      </div>
    </div>
  );
}

function UseCases() {
  const items = [
    {
      n: "01",
      tag: "APPLICATIONS",
      title: "Replace the pile of links.",
      desc: "GitHub. LeetCode. Projects. Resume. Stop attaching the whole internet to one application.",
    },
    {
      n: "02",
      tag: "INTERVIEWS",
      title: "Give them context before the call.",
      desc: "Let interviewers see the work behind the resume before you start talking.",
    },
    {
      n: "03",
      tag: "NETWORKING",
      title: 'Make "what do you do?" clickable.',
      desc: "When someone asks what you've been building, send your Profyl.",
    },
    {
      n: "04",
      tag: "PERSONAL BRAND",
      title: "Let your profile keep up.",
      desc: "Your work changes. Your developer identity should too.",
    },
  ];

  return (
    <section className="py-28 lg:py-36 border-t hairline bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 mb-20">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon mb-4">
              ◇ USE IT ANYWHERE
            </div>
            <h2 className="font-display font-semibold tracking-tight text-5xl lg:text-6xl leading-[0.95] text-white">
              One profile. <br />
              <span className="text-white/40">Everywhere you need it.</span>
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-white/8">
          {items.map((f) => (
            <div
              key={f.n}
              className="group relative bg-[#0D0D0D] p-8 lg:p-10 hover:bg-[#121212] transition-colors"
            >
              <div className="flex items-start justify-between mb-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                  / {f.tag}
                </span>
                <span className="font-display text-5xl font-semibold text-white/10 group-hover:text-neon transition-colors leading-none">
                  {f.n}
                </span>
              </div>
              <h3 className="font-display text-2xl lg:text-3xl font-semibold tracking-tight leading-tight text-white">
                {f.title}
              </h3>
              <p className="mt-4 text-white/55 leading-relaxed max-w-md">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section id="manifesto" className="py-28 lg:py-30 border-t hairline">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon mb-8">
          ◇ MANIFESTO
        </div>
        <p className="font-display font-semibold tracking-[-0.02em] text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white">
          We don't believe in{" "}
          <span className="text-white/30">10x developers.</span> <br />
          We believe in <span className="text-neon italic">visible</span>{" "}
          builders.
        </p>
      </div>
    </section>
  );
}

function CtaBlock() {
  return (
    <section id="cta" className="px-6 lg:px-10 pb-24">
      <div className="relative mx-auto max-w-[1400px] bg-neon text-[#0D0D0D] overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0D0D0D 1px, transparent 1px), linear-gradient(to bottom, #0D0D0D 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative p-10 lg:p-20 grid lg:grid-cols-[2fr_1fr] gap-10 items-end">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] mb-6">
              ◇ CLAIM YOUR HANDLE
            </div>
            <h2 className="font-display font-semibold tracking-[-0.03em] text-5xl lg:text-7xl leading-[0.9]">
              profyl.dev/<span className="italic font-bold">you</span>
            </h2>
            <p className="mt-6 text-[#0D0D0D]/75 text-lg max-w-lg">
              One link. Your whole developer story.
              <br />
              Connect your signals. Curate your work. Make it visible.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="/sign-up"
              className="bg-[#0D0D0D] text-neon font-semibold px-6 py-4 text-center hover:opacity-90 transition"
            >
              Create Your Profyl →
            </a>
            <a
              href="/demo"
              className="border-2 border-[#0D0D0D] text-[#0D0D0D] font-semibold px-6 py-4 text-center hover:bg-[#0D0D0D] hover:text-[var(--neon)] transition-colors"
            >
              View Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t hairline bg-[#0D0D0D]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-2.5">
          <Image
            src="/profyl-logo.svg"
            alt="Profyl logo"
            width={24}
            height={24}
            className="size-6 object-contain"
          />
          <span className="font-display font-semibold text-white">profyl</span>
          <span className="font-mono text-[10px] text-white/40 ml-2">
            © 2026 — Built because a README wasn't enough.
          </span>
        </div>
        <div className="flex gap-6 font-mono text-[11px] uppercase tracking-widest text-white/55">
          <Link href="/" className="hover:text-neon transition-colors">
            Home
          </Link>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon transition-colors"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
