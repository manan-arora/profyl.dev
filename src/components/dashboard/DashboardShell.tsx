"use client";

import { ReactNode } from "react";
import {
  DashboardProvider,
  DashboardUser,
  DashboardProfile,
  DashboardRepository,
} from "./DashboardContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
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
  return (
    <DashboardProvider
      user={user}
      initialData={initialData}
      rawProfile={rawProfile}
      rawRepositories={rawRepositories}
    >
      <div className="flex min-h-screen bg-[#0D0D0D] text-white">
        {/* Fixed Left Sidebar panel */}
        <Sidebar />

        {/* Scrollable Main Content wrapper */}
        <div className="pl-[240px] flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Sticky Topbar header */}
          <Topbar />

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
