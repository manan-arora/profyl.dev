import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import profylLogo from "@/assets/profyl-logo.png.asset.json";

export function ProfylProfile() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-foreground font-sans overflow-x-hidden">
      <Nav />
      <ProfileHero />
      <AISummary />
      <Highlights />
      <GitHubAnalytics />
      <LeetCodeAnalytics />
      <ConnectedProjects />
      <TechnicalInsights />
      <DeveloperSignals />
      <Philosophy />
      <Footer />
    </div>
  );
}

/* ---------------- Nav ---------------- */
function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b hairline bg-[#0D0D0D]/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={profylLogo.url} alt="Profyl logo" className="size-7 object-contain" />
          <span className="font-display font-semibold tracking-tight text-lg">profyl</span>
          <span className="font-mono text-[10px] text-neon ml-1 mt-0.5">v1.0</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-white/70 hover:text-white transition-colors">Home</Link>
          <span className="text-sm text-neon flex items-center gap-2">
            <span className="size-1.5 bg-neon rounded-full animate-pulse-neon" />
            Profile
          </span>
          <a href="#highlights" className="text-sm text-white/70 hover:text-white transition-colors">Highlights</a>
          <a href="#projects" className="text-sm text-white/70 hover:text-white transition-colors">Projects</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#" className="hidden sm:block text-sm text-white/70 hover:text-white">Share</a>
          <a href="#" className="bg-neon text-[#0D0D0D] text-sm font-semibold px-4 py-2 hover:opacity-90 transition">
            Claim Yours →
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Corner markers (shared) ---------------- */
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

/* ---------------- Hero / Identity Report ---------------- */
function ProfileHero() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 3;
      if (i >= 94) { setScore(94); clearInterval(id); }
      else setScore(i);
    }, 25);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24">
      <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 border hairline px-3 py-1.5">
            <span className="size-1.5 bg-neon rounded-full animate-pulse-neon" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
              Public Identity Report
            </span>
          </div>
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            profyl.dev/<span className="text-neon">alexkarim</span>
          </span>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
          {/* Left: identity */}
          <div className="relative">
            <CornerMarkers />
            <div className="relative bg-[#141414] border hairline scan-line p-8 lg:p-10">
              <div className="flex items-center justify-between border-b hairline pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="size-2 bg-neon rounded-full" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                    profyl/identity-report
                  </span>
                </div>
                <span className="font-mono text-[10px] text-white/40">ID·AK-08842</span>
              </div>

              <div className="flex items-start gap-5">
                <div className="size-20 lg:size-24 border-neon border-2 bg-[#0D0D0D] flex items-center justify-center font-display font-bold text-neon text-3xl neon-text-glow">
                  AK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-3xl lg:text-4xl font-semibold tracking-tight">
                    Alex Karim
                  </div>
                  <div className="font-mono text-xs text-white/55 mt-1">
                    Senior Backend / Platform Engineer · Berlin, DE · 6y XP
                  </div>
                  <div className="font-display italic text-lg text-white/80 mt-3 leading-snug">
                    "I build the boring infrastructure that lets product teams move fast."
                  </div>
                </div>
              </div>

              <p className="mt-6 text-white/65 leading-relaxed max-w-2xl">
                Backend-focused engineer with strong distributed systems experience.
                Currently building payment infrastructure at a Series B fintech.
                Previously contributed to open-source databases and scheduling systems.
              </p>

              {/* Tech stack */}
              <div className="mt-6 flex flex-wrap gap-1.5">
                {["Go", "Rust", "Python", "Kubernetes", "Postgres", "Kafka", "gRPC", "Terraform", "AWS"].map((t) => (
                  <span key={t} className="font-mono text-[10px] px-2 py-1 border hairline text-white/75">
                    {t}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#" className="inline-flex items-center gap-2 bg-neon text-[#0D0D0D] font-semibold px-5 py-3 text-sm hover:opacity-90 transition">
                  Download Resume <span className="font-mono">↓</span>
                </a>
                <a href="#" className="inline-flex items-center gap-2 border border-white/15 text-white px-5 py-3 text-sm font-medium hover:border-neon hover:text-neon transition">
                  Contact
                </a>
                <div className="ml-auto flex items-center gap-3 font-mono text-[11px] text-white/60">
                  <a href="#" className="hover:text-neon">github↗</a>
                  <a href="#" className="hover:text-neon">leetcode↗</a>
                  <a href="#" className="hover:text-neon">linkedin↗</a>
                  <a href="#" className="hover:text-neon">site↗</a>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-neon text-[#0D0D0D] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest">
                ◇ Verified Identity
              </div>
            </div>
          </div>

          {/* Right: score + tier + AI insight stack */}
          <div className="space-y-4">
            <div className="relative">
              <CornerMarkers />
              <div className="relative bg-[#141414] border hairline">
                <div className="flex items-center justify-between px-5 py-3 border-b hairline">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                    Developer Score
                  </span>
                  <span className="font-mono text-[10px] text-neon">LIVE</span>
                </div>
                <div className="px-6 py-6 flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-semibold text-7xl text-neon neon-text-glow leading-none tabular-nums">
                        {score}
                      </span>
                      <span className="font-mono text-xs text-white/40">/100</span>
                    </div>
                    <div className="font-mono text-[10px] text-white/45 mt-2 uppercase tracking-widest">
                      Top 6% globally
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">Tier</div>
                    <div className="font-display text-3xl font-semibold mt-1">S–01</div>
                    <div className="font-mono text-[9px] text-white/40 mt-1">Platform</div>
                  </div>
                </div>
                <div className="h-1 bg-white/5">
                  <div className="h-full bg-neon transition-all duration-1000" style={{ width: `${score}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/8 border hairline">
              <Panel label="Skills Radar"><Radar /></Panel>
              <Panel label="Year Contribs">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-semibold">1,284</span>
                  <span className="font-mono text-[10px] text-white/40">commits</span>
                </div>
                <ContribGrid />
              </Panel>
            </div>

            <div className="relative bg-[#141414] border hairline p-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neon mb-2">◇ AI Insight</div>
              <p className="font-mono text-[12px] leading-relaxed text-white/75">
                Elite systems profile with proven open-source contribution velocity.
                Recommend pursuing <span className="text-neon">Staff-level platform</span> roles
                or technical co-founder positions at infra startups.
              </p>
            </div>
          </div>
        </div>

        {/* Lifetime stats strip */}
        <div className="mt-12 border-t hairline pt-6 grid grid-cols-2 md:grid-cols-5 gap-6">
          <Lifetime k="6y" v="Experience" />
          <Lifetime k="3" v="Companies" />
          <Lifetime k="42" v="OSS PRs Merged" />
          <Lifetime k="11" v="Talks given" />
          <Lifetime k="2026" v="Joined Profyl" />
        </div>
      </div>
    </section>
  );
}

function Lifetime({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold tracking-tight">{k}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-white/45 mt-1">{v}</div>
    </div>
  );
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141414] p-4">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40 mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}

function Radar() {
  const axes = ["Systems", "Algos", "Frontend", "DevOps", "AI/ML", "Design"];
  const values = [0.95, 0.88, 0.55, 0.82, 0.66, 0.42];
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
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[180px]">
        {[0.25, 0.5, 0.75, 1].map((s) => (
          <polygon key={s} points={poly(axes.map(() => s))} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
        ))}
        {axes.map((_, i) => {
          const [x, y] = pt(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />;
        })}
        <polygon points={poly(values)} fill="rgba(199,255,65,0.15)" stroke="#C7FF41" strokeWidth={1} />
        {values.map((v, i) => {
          const [x, y] = pt(i, v);
          return <circle key={i} cx={x} cy={y} r={1.8} fill="#C7FF41" />;
        })}
      </svg>
    </div>
  );
}

function ContribGrid() {
  // deterministic for SSR consistency
  const cells = Array.from({ length: 70 });
  return (
    <div className="mt-3 grid gap-[3px]" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
      {cells.map((_, i) => {
        const v = (Math.sin(i * 1.7) + 1) / 2;
        const bg =
          v > 0.85 ? "#C7FF41"
          : v > 0.6 ? "rgba(199,255,65,0.55)"
          : v > 0.35 ? "rgba(199,255,65,0.2)"
          : "rgba(255,255,255,0.06)";
        return <span key={i} className="aspect-square" style={{ background: bg }} />;
      })}
    </div>
  );
}

/* ---------------- AI Summary ---------------- */
function AISummary() {
  return (
    <section className="py-20 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader tag="◇ AI Developer Summary" title="Generated narrative" />
        <div className="relative mt-10">
          <CornerMarkers />
          <div className="relative bg-[#141414] border hairline p-8 lg:p-12">
            <div className="flex items-center justify-between mb-6 pb-4 border-b hairline">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
                  ◇ Profyl AI · v3.1
                </span>
                <span className="font-mono text-[10px] text-white/40">Synthesized from 4 sources</span>
              </div>
              <span className="font-mono text-[10px] text-white/40">Last generated · 2 hrs ago</span>
            </div>
            <p className="font-display text-2xl lg:text-3xl font-medium tracking-tight leading-snug text-white/90 max-w-4xl">
              Backend-focused engineer with strong{" "}
              <span className="text-neon">distributed systems</span> experience and a public track
              record across GitHub, LeetCode, and shipped projects. Consistent contributor with
              strengths in <span className="text-neon">APIs, platform engineering,</span> and{" "}
              <span className="text-neon">scalable backend architecture</span>.
            </p>
            <p className="mt-6 text-white/60 leading-relaxed max-w-3xl">
              Ranks in the top 8% of LeetCode globally. Maintains a consistent commit cadence
              over 18 months with a focus on infrastructure repositories. Best fit for
              Staff-level backend, platform, or infra roles at Series B+ startups.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {["Distributed Systems", "APIs", "Platform", "Backend", "Open Source"].map((t) => (
                <span key={t} className="font-mono text-[10px] px-2 py-1 border-neon border text-neon">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-end">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neon mb-4">{tag}</div>
        <h2 className="font-display font-semibold tracking-tight text-4xl lg:text-5xl leading-[0.95]">
          {title}
        </h2>
      </div>
      {subtitle && <p className="text-white/60 text-lg leading-relaxed max-w-xl">{subtitle}</p>}
    </div>
  );
}

/* ---------------- Highlights ---------------- */
const HIGHLIGHTS = [
  { n: "650+", l: "DSA Problems Solved", t: "LEETCODE" },
  { n: "Top 8%", l: "LeetCode Ranking", t: "GLOBAL" },
  { n: "8", l: "Connected Projects", t: "ACTIVE" },
  { n: "1,247", l: "GitHub Contributions", t: "YEAR" },
  { n: "25", l: "Public Repositories", t: "GITHUB" },
  { n: "4", l: "Live Deployments", t: "SHIPPED" },
];

function Highlights() {
  return (
    <section id="highlights" className="py-20 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader tag="◇ Key Highlights" title="Quantified signals" subtitle="Numbers pulled directly from connected sources. Refreshed daily." />
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-px bg-white/8">
          {HIGHLIGHTS.map((h) => (
            <div key={h.l} className="group bg-[#0D0D0D] p-6 lg:p-8 hover:bg-[#121212] transition-colors relative">
              <div className="flex items-start justify-between mb-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                  / {h.t}
                </span>
                <span className="size-1.5 bg-neon rounded-full" />
              </div>
              <div className="font-display text-5xl lg:text-6xl font-semibold tracking-tight text-white group-hover:text-neon transition-colors">
                {h.n}
              </div>
              <div className="mt-3 font-mono text-xs uppercase tracking-widest text-white/55">
                {h.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- GitHub Analytics ---------------- */
function GitHubAnalytics() {
  return (
    <section className="py-20 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader tag="◇ GitHub / Analytics" title="The work, indexed." subtitle="Activity across 25 public repositories and 42 OSS contributions." />

        <div className="mt-10 grid lg:grid-cols-[2fr_1fr] gap-px bg-white/8 border hairline">
          {/* Big heatmap */}
          <div className="bg-[#141414] p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/55">
                Contribution Heatmap · 12 months
              </span>
              <span className="font-mono text-[10px] text-neon">1,247 contributions</span>
            </div>
            <BigHeatmap />
            <div className="mt-4 flex items-center justify-between font-mono text-[9px] text-white/40">
              <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
            </div>
          </div>

          <div className="bg-[#141414] p-6 lg:p-8 grid grid-cols-2 gap-6 content-start">
            <Mini k="25" v="Public Repos" />
            <Mini k="6.2k" v="Total Commits" />
            <Mini k="412" v="Pull Requests" />
            <Mini k="1.8k" v="Followers" />
            <Mini k="3.4k" v="Stars Earned" />
            <Mini k="42" v="OSS Merged" />
          </div>
        </div>

        <div className="mt-px grid lg:grid-cols-2 gap-px bg-white/8">
          {/* Language distribution */}
          <div className="bg-[#141414] p-6 lg:p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Language Distribution
            </div>
            <div className="space-y-3">
              {[
                ["Go", 48],
                ["Rust", 22],
                ["Python", 14],
                ["TypeScript", 9],
                ["Shell", 4],
                ["Other", 3],
              ].map(([l, v]) => (
                <div key={l as string} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-white/75 w-24">{l}</span>
                  <div className="flex-1 h-1.5 bg-white/5">
                    <div className="h-full bg-neon" style={{ width: `${v}%` }} />
                  </div>
                  <span className="font-mono text-[10px] text-white/50 tabular-nums w-10 text-right">{v}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity trend */}
          <div className="bg-[#141414] p-6 lg:p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Activity Trend · 12 months
            </div>
            <LineChart values={[28, 45, 38, 62, 71, 58, 84, 92, 76, 88, 95, 110]} labels={["J","F","M","A","M","J","J","A","S","O","N","D"]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-semibold tracking-tight">{k}</div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-white/45 mt-1">{v}</div>
    </div>
  );
}

function BigHeatmap() {
  const weeks = 52;
  const days = 7;
  const cells = Array.from({ length: weeks * days });
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0,1fr))`, gridAutoFlow: "column", gridTemplateRows: `repeat(${days}, minmax(0,1fr))` }}>
      {cells.map((_, i) => {
        const v = (Math.sin(i * 0.37) + Math.cos(i * 0.21) + 2) / 4;
        const bg =
          v > 0.78 ? "#C7FF41"
          : v > 0.55 ? "rgba(199,255,65,0.6)"
          : v > 0.35 ? "rgba(199,255,65,0.28)"
          : v > 0.18 ? "rgba(199,255,65,0.12)"
          : "rgba(255,255,255,0.05)";
        return <span key={i} className="aspect-square" style={{ background: bg }} />;
      })}
    </div>
  );
}

function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const w = 600, h = 180, pad = 20;
  const max = Math.max(...values);
  const step = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${path} L ${pts[pts.length-1][0]} ${h-pad} L ${pad} ${h-pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} y1={h-pad-g*(h-pad*2)} x2={w-pad} y2={h-pad-g*(h-pad*2)} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
        ))}
        <path d={area} fill="rgba(199,255,65,0.12)" />
        <path d={path} fill="none" stroke="#C7FF41" strokeWidth={1.5} />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={2.5} fill="#C7FF41" />)}
      </svg>
      <div className="flex justify-between mt-2 font-mono text-[9px] text-white/40">
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

