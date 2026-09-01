"use client";

import { useState } from "react";
import { ReactNode } from "react";
import {
  DashboardProvider,
  DashboardUser,
  DashboardProfile,
  DashboardRepository,
} from "./DashboardContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import DashboardStatusBar from "./DashboardStatusBar";
import { ProfylPageData } from "@/types/profyl-page";

interface DashboardShellProps {
  children: ReactNode;
  user: DashboardUser;
  initialData: ProfylPageData;
  rawProfile: DashboardProfile | null;
  rawRepositories: DashboardRepository[];
}

export default function DashboardShell({
  children,
  user,
  initialData,
  rawProfile,
  rawRepositories,
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <DashboardProvider
      user={user}
      initialData={initialData}
      rawProfile={rawProfile}
      rawRepositories={rawRepositories}
    >
      <div className="flex min-h-screen bg-[#0D0D0D] text-white">
        {/* Fixed Left Sidebar panel */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Scrollable Main Content wrapper */}
        <div className="lg:pl-[240px] flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Sticky Topbar header & status bar wrapper */}
          <div className="sticky top-0 z-20 bg-[#0D0D0D]/85 backdrop-blur-md border-b border-white/[0.08]">
            <Topbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
            <DashboardStatusBar />
          </div>

          {/* Render children views (tabs) */}
          <main className="flex-1 relative overflow-hidden bg-[#0D0D0D]">
            {/* Ambient visual mesh overlay */}
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_80%)]" />
            
            <div className="relative h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
