import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import profylLogo from "@/assets/profyl-logo.png.asset.json";
import { ProfylProfile } from "@/components/profyl/ProfylProfile";

type PageKey = "profile" | "projects" | "preview";

const NAV: { key: PageKey; label: string; code: string }[] = [
  { key: "profile", label: "Profile", code: "01" },
  { key: "projects", label: "Projects", code: "02" },
  { key: "preview", label: "Preview Profile", code: "03" },
];

/* ---------- Dirty-state (global save) context ---------- */

type SaveState = "idle" | "unsaved" | "saved";
type DirtyCtx = {
  state: SaveState;
  markDirty: () => void;
  save: () => void;
  discard: () => void;
};
const DirtyContext = createContext<DirtyCtx | null>(null);
function useDirty() {
  const ctx = useContext(DirtyContext);
  if (!ctx) throw new Error("DirtyContext missing");
  return ctx;
}

/* ---------- Root ---------- */

export function ProfylDashboard() {
  const [page, setPage] = useState<PageKey>("profile");
  const [state, setState] = useState<SaveState>("idle");
  const [pendingPage, setPendingPage] = useState<PageKey | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // discard-token forces uncontrolled inputs to reset to defaults when discarded
  const [resetToken, setResetToken] = useState(0);

  const markDirty = useCallback(() => {
    setState((s) => (s === "unsaved" ? s : "unsaved"));
  }, []);
  const save = useCallback(() => {
    setState("saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setState("idle"), 2200);
  }, []);
  const discard = useCallback(() => {
    setState("idle");
    setResetToken((t) => t + 1);
  }, []);

  const dirty: DirtyCtx = { state, markDirty, save, discard };

  const requestPage = (next: PageKey) => {
    if (next === "preview" && state === "unsaved") {
      setPendingPage(next);
      return;
    }
    setPage(next);
  };

  const title =
    page === "profile" ? "Profile" : page === "projects" ? "Projects" : "Preview Profile";

  return (
    <DirtyContext.Provider value={dirty}>
      <div className="min-h-screen bg-[#0D0D0D] text-foreground font-sans">
        <div className="flex min-h-screen">
          <Sidebar page={page} setPage={requestPage} />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar title={title} />
            <main className="relative flex-1 overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_80%)]" />
              <div
                className={
                  page === "preview"
                    ? "relative"
                    : "relative mx-auto max-w-[1200px] px-6 lg:px-10 py-10 lg:py-14"
                }
              >
                {page === "profile" && <ProfilePage key={resetToken} />}
                {page === "projects" && <ProjectsPage />}
                {page === "preview" && <PreviewPage />}
              </div>
            </main>
          </div>
        </div>

        {pendingPage && (
          <UnsavedChangesModal
            onCancel={() => setPendingPage(null)}
            onDiscard={() => {
              discard();
              setPage(pendingPage);
              setPendingPage(null);
            }}
            onSave={() => {
              save();
              setPage(pendingPage);
              setPendingPage(null);
            }}
          />
        )}
      </div>
    </DirtyContext.Provider>
  );
}

/* ---------- Sidebar ---------- */

function Sidebar({
  page,
  setPage,
}: {
  page: PageKey;
  setPage: (p: PageKey) => void;
}) {
  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r hairline bg-[#0D0D0D] sticky top-0 h-screen">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b hairline">
        <img src={profylLogo.url} alt="Profyl" className="size-6 object-contain" />
        <span className="font-display font-semibold tracking-tight text-base">profyl</span>
        <span className="font-mono text-[10px] text-neon ml-1 mt-0.5">v1.0</span>
      </div>

      <div className="px-4 pt-6 pb-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 px-2">
          Console
        </div>
      </div>

      <nav className="px-3 flex-1 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-all ${
                active
                  ? "text-white border hairline bg-white/[0.02]"
                  : "text-white/55 hover:text-white border border-transparent"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] transition-all ${
                  active ? "bg-neon" : "bg-transparent"
                }`}
              />
              <span className="font-mono text-[10px] text-white/40 w-5">{item.code}</span>
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t hairline p-4">
        <div className="flex items-center gap-3">
          <div className="size-9 border hairline bg-white/[0.03] flex items-center justify-center font-mono text-[11px] text-neon">
            AK
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">alexkarim</div>
            <div className="font-mono text-[10px] text-white/40">SESSION · ACTIVE</div>
          </div>
        </div>
        <button className="mt-3 w-full text-left font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 hover:text-white transition-colors">
          → Logout
        </button>
      </div>
    </aside>
  );
}

/* ---------- Top Bar ---------- */

function TopBar({ title }: { title: string }) {
  const { state, save } = useDirty();

  return (
    <header className="sticky top-0 z-20 h-16 border-b hairline bg-[#0D0D0D]/85 backdrop-blur-md">
      <div className="h-full px-6 lg:px-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Dashboard /
          </span>
          <h1 className="font-display font-semibold tracking-tight text-lg truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden sm:inline-flex items-center gap-2 border hairline px-3 py-2 text-xs text-white/75 hover:text-white hover:bg-white/[0.03] transition">
            <span className="size-1.5 rounded-full bg-neon animate-pulse-neon" />
            Sync GitHub
          </button>
          <Link
            to="/alexkarim"
            className="hidden sm:inline-flex items-center gap-2 border hairline px-3 py-2 text-xs text-white/75 hover:text-white hover:bg-white/[0.03] transition"
          >
            View Public Profile ↗
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            {state === "unsaved" && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                <span className="size-1.5 bg-neon rounded-full animate-pulse-neon" />
                Unsaved changes
              </span>
            )}
            {state === "saved" && (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neon">
                Saved ✓
              </span>
            )}
            <button
              onClick={save}
              disabled={state !== "unsaved"}
              className={`text-xs font-semibold px-4 py-2 transition ${
                state === "unsaved"
                  ? "bg-neon text-[#0D0D0D] hover:opacity-90"
                  : "border hairline text-white/40 cursor-not-allowed"
              }`}
            >
              Save Changes →
            </button>
          </div>

          <CompletionPill percent={72} />
        </div>
      </div>
    </header>
  );
}

function CompletionPill({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2 border hairline px-3 py-1.5">
      <div className="relative h-1.5 w-20 bg-white/10">
        <div className="absolute inset-y-0 left-0 bg-neon" style={{ width: `${percent}%` }} />
      </div>
      <span className="font-mono text-[10px] text-white/70">{percent}% COMPLETE</span>
    </div>
  );
}

/* ---------- Shared module card ---------- */

function ModuleCard({
  label,
  actions,
  children,
}: {
  label: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="relative border hairline bg-[#111111]">
      <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
      <div className="relative flex items-center justify-between px-5 py-3 border-b hairline">
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-neon" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
            {label}
          </span>
        </div>
        {actions}
      </div>
      <div className="relative p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
          {label}
        </span>
        {hint && <span className="font-mono text-[10px] text-white/30">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-transparent border hairline px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon/60 focus:bg-white/[0.02] transition";

/* Dirty-tracking wrappers: use these instead of raw <input>/<textarea>/<select>
   so any edit flips global state to "unsaved". */
function DInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { markDirty } = useDirty();
  return (
    <input
      {...props}
      onInput={(e) => {
        markDirty();
        props.onInput?.(e);
      }}
    />
  );
}
function DTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { markDirty } = useDirty();
  return (
    <textarea
      {...props}
      onInput={(e) => {
        markDirty();
        props.onInput?.(e);
      }}
    />
  );
}
function DSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { markDirty } = useDirty();
  return (
    <select
      {...props}
      onChange={(e) => {
        markDirty();
        props.onChange?.(e);
      }}
    />
  );
}

/* ---------- Profile Page ---------- */

function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Identity Configuration"
        title="Configure your developer identity."
        sub="Every field feeds your public Profyl report. Precision beats volume."
      />

      {/* Basic */}
      <ModuleCard label="Profile / Basic Info">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="shrink-0">
            <div className="size-24 border hairline bg-white/[0.03] flex items-center justify-center relative">
              <span className="font-display text-2xl text-neon">AK</span>
              <span className="absolute -bottom-2 -right-2 border hairline bg-[#0D0D0D] px-1.5 py-0.5 font-mono text-[9px] text-neon">
                GH
              </span>
            </div>
            <button className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 hover:text-white transition">
              Sync from GitHub
            </button>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Full Name">
              <DInput className={inputCls} defaultValue="Alex Karim" />
            </Field>
            <Field label="Headline">
              <DInput
                className={inputCls}
                defaultValue="Senior Backend / Platform Engineer"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Bio" hint="max 240 chars">
                <DTextarea
                  rows={3}
                  className={inputCls + " resize-none"}
                  defaultValue="Backend engineer passionate about distributed systems and developer tooling."
                />
              </Field>
            </div>
          </div>
        </div>
      </ModuleCard>

      {/* Professional */}
      <ModuleCard label="Profile / Professional">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Current Role">
            <DSelect className={inputCls} defaultValue="Backend Engineer">
              <option>Student</option>
              <option>Software Engineer</option>
              <option>Backend Engineer</option>
              <option>Frontend Engineer</option>
              <option>Full-Stack Engineer</option>
              <option>Platform Engineer</option>
              <option>Freelance Developer</option>
            </DSelect>
          </Field>
          <Field label="Current Company">
            <DInput className={inputCls} placeholder="e.g. Vercel" defaultValue="Independent" />
          </Field>
          <Field label="Years of Experience">
            <DInput className={inputCls} type="number" min={0} defaultValue={5} />
          </Field>
        </div>
      </ModuleCard>

      {/* Education */}
      <ModuleCard label="Profile / Education">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="College / University">
            <DInput className={inputCls} placeholder="e.g. IIT Bombay" />
          </Field>
          <Field label="Branch">
            <DInput className={inputCls} placeholder="e.g. Computer Science" />
          </Field>
          <Field label="Graduation Year">
            <DInput className={inputCls} type="number" placeholder="2024" />
          </Field>
        </div>
      </ModuleCard>

      {/* Tech Stack */}
      <TechStackCard />

      {/* Links */}
      <ModuleCard label="Profile / Links">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-3">
              Auto Connected
            </div>
            <div className="flex flex-col gap-2">
              <ConnectedLink name="GitHub" handle="@alexkarim" />
              <ConnectedLink name="LeetCode" handle="alex_k" />
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-3">
              Manual Links
            </div>
            <div className="flex flex-col gap-4">
              <Field label="LinkedIn URL">
                <DInput className={inputCls} placeholder="https://linkedin.com/in/…" />
              </Field>
              <Field label="Portfolio Website URL">
                <DInput className={inputCls} placeholder="https://…" />
              </Field>
            </div>
          </div>
        </div>
      </ModuleCard>

      {/* Resume */}
      <ModuleCard label="Profile / Resume">
        <div className="flex flex-col md:flex-row md:items-center gap-5 justify-between border hairline p-5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="size-11 border hairline flex items-center justify-center font-mono text-[10px] text-neon">
              PDF
            </div>
            <div>
              <div className="text-sm">alex-karim-resume-2026.pdf</div>
              <div className="font-mono text-[10px] text-white/40 mt-0.5">
                214 KB · uploaded 3d ago
              </div>
            </div>
            <span className="ml-2 border hairline px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] text-neon">
              VERIFIED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="border hairline px-3 py-2 text-xs text-white/75 hover:text-white hover:bg-white/[0.03] transition">
              Replace
            </button>
            <button className="border hairline px-3 py-2 text-xs text-white/50 hover:text-white transition">
              Remove
            </button>
          </div>
        </div>
        <p className="mt-4 font-mono text-[10px] text-white/35">
          PDF only · max 5MB · parsed for skills, roles, and timeline
        </p>
      </ModuleCard>
    </div>
  );
}

function PageIntro({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-2">
      <div className="inline-flex items-center gap-2 border hairline px-3 py-1.5">
        <span className="size-1.5 bg-neon rounded-full animate-pulse-neon" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-5 font-display font-semibold tracking-[-0.02em] text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1]">
        {title}
      </h2>
      <p className="mt-3 text-white/55 max-w-2xl">{sub}</p>
    </div>
  );
}

function ConnectedLink({ name, handle }: { name: string; handle: string }) {
  return (
    <div className="flex items-center justify-between border hairline px-4 py-3 bg-white/[0.02]">
      <div className="flex items-center gap-3">
        <div className="size-8 border hairline flex items-center justify-center font-mono text-[10px] text-neon">
          {name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="text-sm">{name}</div>
          <div className="font-mono text-[10px] text-white/40">{handle}</div>
        </div>
      </div>
      <span className="border hairline px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] text-neon">
        VERIFIED
      </span>
    </div>
  );
}

/* ---------- Tech stack ---------- */

const ALL_TECH = [
  "React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "AWS",
  "Rust", "Go", "Python", "Docker", "Kubernetes", "Redis",
  "GraphQL", "tRPC", "Vite", "Tailwind", "Supabase", "Prisma",
];

function TechStackCard() {
  const { markDirty } = useDirty();
  const [selected, setSelected] = useState<string[]>([
    "TypeScript", "Node.js", "PostgreSQL", "Rust", "Docker",
  ]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_TECH.filter(
      (t) => !selected.includes(t) && (q === "" || t.toLowerCase().includes(q)),
    ).slice(0, 6);
  }, [query, selected]);

  function add(t: string) {
    if (selected.length >= 8) return;
    setSelected((s) => [...s, t]);
    setQuery("");
    markDirty();
  }
  function remove(t: string) {
    setSelected((s) => s.filter((x) => x !== t));
    markDirty();
  }

  return (
    <ModuleCard
      label="Profile / Tech Stack"
      actions={
        <span className="font-mono text-[10px] text-white/40">{selected.length}/8</span>
      }
    >
      <div className="flex flex-wrap gap-2">
        {selected.map((t) => (
          <span
            key={t}
            className="group inline-flex items-center gap-2 border hairline px-3 py-1.5 text-xs bg-white/[0.02]"
          >
            <span className="size-1 bg-neon" />
            {t}
            <button
              onClick={() => remove(t)}
              className="text-white/40 hover:text-white ml-1 font-mono text-[11px]"
              aria-label={`Remove ${t}`}
            >
              ×
            </button>
          </span>
        ))}
        {selected.length === 0 && (
          <span className="font-mono text-[10px] text-white/35">no technologies selected</span>
        )}
      </div>

      <div className="relative mt-5 max-w-sm">
        <input
          className={inputCls}
          placeholder={selected.length >= 8 ? "Max reached — remove one to add" : "Search technology…"}
          value={query}
          disabled={selected.length >= 8}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
        {open && results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full border hairline bg-[#111] max-h-56 overflow-auto">
            {results.map((t) => (
              <button
                key={t}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(t);
                }}
                className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/[0.04] hover:text-white flex items-center justify-between"
              >
                <span>{t}</span>
                <span className="font-mono text-[10px] text-neon">+ add</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </ModuleCard>
  );
}

/* ---------- Projects Page ---------- */

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
    id: "orbit-scheduler",
    name: "orbit/scheduler",
    description: "Distributed job scheduler with at-least-once semantics.",
    language: "Rust",
    stack: ["Rust", "PostgreSQL", "Redis"],
    stars: 1284,
    updated: "2d ago",
  },
  {
    id: "ledger-rs",
    name: "ledger-rs",
    description: "Zero-copy double-entry ledger for high-throughput services.",
    language: "Rust",
    stack: ["Rust", "gRPC"],
    stars: 842,
    updated: "5d ago",
  },
  {
    id: "profyl-cli",
    name: "profyl/cli",
    description: "CLI companion for the Profyl identity platform.",
    language: "TypeScript",
    stack: ["TypeScript", "Node.js"],
    stars: 214,
    updated: "1w ago",
  },
  {
    id: "vector-hop",
    name: "vector-hop",
    description: "Streaming vector index built for edge runtimes.",
    language: "Go",
    stack: ["Go", "WASM"],
    stars: 431,
    updated: "2w ago",
  },
  {
    id: "shard-lite",
    name: "shard-lite",
    description: "Minimal application-level sharding library for Postgres.",
    language: "TypeScript",
    stack: ["TypeScript", "PostgreSQL"],
    stars: 96,
    updated: "3w ago",
  },
];

function ProjectsPage() {
  const { markDirty } = useDirty();
  const [featured, setFeatured] = useState<string[]>([
    "orbit-scheduler", "ledger-rs", "profyl-cli",
  ]);
  const [editing, setEditing] = useState<Repo | null>(null);

  function toggleFeature(id: string) {
    setFeatured((f) => {
      if (f.includes(id)) return f.filter((x) => x !== id);
      if (f.length >= 4) return f;
      return [...f, id];
    });
    markDirty();
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    setFeatured((f) => {
      const copy = [...f];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    markDirty();
  }

  const featuredRepos = featured
    .map((id) => REPOS.find((r) => r.id === id)!)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Repository Curation"
        title="Curate the code recruiters see."
        sub="Feature up to four repositories. The rest inform your identity score in the background."
      />

      {/* Header stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border hairline bg-[#111] px-5 py-4">
        <div>
          <div className="font-display text-2xl">
            42 <span className="text-white/40 text-base font-sans">repositories fetched</span>
          </div>
          <div className="font-mono text-[10px] text-white/40 mt-1">
            Showing public repositories · sorted by recently updated · forks & archived excluded
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-neon rounded-full animate-pulse-neon" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
            Synced 12 min ago
          </span>
        </div>
      </div>

      {/* Featured */}
      <ModuleCard
        label="Projects / Featured"
        actions={
          <span className="font-mono text-[10px] text-white/40">
            {featured.length}/4 · drag to reorder
          </span>
        }
      >
        {featuredRepos.length === 0 ? (
          <div className="font-mono text-[10px] text-white/35">
            No featured projects. Toggle repositories below to feature them.
          </div>
        ) : (
          <FeaturedGrid repos={featuredRepos} onReorder={reorder} />
        )}
      </ModuleCard>

      {/* Repo list */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 px-1">
          Projects / All Repositories
        </div>
        {REPOS.map((r) => (
          <RepoCard
            key={r.id}
            repo={r}
            featured={featured.includes(r.id)}
            canFeature={featured.length < 4 || featured.includes(r.id)}
            onToggle={() => toggleFeature(r.id)}
            onEdit={() => setEditing(r)}
          />
        ))}
      </div>

      {editing && <EditProjectModal repo={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ---------- Featured grid (drag & drop) ---------- */

function FeaturedGrid({
  repos,
  onReorder,
}: {
  repos: Repo[];
  onReorder: (from: number, to: number) => void;
}) {
  const dragFrom = useRef<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {repos.map((r, i) => {
        const isDragging = dragging === i;
        const isOver = over === i && dragging !== i;
        return (
          <div
            key={r.id}
            draggable
            onDragStart={(e) => {
              dragFrom.current = i;
              setDragging(i);
              e.dataTransfer.effectAllowed = "move";
              // Firefox requires data to be set
              e.dataTransfer.setData("text/plain", r.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOver(i);
            }}
            onDragLeave={() => setOver((cur) => (cur === i ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragFrom.current;
              if (from !== null) onReorder(from, i);
              dragFrom.current = null;
              setDragging(null);
              setOver(null);
            }}
            onDragEnd={() => {
              dragFrom.current = null;
              setDragging(null);
              setOver(null);
            }}
            className={[
              "group relative flex items-center gap-4 px-4 py-3 bg-[#0F0F0F] cursor-grab active:cursor-grabbing transition-all",
              "border border-neon/70",
              "shadow-[0_0_0_1px_rgba(199,255,65,0.15),0_0_18px_-6px_rgba(199,255,65,0.35)]",
              isDragging ? "opacity-40" : "",
              isOver ? "ring-1 ring-neon translate-y-[-1px]" : "",
            ].join(" ")}
          >
            <span
              className="font-mono text-[10px] text-white/30 select-none"
              aria-hidden
              title="Drag to reorder"
            >
              ⋮⋮
            </span>
            <div className="font-display text-2xl text-neon w-6 tabular-nums">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-white truncate">{r.name}</div>
              <div className="text-white/55 text-xs truncate">{r.description}</div>
            </div>
            <span className="border border-neon/40 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em] text-neon">
              FEATURED
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RepoCard({
  repo,
  featured,
  canFeature,
  onToggle,
  onEdit,
}: {
  repo: Repo;
  featured: boolean;
  canFeature: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="relative border hairline bg-[#111] p-5 hover:border-white/20 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{repo.name}</span>
            {featured && (
              <span className="border hairline px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em] text-neon">
                FEATURED
              </span>
            )}
          </div>
          <p className="text-white/55 text-sm mt-1">{repo.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-white/50">
              <span className="size-1.5 bg-neon" /> {repo.language}
            </span>
            {repo.stack.map((s) => (
              <span
                key={s}
                className="border hairline px-2 py-0.5 font-mono text-[10px] text-white/60"
              >
                {s}
              </span>
            ))}
            <span className="font-mono text-[10px] text-white/40">★ {repo.stars}</span>
            <span className="font-mono text-[10px] text-white/40">updated {repo.updated}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              Feature
            </span>
            <button
              type="button"
              onClick={onToggle}
              disabled={!canFeature}
              className={`relative w-9 h-5 border hairline transition ${
                featured ? "bg-neon/90" : "bg-white/[0.03]"
              } disabled:opacity-40`}
              aria-pressed={featured}
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 size-3 bg-[#0D0D0D] transition-all ${
                  featured ? "left-[calc(100%-14px)]" : "left-[2px]"
                }`}
              />
            </button>
          </label>
          <button
            onClick={onEdit}
            className="border hairline px-3 py-2 text-xs text-white/75 hover:text-white hover:bg-white/[0.03] transition"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function EditProjectModal({ repo, onClose }: { repo: Repo; onClose: () => void }) {
  const { markDirty } = useDirty();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg border hairline bg-[#0F0F0F]">
        <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
        <div className="relative flex items-center justify-between px-5 py-3 border-b hairline">
          <div className="flex items-center gap-2">
            <span className="size-1.5 bg-neon" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
              Projects / Edit
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-white/50 hover:text-white text-sm"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="relative p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border hairline px-4 py-3 bg-white/[0.02]">
            <div>
              <div className="font-mono text-xs">{repo.name}</div>
              <div className="font-mono text-[10px] text-white/40">
                Feature on public profile
              </div>
            </div>
            <button
              type="button"
              className="relative w-9 h-5 border hairline bg-neon/90"
              aria-pressed
            >
              <span className="absolute top-1/2 -translate-y-1/2 size-3 bg-[#0D0D0D] left-[calc(100%-14px)]" />
            </button>
          </div>
          <Field label="Custom Title" hint="optional">
            <DInput className={inputCls} defaultValue={repo.name} />
          </Field>
          <Field label="Custom Description" hint="optional">
            <DTextarea rows={3} className={inputCls + " resize-none"} defaultValue={repo.description} />
          </Field>
          <Field label="Live Demo URL" hint="optional">
            <DInput className={inputCls} placeholder="https://…" />
          </Field>
          <div className="flex items-center justify-end gap-3 pt-4 border-t hairline">
            <button
              onClick={onClose}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                markDirty();
                onClose();
              }}
              className="bg-neon text-[#0D0D0D] text-xs font-semibold px-5 py-2.5 hover:opacity-90 transition"
            >
              Apply →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Preview Page ---------- */

function PreviewPage() {
  return (
    <div>
      <div className="border-b hairline bg-[#0D0D0D]/60 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-2 border hairline px-3 py-1.5">
              <span className="size-1.5 bg-neon rounded-full animate-pulse-neon" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
                Preview Mode / Public Profile
              </span>
            </span>
            <span className="hidden md:inline font-mono text-[10px] text-white/45 truncate">
              This is exactly what recruiters see when visiting your Profyl.
            </span>
          </div>
          <Link
            to="/alexkarim"
            target="_blank"
            className="shrink-0 border hairline px-3 py-2 text-xs text-white/75 hover:text-white hover:bg-white/[0.03] transition"
          >
            Open in new tab ↗
          </Link>
        </div>
      </div>

      {/* Embedded real public profile */}
      <div className="relative">
        <ProfylProfile />
      </div>
    </div>
  );
}

/* ---------- Unsaved changes modal ---------- */

function UnsavedChangesModal({
  onCancel,
  onDiscard,
  onSave,
}: {
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md border hairline bg-[#0F0F0F]">
        <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
        <div className="relative flex items-center gap-2 px-5 py-3 border-b hairline">
          <span className="size-1.5 bg-neon" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
            Confirm / Unsaved Changes
          </span>
        </div>
        <div className="relative p-6">
          <h3 className="font-display text-xl tracking-tight">You have unsaved changes</h3>
          <p className="mt-2 text-sm text-white/55">
            Save changes before leaving? Preview always reflects your saved profile data.
          </p>

          <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t hairline">
            <button
              onClick={onDiscard}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 hover:text-white px-3 py-2 transition"
            >
              Discard
            </button>
            <button
              onClick={onCancel}
              className="border hairline px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/[0.03] transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="bg-neon text-[#0D0D0D] text-xs font-semibold px-4 py-2 hover:opacity-90 transition"
            >
              Save &amp; Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
