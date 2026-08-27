"use client";

import { useMemo } from "react";
import { Settings } from "lucide-react";
import { LocalRepository } from "./DashboardContext";

interface RepositoryCardProps {
  repo: LocalRepository;
  featured: boolean;
  canFeature: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export default function RepositoryCard({
  repo,
  featured,
  canFeature,
  onToggle,
  onEdit,
}: RepositoryCardProps) {
  // Format the updated date
  const formattedDate = useMemo(() => {
    return new Date(repo.githubUpdatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, [repo.githubUpdatedAt]);

  // Topics context: occupy ONLY 1 row. Display first 4 topics + indicator for the rest.
  const displayLimit = 4;
  const displayedTopics = useMemo(() => repo.topics.slice(0, displayLimit), [repo.topics]);
  const remainingTopicsCount = useMemo(() => repo.topics.length - displayLimit, [repo.topics]);

  return (
    <div className="relative border border-white/[0.08] bg-[#111] p-5 hover:border-white/20 transition-colors rounded-none select-none">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        {/* Repo Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-white">
              {repo.customTitle || repo.name}
            </span>
            {featured && (
              <span className="border border-neon/40 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.18em] text-neon bg-neon/5 rounded-none">
                FEATURED
              </span>
            )}
          </div>
          <p className="text-white/55 text-sm mt-1 leading-snug">
            {repo.customDescription || repo.description || "No description provided"}
          </p>

          {/* Metadata Row */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {repo.primaryLanguage && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-white/50">
                <span className="size-1.5 bg-neon rounded-none" /> {repo.primaryLanguage}
              </span>
            )}
            {/* Render sliced topics (strictly 1 row) */}
            {displayedTopics.map((t) => (
              <span
                key={t}
                className="border border-white/[0.08] px-2 py-0.5 font-mono text-[9px] text-white/60 bg-white/[0.01] rounded-none"
              >
                {t}
              </span>
            ))}
            {remainingTopicsCount > 0 && (
              <span className="font-mono text-[10px] text-white/35">
                +{remainingTopicsCount} more
              </span>
            )}
            <span className="font-mono text-[10px] text-white/35">★ {repo.stars}</span>
            <span className="font-mono text-[10px] text-white/35">updated {formattedDate}</span>
          </div>
        </div>

        {/* Feature switch toggle & Edit buttons */}
        <div className="flex items-center gap-4 shrink-0 justify-end md:justify-start">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
              Feature
            </span>
            <button
              type="button"
              onClick={onToggle}
              disabled={!canFeature}
              className={`relative w-9 h-5 border transition rounded-none cursor-pointer ${
                featured ? "bg-neon border-neon" : "bg-white/[0.03] border-white/[0.08]"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-pressed={featured}
            >
              <span
                className={`absolute top-[2px] w-3.5 h-3.5 transition-all rounded-none duration-200 ${
                  featured ? "bg-[#0D0D0D] left-[20px]" : "bg-white/30 left-[2px]"
                }`}
              />
            </button>
          </label>
          <button
            type="button"
            onClick={onEdit}
            className="border border-white/[0.08] px-3 py-2 text-xs text-white/75 hover:text-white hover:bg-white/[0.03] transition rounded-none cursor-pointer flex items-center gap-1.5 font-mono"
          >
            <Settings className="size-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
