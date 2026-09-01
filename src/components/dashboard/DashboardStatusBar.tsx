"use client";

import { useDashboard } from "./DashboardContext";
import { Loader2, AlertCircle } from "lucide-react";

export default function DashboardStatusBar() {
  const { refreshState, retryRefresh, refreshError } = useDashboard();

  if (refreshState === "idle") return null;

  const isRefreshing = refreshState === "refreshing";

  return (
    <div className="mx-auto max-w-[1200px] w-full px-6 lg:px-10 pb-4 pt-1 shrink-0 select-none">
      <div
        className={`flex items-center gap-3 py-2 px-4 border text-xs font-mono rounded-none ${
          isRefreshing
            ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
            : "bg-red-500/10 border-red-500/30 text-red-500"
        }`}
      >
        {isRefreshing ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-amber-500" />
            <span>Updating your profile data… Save will be enabled when it's complete.</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
            <span>{refreshError || "Couldn't update your profile data."}</span>
            <button
              onClick={retryRefresh}
              className="underline hover:text-white cursor-pointer ml-auto bg-transparent border-none p-0 font-mono text-xs font-semibold text-red-500"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
