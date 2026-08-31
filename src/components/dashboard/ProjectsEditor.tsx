"use client";

import { useState, useMemo } from "react";
import { useDashboard, LocalRepository } from "./DashboardContext";
import FeaturedProjects from "./FeaturedProjects";
import RepositoryList from "./RepositoryList";
import ProjectEditModal from "./ProjectEditModal";

export default function ProjectsEditor() {
  const { localProjects, reorderProjects, updateProject } = useDashboard();
  const [editingRepo, setEditingRepo] = useState<LocalRepository | null>(null);

  const featuredProjects = useMemo(() => {
    return localProjects
      .filter((p) => p.isFeatured)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [localProjects]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 py-6 sm:py-10 space-y-8 select-none">
      {/* Page Header Introduction */}
      <div>
        <h2 className="mt-4 font-display font-semibold tracking-tight text-2xl sm:text-3xl text-white">
          Curate the code recruiters see.
        </h2>
        <p className="mt-2 text-white/55 text-sm max-w-2xl">
          Feature up to four repositories. The rest inform your identity score in the background.
        </p>
      </div>

      {/* Header statistics block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border border-white/[0.08] bg-[#111] px-5 py-4 rounded-none">
        <div>
          <div className="font-display text-2xl text-white">
            {localProjects.length}{" "}
            <span className="text-white/40 text-base font-sans">repositories fetched</span>
          </div>
          <div className="font-mono text-[10px] text-white/40 mt-1">
            Showing public repositories · sorted by recently updated · forks & archived excluded
          </div>
        </div>
        
      </div>

      {/* Featured Projects Curation Card Block */}
      <section className="relative border border-white/[0.08] bg-[#111] rounded-none">
        <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
        <div className="relative flex items-center justify-between px-5 py-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="size-1.5 bg-neon" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
              Featured Projects
            </span>
          </div>
          <span className="font-mono text-[10px] text-white/40">
            {featuredProjects.length}/4 · drag to reorder
          </span>
        </div>
        <div className="relative p-6">
          {featuredProjects.length === 0 ? (
            <div className="font-mono text-[10px] text-white/35 py-4">
              No featured projects. Toggle repositories below to feature them.
            </div>
          ) : (
            <FeaturedProjects repos={featuredProjects} onReorder={reorderProjects} />
          )}
        </div>
      </section>

      {/* All Connected Repositories search list */}
      <RepositoryList
        onEditRepo={setEditingRepo}
        featuredCount={featuredProjects.length}
      />

      {/* Custom Metadata Edit Modal */}
      {editingRepo && (
        <ProjectEditModal
          repo={editingRepo}
          onClose={() => setEditingRepo(null)}
          onApply={(updatedData) => {
            updateProject(editingRepo.id, updatedData);
            setEditingRepo(null);
          }}
        />
      )}
    </div>
  );
}
