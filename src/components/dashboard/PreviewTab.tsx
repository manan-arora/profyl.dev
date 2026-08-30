"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "./DashboardContext";
import { ProfylPage } from "@/components/profyl/ProfylPage";
import UnsavedChangesModal from "./UnsavedChangesModal";
import { PreparationLoader } from "@/components/leetcode/LeetcodeResultPanel";
import { Button } from "@/components/ui/button";

export default function PreviewTab() {
  const router = useRouter();
  const {
    savedData,
    isDirty,
    discardEdits,
    saveChanges,
    getLastActiveTab,
    refreshState,
    retryRefresh,
  } = useDashboard();

  const [localSaving, setLocalSaving] = useState(false);

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
        <div className="relative mx-auto size-20 w-20 h-20 shrink-0">
          <svg viewBox="0 0 64 64" className="size-20 w-20 h-20 -rotate-90 block" aria-hidden="true">
            <circle cx="32" cy="32" r="28" className="stroke-white/10" strokeWidth="1.5" fill="none" />
            <circle
              cx="32"
              cy="32"
              r="28"
              className="animate-ring-draw"
              stroke="#c7ff41"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="square"
            />
          </svg>
          <svg viewBox="0 0 64 64" className="absolute inset-0 size-20 w-20 h-20 block" aria-hidden="true">
            <path
              d="M21 33.5L28.5 41L43 25"
              className="animate-check-draw"
              stroke="#c7ff41"
              strokeWidth="2"
              fill="none"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center border border-amber-400/40 bg-[#0D0D0D] animate-warn-in">
            <span className="font-mono text-[11px] leading-none text-amber-400">!</span>
          </span>
        </div>
        <h2 className="mt-7 font-display font-semibold tracking-[-0.02em] text-[clamp(1.5rem,4vw,1.875rem)] leading-[1.05] text-white">
          Sync <span className="text-neon neon-text-glow italic">failed</span>
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/60 max-w-sm">
          Couldn't update your profile data. Please check your connections and try again.
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
          <div className="bg-[#141414] border-b border-white/[0.08] py-3 px-6 lg:px-10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              
              <span className="font-mono text-[10px] uppercase tracking-widest text-neon font-semibold">
                ● Preview Mode
              </span>
              <span className="hidden sm:inline text-white/20">|</span>
              <span className="hidden sm:inline font-mono text-[9px] text-white/45">
                This is exactly what people see when visiting your public Profyl.
              </span>
            </div>
            {/* View live target */}
            <span className="font-mono text-[10px] text-neon/85">
              Last Saved Data
            </span>
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
