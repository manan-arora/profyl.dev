import { useEffect, useMemo, useState } from "react";
import profylLogo from "@/assets/profyl-logo.png.asset.json";

type Repo = {
  id: string;
  name: string;
  description: string;
  language: string;
  stack: string[];
  stars: number;
  updated: string;
};

const REPOS: Repo[] = [
  {
    id: "r1",
    name: "vector-cache",
    description: "Low-latency embedding cache with LRU eviction and disk-backed persistence.",
    language: "Rust",
    stack: ["Tokio", "Redis", "gRPC"],
    stars: 1284,
    updated: "2 days ago",
  },
  {
    id: "r2",
    name: "orbit-ui",
    description: "Headless React primitives for dense data interfaces and keyboard-first flows.",
    language: "TypeScript",
    stack: ["React", "Vite", "Radix"],
    stars: 842,
    updated: "5 days ago",
  },
  {
    id: "r3",
    name: "kubeforge",
    description: "Declarative cluster bootstrapper that compiles manifests from a single spec file.",
    language: "Go",
    stack: ["Kubernetes", "Helm", "CUE"],
    stars: 613,
    updated: "1 week ago",
  },
  {
    id: "r4",
    name: "sift",
    description: "Streaming log query engine with a SQL-like grammar and sub-second scans.",
    language: "Go",
    stack: ["Parquet", "Arrow"],
    stars: 397,
    updated: "2 weeks ago",
  },
  {
    id: "r5",
    name: "neural-sketch",
    description: "Diffusion-based sketch-to-render pipeline with deterministic seeds.",
    language: "Python",
    stack: ["PyTorch", "CUDA", "FastAPI"],
    stars: 2109,
    updated: "3 days ago",
  },
  {
    id: "r6",
    name: "ledgerlite",
    description: "Double-entry accounting core with immutable journals and audit replay.",
    language: "TypeScript",
    stack: ["Postgres", "Drizzle"],
    stars: 268,
    updated: "1 month ago",
  },
  {
    id: "r7",
    name: "edge-router",
    description: "Zero-config HTTP router for edge runtimes with typed route params.",
    language: "TypeScript",
    stack: ["Workers", "Hono"],
    stars: 512,
    updated: "6 days ago",
  },
  {
    id: "r8",
    name: "dsa-atlas",
    description: "Annotated solutions and complexity notes for 900+ algorithm problems.",
    language: "C++",
    stack: ["CMake", "GoogleTest"],
    stars: 1740,
    updated: "4 days ago",
  },
  {
    id: "r9",
    name: "pulse-metrics",
    description: "Lightweight metrics agent emitting OpenTelemetry from bare-metal hosts.",
    language: "Rust",
    stack: ["OTel", "Prometheus"],
    stars: 156,
    updated: "3 weeks ago",
  },
];

const MAX = 4;

