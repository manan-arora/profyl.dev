"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useDashboard, LocalRepository } from "./DashboardContext";
import RepositoryCard from "./RepositoryCard";

interface RepositoryListProps {
  onEditRepo: (repo: LocalRepository) => void;
  featuredCount: number;
}

export default function RepositoryList({ onEditRepo, featuredCount }: RepositoryListProps) {
  const { localProjects, toggleFeature } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRepos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return localProjects.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
    );
  }, [localProjects, searchQuery]);

  return (
    <div className="space-y-4">
      {/* List Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          Projects / All Repositories
        </div>
        {/* Search Input bar */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/35" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-white/[0.08] rounded-none pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-white/25 outline-none focus:border-neon/60 focus:bg-white/[0.02] transition font-mono"
            placeholder="Search repository..."
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="space-y-3">
        {filteredRepos.map((repo) => (
          <RepositoryCard
            key={repo.id}
            repo={repo}
            featured={repo.isFeatured}
            canFeature={featuredCount < 4 || repo.isFeatured}
            onToggle={() => toggleFeature(repo.id)}
            onEdit={() => onEditRepo(repo)}
          />
        ))}
        {filteredRepos.length === 0 && (
          <div className="text-center font-mono text-[10px] text-white/30 py-8 select-none border border-white/[0.08] border-dashed">
            No matching repositories found.
          </div>
        )}
      </div>
    </div>
  );
}
