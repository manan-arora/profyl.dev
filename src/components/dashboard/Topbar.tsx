"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDashboard } from "./DashboardContext";
import SavePublishCTA from "./SavePublishCTA";
import { calculateCompletionPercent } from "./completion-utils";

interface TopbarProps {
  onToggleSidebar?: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
  const { activeTab, user, localProfile, localProjects } = useDashboard();

  const title = useMemo(() => {
    if (activeTab === "profile") return "Profile";
    if (activeTab === "projects") return "Projects";
    return "Preview Profile";
  }, [activeTab]);

  // Compute profile completion percentage
  const completionPercent = useMemo(() => {
    return calculateCompletionPercent(localProfile, localProjects, user);
  }, [localProfile, localProjects, user]);

  return (
    <header className="h-16 select-none">
      <div className="h-full px-4 lg:px-10 flex items-center justify-between gap-4">
        {/* Breadcrumbs / Page Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Hamburger button visible only on mobile/tablet screens */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white transition cursor-pointer"
            aria-label="Toggle sidebar navigation"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <h1 className="hidden lg:block font-display font-semibold tracking-tight text-base sm:text-lg truncate text-white capitalize">
            {title}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/${user.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-2 border border-white/[0.08] px-3 py-2 text-xs text-white/75 hover:text-white hover:bg-white/[0.03] transition rounded-none font-mono"
          >
            View Profile ↗
          </Link>

          {/* Global CTA Action Button */}
          <SavePublishCTA />

          {/* Completion Progress Bar Pill */}
          <div className="flex items-center gap-2 border border-white/[0.08] px-2.5 py-1.5 rounded-none">
            <div className="relative h-1.5 w-12 sm:w-16 bg-white/10 rounded-none overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-neon rounded-none transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="font-mono text-[8px] sm:text-[9px] text-white/70 whitespace-nowrap">
              {completionPercent}% <span className="hidden min-[400px]:inline">COMPLETE</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
