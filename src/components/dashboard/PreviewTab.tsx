"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "./DashboardContext";
import { ProfylPage } from "@/components/profyl/ProfylPage";
import UnsavedChangesModal from "./UnsavedChangesModal";
import { PreparationLoader } from "@/components/leetcode/LeetcodeResultPanel";
import { Button } from "@/components/ui/button";
import SyncStatusPopover from "./SyncStatusPopover";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function PreviewTab() {
  const router = useRouter();
  const {
    user,
    profileStatus,
    savedData,
    isDirty,
    discardEdits,
    saveChanges,
    getLastActiveTab,
    refreshState,
    refreshError,
    retryRefresh,
  } = useDashboard();

  const [localSaving, setLocalSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = useCallback(async () => {
    try {
      const fullUrl = typeof window !== "undefined"
        ? `${window.location.origin}/${user.slug}`
        : `https://profyl.dev/${user.slug}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Profile URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  }, [user.slug]);

  const handleCancel = useCallback(() => {
    // Redirect back to the last active edit tab (Profile/Projects)
    router.push(getLastActiveTab());
  }, [router, getLastActiveTab]);

  const handleDiscard = useCallback(() => {
    discardEdits();
  }, [discardEdits]);

  const handleSaveAndContinue = useCallback(async () => {
    setLocalSaving(true);
    await saveChanges();
    setLocalSaving(false);
  }, [saveChanges]);

  if (refreshState === "refreshing") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0D0D0D] min-h-[calc(100vh-4rem)]">
        <PreparationLoader />
      </div>
    );
  }

  if (refreshState === "failed") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0D0D0D] min-h-[calc(100vh-4rem)] select-none">
        {/* Warning triangle icon */}
        <div className="relative mx-auto size-20 w-20 h-20 shrink-0 flex items-center justify-center animate-warn-in">
          <svg
            viewBox="0 0 24 24"
            className="size-20 w-20 h-20 text-amber-500/80 stroke-current fill-amber-500/5"
            strokeWidth="1.0"
            strokeLinecap="square"
            strokeLinejoin="miter"
            aria-hidden="true"
          >
            <path d="M12 3 L22 20 H2 Z" />
            <line x1="12" y1="8" x2="12" y2="13" strokeWidth="1.0" />
            <line x1="12" y1="16.5" x2="12" y2="16.5" strokeWidth="1.0" />
          </svg>
        </div>
        <h2 className="mt-7 font-display font-semibold tracking-[-0.02em] text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.05] text-white">
          Sync <span className="text-neon neon-text-glow italic">failed</span>
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/60 max-w-sm">
          {refreshError || "Couldn't update your profile data. Please check your connections and try again."}
        </p>
        <div className="mt-8 max-w-[200px] w-full">
          <Button onClick={retryRefresh} variant="primary" className="w-full justify-center">
            Try again <span className="font-mono">→</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0D0D0D] min-h-[calc(100vh-4rem)] relative select-none">
      {isDirty ? (
        /* Blocked State - Render ONLY the UnsavedChangesModal */
        <div className="absolute inset-0 bg-[#0D0D0D] flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
          <UnsavedChangesModal
            onCancel={handleCancel}
            onDiscard={handleDiscard}
            onSave={handleSaveAndContinue}
            isSaving={localSaving}
          />
        </div>
      ) : (
        /* Allowed State - Render Preview Banner + Public Profile Page Component */
        <>
          {/* 1. Preview Mode Header Banner */}
          <div className="bg-[#141414] border-b border-white/[0.08] py-3 px-6 lg:px-10 flex items-center justify-between gap-4 shrink-0">
            {profileStatus === "PUBLISHED" ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#c7ff41] font-semibold shrink-0">
                  ● LIVE
                </span>
                <span className="text-white/20 shrink-0">|</span>
                <span className="font-mono text-[11px] text-white/70 truncate">
                  profyl.dev/{user.slug}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  aria-label="Copy public profile URL"
                  className="p-1 text-white/50 hover:text-white transition cursor-pointer shrink-0"
                >
                  {copied ? <Check className="size-3.5 text-[#c7ff41]" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 font-semibold shrink-0">
                  ● DRAFT
                </span>
                <span className="text-white/20 shrink-0">|</span>
                <span className="font-mono text-[10px] text-white/45 truncate">
                  This is how your Profyl will look when it’s public. Publish to make it live.
                </span>
              </div>
            )}

            {/* Sync status popover target on far right */}
            <div className="shrink-0">
              <SyncStatusPopover />
            </div>
          </div>

          {/* 2. Embedded ProfylPage Renderer in Preview Mode */}
          <div className="flex-1">
            <ProfylPage data={savedData} mode="preview" />
          </div>
        </>
      )}
    </div>
  );
}
