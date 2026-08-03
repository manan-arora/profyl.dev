"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { Repo, RepoCard } from "./RepoCard";
import { SkeletonGrid } from "./SkeletonGrid";
import { EmptyState } from "./EmptyState";

export type { Repo };

interface OnboardingProjectsProps {
  repositories: Repo[];
  isLoading?: boolean;
  isPending?: boolean;
  error?: string | null;
  onContinue: (selectedRepositoryIds: string[]) => void;
  onResync?: () => void;
}

const MAX_SELECTIONS = 4;

export function OnboardingProjects({
  repositories = [],
  isLoading = false,
  isPending = false,
  error = null,
  onContinue,
  onResync,
}: OnboardingProjectsProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const isFull = selected.length >= MAX_SELECTIONS;

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_SELECTIONS) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedCounter = useMemo(() => {
    return `${selected.length} of ${MAX_SELECTIONS} selected`;
  }, [selected.length]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-foreground font-sans overflow-x-hidden">
      <div className="relative">
        {/* Background Grid Overlay */}
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] pointer-events-none" />

        {/* Header */}
        <header className="relative border-b hairline z-10">
          <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <Image
                src="/profyl-logo.svg"
                alt="Profyl logo"
                width={28}
                height={28}
                priority
                className="size-7 object-contain"
              />
              <span className="font-display font-semibold tracking-tight text-lg text-white">
                profyl
              </span>
              <span className="font-mono text-[10px] text-neon ml-1 mt-0.5">
                v1.0
              </span>
            </div>

            {/* Current Step */}
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
              <span className="ml-2">Step 02 · Featured Projects</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative mx-auto max-w-6xl px-6 pt-16 pb-40 z-10">
          <div className="max-w-2xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon mb-5">
              ◇ Imported {repositories.length} public repositories
            </div>
            <h1 className="font-display font-semibold tracking-[-0.025em] text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02] text-white">
              Choose your <span className="text-neon neon-text-glow italic">featured</span> projects
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-white/60 max-w-lg">
              Select up to 4 repositories to showcase on your public Profyl. You can change them
              later from your dashboard.
            </p>
          </div>

          <div className="mt-14">
            {isLoading ? (
              <SkeletonGrid />
            ) : repositories.length === 0 ? (
              <EmptyState onResync={onResync} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3">
                {repositories.map((r) => (
                  <RepoCard
                    key={r.id}
                    repo={r}
                    selected={selected.includes(r.id)}
                    index={selected.indexOf(r.id)}
                    disabled={(isFull && !selected.includes(r.id)) || isPending}
                    onToggle={() => handleToggle(r.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Fixed Footer Selection Tracker */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t hairline bg-[#0D0D0D]/95 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 h-20 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: MAX_SELECTIONS }).map((_, i) => (
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
                {selectedCounter}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {error && (
                <span className="text-red-500 text-xs font-mono max-w-[200px] sm:max-w-none text-right">
                  {error}
                </span>
              )}
              <button
                type="button"
                onClick={() => onContinue(selected)}
                disabled={selected.length === 0 || isPending}
                className="inline-flex items-center gap-2 bg-neon text-[#0D0D0D] px-6 py-3 text-sm font-semibold transition disabled:opacity-25 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer"
              >
                {isPending ? "Saving…" : <>Continue <span className="font-mono">→</span></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