export function OnboardingProjects() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const repos = REPOS;
  const full = selected.length >= MAX;
  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length >= MAX ? s : [...s, id],
    );

  const counter = useMemo(() => `${selected.length} of ${MAX} selected`, [selected.length]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-foreground font-sans overflow-x-hidden">
      <div className="relative">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />

        <header className="relative border-b hairline">
          <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            <div className="flex items-end gap-2">
              <img src={profylLogo.url} alt="Profyl" className="size-7 object-contain" />
              <span className="font-display font-semibold tracking-tight text-lg leading-none mb-0.5">
                profyl
              </span>
              <span className="font-mono text-[10px] text-neon mb-1">v1.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-1.5 bg-neon rounded-full animate-pulse-neon" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                Step 02 · Featured Projects
              </span>
            </div>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl px-6 pt-16 pb-40">
          <div className="max-w-2xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon mb-5">
              ◇ GitHub sync complete · {repos.length} eligible repositories
            </div>
            <h1 className="font-display font-semibold tracking-[-0.025em] text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02]">
              Choose your <span className="text-neon neon-text-glow italic">featured</span> projects
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-white/60 max-w-lg">
              Select up to 4 repositories to showcase on your public Profyl. You can change them
              later from your dashboard.
            </p>
          </div>

          <div className="mt-14">
            {loading ? (
              <SkeletonGrid />
            ) : repos.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-px bg-white/[0.07] border hairline sm:grid-cols-2 lg:grid-cols-3">
                {repos.map((r) => (
                  <RepoCard
                    key={r.id}
                    repo={r}
                    selected={selected.includes(r.id)}
                    index={selected.indexOf(r.id)}
                    disabled={full && !selected.includes(r.id)}
                    onToggle={() => toggle(r.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t hairline bg-[#0D0D0D]/95 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 h-20 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: MAX }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      "h-[3px] w-7 transition-colors " +
                      (i < selected.length ? "bg-neon" : "bg-white/15")
                    }
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 tabular-nums">
                {counter}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                Editable later in dashboard
              </span>
              <button
                type="button"
                disabled={selected.length === 0}
                className="inline-flex items-center gap-2 bg-neon text-[#0D0D0D] px-6 py-3 text-sm font-semibold transition disabled:opacity-25 disabled:cursor-not-allowed hover:opacity-90"
              >
                Continue <span className="font-mono">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RepoCard({
  repo,
  selected,
  index,
  disabled,
  onToggle,
}: {
  repo: Repo;
  selected: boolean;
  index: number;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={
        "group relative text-left p-6 min-h-[210px] flex flex-col transition-colors outline-none " +
        (selected
          ? "bg-[#141A0C] ring-1 ring-inset ring-neon z-10"
          : disabled
            ? "bg-[#0D0D0D] opacity-30 cursor-not-allowed"
            : "bg-[#0D0D0D] hover:bg-white/[0.03] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/30")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display font-semibold tracking-tight text-[17px] truncate">
            {repo.name}
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45">
            <span className="size-1.5 bg-neon rounded-full" />
            {repo.language}
          </div>
        </div>
        <span
          className={
            "shrink-0 size-5 border flex items-center justify-center font-mono text-[10px] transition " +
            (selected
              ? "border-neon bg-neon text-[#0D0D0D] font-semibold"
              : "border-white/20 text-transparent")
          }
        >
          {selected ? index + 1 : "•"}
        </span>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-white/55 line-clamp-3">
        {repo.description}
      </p>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap gap-1.5">
          {repo.stack.map((t) => (
            <span
              key={t}
              className={
                "font-mono text-[9px] uppercase tracking-widest px-2 py-1 border " +
                (selected ? "border-neon/40 text-neon/80" : "border-white/12 text-white/55")
              }
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-white/40">
          <span className="tabular-nums">★ {repo.stars.toLocaleString()}</span>
          <span className="uppercase tracking-widest">Updated {repo.updated}</span>
        </div>
      </div>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-px bg-white/[0.07] border hairline sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#0D0D0D] p-6 min-h-[210px] flex flex-col">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <div className="h-4 w-1/2 bg-white/[0.07] animate-pulse-neon" />
              <div className="mt-3 h-2.5 w-20 bg-white/[0.05] animate-pulse-neon" />
            </div>
            <div className="size-5 border border-white/10" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-2.5 w-full bg-white/[0.05] animate-pulse-neon" />
            <div className="h-2.5 w-4/5 bg-white/[0.05] animate-pulse-neon" />
          </div>
          <div className="mt-auto pt-6 flex gap-1.5">
            <div className="h-5 w-14 bg-white/[0.05]" />
            <div className="h-5 w-12 bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border hairline bg-[#0D0D0D] px-8 py-20 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
        No signal detected
      </div>
      <h2 className="mt-5 font-display font-semibold tracking-tight text-2xl">
        No repositories found
      </h2>
      <p className="mt-3 text-sm text-white/50 max-w-md mx-auto leading-relaxed">
        We couldn't find any eligible public repositories in your GitHub account.
      </p>
      <div className="mt-8 inline-flex items-center gap-2 border border-white/15 px-5 py-3 text-sm font-medium hover:border-neon hover:text-neon transition">
        Re-sync GitHub <span className="font-mono">↻</span>
      </div>
    </div>
  );
}
