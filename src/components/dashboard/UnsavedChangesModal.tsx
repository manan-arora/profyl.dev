"use client";

import { useEffect } from "react";

interface UnsavedChangesModalProps {
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export default function UnsavedChangesModal({
  onCancel,
  onDiscard,
  onSave,
  isSaving = false,
}: UnsavedChangesModalProps) {
  // Listen for Escape key to close the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred overlay backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onCancel} />

      <div className="relative w-full max-w-md border border-white/[0.08] bg-[#0F0F0F] rounded-none p-6 shadow-2xl scan-line">
        {/* Corners visual indicator */}
        <span className="absolute size-3 border-neon -top-px -left-px border-t border-l" />
        <span className="absolute size-3 border-neon -bottom-px -right-px border-b border-r" />

        <div className="flex items-center gap-2 mb-4 select-none">
          <span className="size-1.5 bg-neon rounded-full animate-pulse-neon" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neon">
            Confirm / Unsaved Changes
          </span>
        </div>

        <h3 className="font-display text-xl font-semibold text-white tracking-tight">
          You have unsaved changes
        </h3>
        <p className="mt-2 text-sm text-white/55 leading-relaxed">
          Save changes before previewing? Preview always reflects your last successfully saved profile data.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45 hover:text-white px-3 py-2 transition disabled:opacity-30 cursor-pointer"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="border border-white/[0.08] px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/[0.03] transition rounded-none disabled:opacity-30 cursor-pointer font-mono"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="bg-neon text-[#0D0D0D] text-xs font-semibold px-4 py-2 rounded-none hover:opacity-90 transition disabled:opacity-50 cursor-pointer font-mono"
          >
            {isSaving ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
