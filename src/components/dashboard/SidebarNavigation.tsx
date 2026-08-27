"use client";

import Link from "next/link";
import { useDashboard } from "./DashboardContext";

const NAV_ITEMS = [
  { key: "profile", label: "Profile", path: "/dashboard/profile", code: "01" },
  { key: "projects", label: "Projects", path: "/dashboard/projects", code: "02" },
  { key: "preview", label: "Preview Profile", path: "/dashboard/preview", code: "03" },
] as const;

export default function SidebarNavigation() {
  const { activeTab } = useDashboard();

  return (
    <nav className="px-3 flex-1 flex flex-col gap-1 select-none">
      {NAV_ITEMS.map((item) => {
        const active = activeTab === item.key;
        return (
          <Link
            key={item.key}
            href={item.path}
            className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-all ${
              active
                ? "text-white border border-white/[0.08] bg-white/[0.02] font-normal"
                : "text-white/55 hover:text-white border border-transparent"
            }`}
          >
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] transition-all ${
                active ? "bg-neon" : "bg-transparent"
              }`}
            />
            <span className="font-mono text-[10px] text-white/40 w-5">{item.code}</span>
            <span className="tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
