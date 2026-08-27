"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDashboard } from "./DashboardContext";
import SavePublishCTA from "./SavePublishCTA";
import { calculateCompletionPercent } from "./completion-utils";

export default function Topbar() {
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
    <header className="sticky top-0 z-20 h-16 border-b border-white/[0.08] bg-[#0D0D0D]/85 backdrop-blur-md select-none">
      <div className="h-full px-6 lg:px-10 flex items-center justify-between gap-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          
          <h1 className="font-display font-semibold tracking-tight text-lg truncate text-white capitalize">
            {title}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${user.slug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-2 border border-white/[0.08] px-3 py-2 text-xs text-white/75 hover:text-white hover:bg-white/[0.03] transition rounded-none font-mono"
          >
            View Public Profile ↗
          </Link>

          {/* Global CTA Action Button */}
          <SavePublishCTA />

          {/* Completion Progress Bar Pill */}
          <div className="flex items-center gap-2 border border-white/[0.08] px-3 py-1.5 rounded-none">
            <div className="relative h-1.5 w-16 bg-white/10 rounded-none overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-neon rounded-none transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="font-mono text-[9px] text-white/70">
              {completionPercent}% COMPLETE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
