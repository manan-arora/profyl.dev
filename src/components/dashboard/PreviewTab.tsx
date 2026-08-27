"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "./DashboardContext";
import { ProfylPage } from "@/components/profyl/ProfylPage";
import UnsavedChangesModal from "./UnsavedChangesModal";

export default function PreviewTab() {
  const router = useRouter();
  const {
    savedData,
    isDirty,
    discardEdits,
    saveChanges,
    getLastActiveTab,
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