/* ---------------- LeetCode Analytics ---------------- */
function LeetCodeAnalytics() {
  return (
    <section className="py-20 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader tag="◇ LeetCode / Analytics" title="Problem-solving signal" subtitle="650 problems solved across 14 contest seasons." />
        <div className="mt-10 grid lg:grid-cols-4 gap-px bg-white/8 border hairline">
          <StatBlock k="2,148" v="Contest Rating" sub="Knight Tier" />
          <StatBlock k="#12,420" v="Global Ranking" sub="Top 8%" />
          <StatBlock k="650" v="Problems Solved" sub="Across all topics" />
          <StatBlock k="14" v="Contests" sub="Last 12 mo" />
        </div>

        <div className="mt-px grid lg:grid-cols-2 gap-px bg-white/8 border-x hairline border-b">
          <div className="bg-[#141414] p-6 lg:p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Difficulty Distribution
            </div>
            <div className="space-y-4">
              {[
                ["Easy", 218, "rgba(199,255,65,0.4)"],
                ["Medium", 312, "#C7FF41"],
                ["Hard", 120, "#C7FF41"],
              ].map(([l, n, c]) => (
                <div key={l as string}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="font-mono text-xs text-white/75">{l}</span>
                    <span className="font-mono text-xs text-white/50 tabular-nums">{n} solved</span>
                  </div>
                  <div className="h-2 bg-white/5">
                    <div className="h-full" style={{ width: `${(n as number / 650) * 100}%`, background: c as string }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t hairline grid grid-cols-3 gap-4">
              <Mini k="92%" v="Acceptance" />
              <Mini k="38d" v="Max Streak" />
              <Mini k="142h" v="Total time" />
            </div>
          </div>

          <div className="bg-[#141414] p-6 lg:p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Contest Rating · History
            </div>
            <LineChart
              values={[1620, 1684, 1742, 1810, 1788, 1865, 1922, 1980, 1955, 2020, 2088, 2148]}
              labels={["c1","c2","c3","c4","c5","c6","c7","c8","c9","c10","c11","c12"]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBlock({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="bg-[#141414] p-6 lg:p-8">
      <div className="font-mono text-[10px] uppercase tracking-widest text-white/45 mb-2">{v}</div>
      <div className="font-display text-4xl font-semibold tracking-tight text-neon neon-text-glow">{k}</div>
      <div className="font-mono text-[10px] text-white/40 mt-2">{sub}</div>
    </div>
  );
}

/* ---------------- Connected Projects ---------------- */
const PROJECTS = [
  {
    name: "orbit/scheduler",
    desc: "Distributed cron and job scheduler with horizontal sharding.",
    lang: "Go",
    stack: ["Go", "Postgres", "Raft", "gRPC"],
    summary: "A production-grade distributed cron system used by 3 mid-size companies. Demonstrates strong understanding of consensus protocols and fault tolerance.",
    stars: "4.2k",
    status: "LIVE",
  },
  {
    name: "ledger-rs",
    desc: "Append-only double-entry ledger written in Rust for payment systems.",
    lang: "Rust",
    stack: ["Rust", "RocksDB", "Tokio"],
    summary: "Performance-critical financial primitive. Sub-millisecond p99 writes. Used internally for transaction reconciliation.",
    stars: "2.1k",
    status: "LIVE",
  },
  {
    name: "kube-canary",
    desc: "Progressive delivery controller for Kubernetes deployments.",
    lang: "Go",
    stack: ["Go", "K8s", "Prometheus"],
    summary: "Kubernetes operator that automates canary rollouts based on Prometheus metrics. Strong devops + platform signal.",
    stars: "890",
    status: "ACTIVE",
  },
  {
    name: "pgstream",
    desc: "Postgres change-data-capture to Kafka with schema evolution.",
    lang: "Go",
    stack: ["Go", "Postgres", "Kafka"],
    summary: "Streaming infrastructure tool. Shows depth in database internals and event-driven architecture.",
    stars: "1.4k",
    status: "LIVE",
  },
  {
    name: "tinyvec",
    desc: "Vector database in 2k lines of Rust. Educational.",
    lang: "Rust",
    stack: ["Rust", "HNSW"],
    summary: "Compact, well-documented vector index implementation. Strong fundamentals signal.",
    stars: "620",
    status: "ARCHIVED",
  },
  {
    name: "profyl-cli",
    desc: "Local-first CLI to preview your Profyl identity before publishing.",
    lang: "TypeScript",
    stack: ["TS", "Bun", "Ink"],
    summary: "Side project. Built in a weekend. Demonstrates polish on tooling and DX.",
    stars: "180",
    status: "BETA",
  },
];

function ConnectedProjects() {
  return (
    <section id="projects" className="py-20 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader tag="◇ Connected Projects" title="What's actually been shipped" subtitle="Auto-detected from GitHub. Tech stack inferred. AI summaries generated." />
        <div className="mt-10 grid md:grid-cols-2 gap-px bg-white/8">
          {PROJECTS.map((p) => (
            <div key={p.name} className="group bg-[#0D0D0D] p-6 lg:p-8 hover:bg-[#121212] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-display text-xl font-semibold tracking-tight">
                    {p.name}
                  </div>
                  <div className="font-mono text-[10px] text-white/40 mt-1">
                    ★ {p.stars} · {p.lang}
                  </div>
                </div>
                <span className={`font-mono text-[9px] px-2 py-1 border ${p.status === "LIVE" ? "border-neon text-neon" : "hairline text-white/50"}`}>
                  {p.status}
                </span>
              </div>
              <p className="text-white/65 leading-relaxed text-sm">{p.desc}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <span key={s} className="font-mono text-[10px] px-1.5 py-0.5 border hairline text-white/70">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t hairline">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neon mb-2">
                  ◇ AI summary
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-white/60">
                  {p.summary}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-3 font-mono text-[11px]">
                <a href="#" className="text-white/70 hover:text-neon">github↗</a>
                <a href="#" className="text-white/70 hover:text-neon">demo↗</a>
              </div>
            </div>
          ))}
        </div>
        <UnderTheHood />
      </div>
    </section>
  );
}

/* ---------------- Under the Hood ---------------- */
/* Derived from the existing PROJECTS mock data. Swappable for real analysis output. */
const CAPABILITY_MAP: { label: string; tech: string[] }[] = [
  { label: "Distributed Systems", tech: ["Raft", "Kafka", "K8s", "Cron"] },
  { label: "Databases", tech: ["Postgres", "RocksDB", "HNSW"] },
  { label: "APIs & Integrations", tech: ["gRPC", "Kafka"] },
  { label: "Infrastructure", tech: ["K8s", "Prometheus"] },
  { label: "Systems Programming", tech: ["Rust", "Tokio", "Go"] },
  { label: "Observability", tech: ["Prometheus"] },
  { label: "Developer Tooling", tech: ["TS", "Bun", "Ink"] },
];

const CAPABILITIES = CAPABILITY_MAP.map((c) => ({
  label: c.label,
  count: PROJECTS.filter((p) => p.stack.some((s) => c.tech.includes(s))).length,
}))
  .filter((c) => c.count > 0)
  .sort((a, b) => b.count - a.count);

const TECHNOLOGIES = Array.from(new Set(PROJECTS.flatMap((p) => p.stack)));
const TECH_PREVIEW = 8;

function UnderTheHood() {
  const [open, setOpen] = useState(false);
  const [allTech, setAllTech] = useState(false);
  const tech = allTech ? TECHNOLOGIES : TECHNOLOGIES.slice(0, TECH_PREVIEW);
  const hiddenTech = TECHNOLOGIES.length - TECH_PREVIEW;

  return (
    <div className="mt-10">
      <div className="group border border-[#C7FF41]/20 hover:border-[#C7FF41]/35 bg-[#C7FF41]/[0.02] rounded-md [box-shadow:inset_0_0_28px_-18px_rgba(199,255,65,0.55)] transition-colors">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-6 px-5 py-4 text-left"
        >
          <div className="min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-neon">
              Under the hood
            </div>
            <div className="font-display text-sm sm:text-base font-medium tracking-tight text-white/90 mt-1">
              What Profyl found across your projects
            </div>
          </div>
          <span className="shrink-0 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 group-hover:text-neon transition-colors">
            <span className="hidden sm:inline">View findings</span>
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            >
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        <div
          className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="px-5 pb-5">
              <div className="h-px bg-[#C7FF41]/12" />

              <div className="pt-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  / Engineering capabilities
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {CAPABILITIES.map((c) => (
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

              <div className="my-4 h-px bg-white/8" />

              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                  / Technologies found
                </div>
                <div className="mt-2 font-mono text-[11px] leading-relaxed text-white/55">
                  {tech.map((t, i) => (
                    <span key={t}>
                      {i > 0 && <span className="text-white/20"> · </span>}
                      <span className="text-white/70">{t}</span>
                    </span>
                  ))}
                  {!allTech && hiddenTech > 0 && (
                    <button
                      onClick={() => setAllTech(true)}
                      className="ml-2 text-white/40 hover:text-neon transition-colors"
                    >
                      + {hiddenTech} more
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
                Based on analysis of your repositories
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




/* ---------------- Technical Insights ---------------- */
function TechnicalInsights() {
  return (
    <section className="py-20 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader tag="◇ Technical Insights" title="Patterns across the work" subtitle="What the connected data reveals about how Alex builds." />

        <div className="mt-10 grid lg:grid-cols-2 gap-px bg-white/8 border hairline">
          <div className="bg-[#141414] p-6 lg:p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Repository Ecosystem
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                ["Infrastructure", 11],
                ["Libraries", 7],
                ["CLI Tools", 4],
                ["Web", 2],
                ["Docs", 1],
              ].map(([l, n]) => (
                <div key={l as string} className="border hairline p-4">
                  <div className="font-display text-2xl font-semibold">{n}</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-white/45 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#141414] p-6 lg:p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/55 mb-6">
              Build Cadence · Weekly commits
            </div>
            <LineChart
              values={[12, 18, 15, 22, 28, 24, 31, 26, 33, 29, 36, 41, 38, 44, 49, 42]}
              labels={["w1","w2","w3","w4","w5","w6","w7","w8","w9","w10","w11","w12","w13","w14","w15","w16"]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Developer Signals ---------------- */
const SIGNALS = [
  { n: "GitHub", h: "@alexkarim", v: "1,247 contribs · 25 repos" },
  { n: "LeetCode", h: "alex_k", v: "650 solved · 2148 rating" },
  { n: "Resume", h: "alex-karim.pdf", v: "Parsed · 6y XP verified" },
  { n: "Projects", h: "8 connected", v: "4 live deployments" },
];

function DeveloperSignals() {
  return (
    <section className="py-20 border-t hairline relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader tag="◇ Developer Signals" title="Connected sources" subtitle="Every claim on this page is backed by a verified signal." />
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/8 border hairline">
          {SIGNALS.map((s) => (
            <div key={s.n} className="bg-[#141414] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-lg font-semibold">{s.n}</span>
                <span className="size-2 bg-neon rounded-full animate-pulse-neon" />
              </div>
              <div className="font-mono text-xs text-white/80">{s.h}</div>
              <div className="font-mono text-[10px] text-white/45 mt-1">{s.v}</div>
              <div className="mt-5 pt-4 border-t hairline flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-neon">✓ Verified</span>
                <span className="font-mono text-[9px] text-white/40">Synced 2h ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Philosophy ---------------- */
function Philosophy() {
  return (
    <section className="py-32 lg:py-40 border-t hairline">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon mb-8">
          ◇ Manifesto / 002
        </div>
        <p className="font-display font-semibold tracking-[-0.02em] text-3xl md:text-4xl lg:text-5xl leading-[1.15] text-white/90 max-w-3xl mx-auto">
          Resumes tell you what a developer{" "}
          <span className="text-white/40">says they've done.</span>{" "}
          <br className="hidden md:block" />
          Profyl shows what they've{" "}
          <span className="text-neon italic">actually built, solved, and contributed.</span>
        </p>
        <div className="mt-16 pt-12 border-t hairline">
          <p className="font-display font-semibold tracking-[-0.02em] text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
            We don't believe in <span className="text-white/30">10x developers.</span> <br />
            We believe in <span className="text-neon italic">visible</span> ones.
          </p>
        </div>
        <div className="mt-16">
          <Link to="/" className="inline-flex items-center gap-2 bg-neon text-[#0D0D0D] font-semibold px-6 py-3.5 text-sm hover:opacity-90 transition">
            Build Your Own Profyl <span className="font-mono">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex items-center gap-2.5">
          <img src={profylLogo.url} alt="Profyl logo" className="size-6 object-contain" />
          <span className="font-display font-semibold">profyl</span>
          <span className="font-mono text-[10px] text-white/40 ml-2">© 2026 — Berlin / SF</span>
        </div>
        <div className="flex gap-6 font-mono text-[11px] uppercase tracking-widest text-white/50">
          <Link to="/" className="hover:text-neon">Home</Link>
          <a href="#" className="hover:text-neon">Twitter</a>
          <a href="#" className="hover:text-neon">GitHub</a>
          <a href="#" className="hover:text-neon">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
