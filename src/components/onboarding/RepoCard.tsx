import { useMemo } from "react";

export interface Repo {
  id: string;
  name: string;
  description?: string | null;
  primaryLanguage?: string | null;
  topics?: string[] | any; // support array of topics from DB or stack from reference
  stars: number;
  githubUpdatedAt: Date | string; // support both Date and string types
  isFeatured?: boolean;
}

interface RepoCardProps {
  repo: Repo;
  selected: boolean;
  index: number;
  disabled: boolean;
  onToggle: () => void;
}

function getRelativeTime(dateInput: Date | string): string {
  if (!dateInput) return "";

  let date: Date;
  if (typeof dateInput === "string") {
    if (dateInput.toLowerCase().includes("ago")) {
      return dateInput;
    }
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
  } else {
    return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
  }
}

export function RepoCard({
  repo,
  selected,
  index,
  disabled,
  onToggle,
}: RepoCardProps) {
  // Format the updated date as relative time
  const formattedDate = useMemo(() => {
    return getRelativeTime(repo.githubUpdatedAt);
  }, [repo.githubUpdatedAt]);

  // Handle tech stack tags (supports both topics from DB and stack from mock)
  const tags = useMemo(() => {
    if (Array.isArray(repo.topics)) {
      return repo.topics;
    }
    if (Array.isArray((repo as any).stack)) {
      return (repo as any).stack;
    }
    return [];
  }, [repo.topics, (repo as any).stack]);

  const MAX_VISIBLE_TAGS = 5;
  const visibleTags = useMemo(() => tags.slice(0, MAX_VISIBLE_TAGS), [tags]);
  const overflowCount = useMemo(() => Math.max(0, tags.length - MAX_VISIBLE_TAGS), [tags]);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={
        "group relative text-left p-5 flex flex-col transition-colors outline-none border hairline " +
        (selected
          ? "bg-[#141A0C] neon-glow z-10"
          : disabled
            ? "bg-[#0D0D0D] opacity-30 cursor-not-allowed"
            : "bg-[#0D0D0D] hover:bg-white/[0.03] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/30")
      }
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="min-w-0">
          <div className="font-display font-semibold tracking-tight text-[17px] break-words text-white">
            {repo.name}
          </div>
          {repo.primaryLanguage && (
            <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/45">
              <span className="size-1.5 bg-neon rounded-full" />
              {repo.primaryLanguage}
            </div>
          )}
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
        {repo.description || "No description available"}
      </p>

      <div className="mt-auto pt-5 w-full">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 max-h-[58px] overflow-hidden">
            {visibleTags.map((t: string) => (
              <span
                key={t}
                title={t}
                className={
                  "font-mono text-[9px] uppercase tracking-widest px-2 py-1 border max-w-[110px] truncate inline-block " +
                  (selected
                    ? "border-[#C7FF41]/40 text-[#C7FF41]/80"
                    : "border-white/12 text-white/55")
                }
              >
                {t}
              </span>
            ))}
            {overflowCount > 0 && (
              <span
                className={
                  "font-mono text-[9px] uppercase tracking-widest px-2 py-1 border shrink-0 inline-block " +
                  (selected
                    ? "border-[#C7FF41]/40 text-[#C7FF41]/80"
                    : "border-white/12 text-white/55")
                }
              >
                +{overflowCount}
              </span>
            )}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-white/40">
          <span className="tabular-nums">★ {repo.stars.toLocaleString()}</span>
          {formattedDate && (
            <span className="uppercase tracking-widest">Updated {formattedDate}</span>
          )}
        </div>
      </div>
    </button>
  );
}
