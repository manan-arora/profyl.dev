"use client";

import { useMemo } from "react";
import { useClerk, SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useDashboard } from "./DashboardContext";

export default function SidebarUserBlock() {
  const { user, localProfile } = useDashboard();
  const { openUserProfile } = useClerk();

  const initials = useMemo(() => {
    const nameToUse = localProfile.name || user.githubUsername;
    return nameToUse
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PR";
  }, [localProfile.name, user.githubUsername]);

  return (
    <div className="mt-auto border-t border-white/[0.08] p-4 bg-[#141414]/20 flex flex-col gap-4 select-none">
      <button
        onClick={() => openUserProfile()}
        className="flex items-center gap-3 text-left w-full hover:bg-white/5 p-1 rounded-none transition cursor-pointer"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.githubUsername}
            className="size-10 border border-neon object-cover bg-black select-none rounded-none"
          />
        ) : (
          <div className="size-10 border border-neon bg-black flex items-center justify-center font-display font-semibold text-neon select-none rounded-none">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-mono text-xs font-semibold truncate text-white">
            {localProfile.name || user.githubUsername}
          </div>
          <div className="font-mono text-[9px] text-white/40 truncate">
            @{user.githubUsername}
          </div>
        </div>
      </button>

      <SignOutButton>
        <button className="flex items-center justify-center gap-2 w-full py-2 border border-white/[0.08] rounded-none text-xs text-white/70 hover:text-neon hover:border-neon transition cursor-pointer font-mono">
          <LogOut className="size-3.5" />
          <span>Sign Out</span>
        </button>
      </SignOutButton>
    </div>
  );
}
