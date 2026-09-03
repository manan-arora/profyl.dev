"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { useDashboard } from "./DashboardContext";

function getRelativeTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hr" : "hrs"} ago`;
  return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
}

export default function SyncStatusPopover() {
  const { user, syncStatus } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const githubTime = getRelativeTime(syncStatus?.githubLastSyncedAt);
  const leetcodeTime = getRelativeTime(syncStatus?.leetcodeLastSyncedAt);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View sync status"
        className="font-mono text-[10px] text-white/60 hover:text-white transition flex items-center gap-1.5 cursor-pointer focus:outline-none"
      >
        <span>Sync status</span>
        <Info className="size-3 text-white/50" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute right-0 top-full mt-2 w-72 z-50 bg-[#141414] border border-white/10 p-4 shadow-2xl text-left font-sans select-none animate-rise-in"
        >
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-3">
            Sync status
          </h4>
          
          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-white/60">GitHub</span>
              <span className="text-white/90">
                {githubTime ? `Last synced ${githubTime}` : "Not synced yet"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/60">LeetCode</span>
              <span className="text-white/90">
                {!user.isLeetcodeVerified
                  ? "Not connected"
                  : leetcodeTime
                  ? `Last synced ${leetcodeTime}`
                  : "Not synced yet"}
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/5 text-[11px] text-white/45 font-sans leading-relaxed">
            Data refreshes automatically in the background.
          </div>
        </div>
      )}
    </div>
  );
}
