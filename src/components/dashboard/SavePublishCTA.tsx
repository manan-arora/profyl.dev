"use client";

import { useDashboard } from "./DashboardContext";

export default function SavePublishCTA() {
  const { isDirty, saveState, profileStatus, saveChanges, refreshState } = useDashboard();

  const getLabel = () => {
    if (saveState === "saving") return "Saving...";
    if (saveState === "saved") return "Saved ✓";

    const label = profileStatus === "DRAFT" ? "Publish Profyl →" : "Save Changes →";
    return label;
  };

  const isRefreshing = refreshState === "refreshing";
  const isActive = saveState !== "saving" && !isRefreshing && (profileStatus === "DRAFT" || isDirty);

  return (
    <button
      onClick={saveChanges}
      disabled={!isActive}
      title={isRefreshing ? "Profile data refresh in progress. Save will be enabled once it's complete." : undefined}
      className={`text-xs font-semibold px-4 py-2 transition rounded-none font-mono ${
        isActive
          ? "bg-neon text-[#0D0D0D] hover:opacity-90 cursor-pointer shadow-[0_0_12px_rgba(199,255,65,0.2)]"
          : saveState === "saved"
          ? "bg-neon/10 text-neon border border-neon/30 cursor-default"
          : "border border-white/[0.08] text-white/40 cursor-not-allowed bg-transparent"
      }`}
    >
      {getLabel()}
    </button>
  );
}
