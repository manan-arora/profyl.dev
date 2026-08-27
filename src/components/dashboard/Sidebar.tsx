"use client";

import Image from "next/image";
import Link from "next/link";
import SidebarNavigation from "./SidebarNavigation";
import SidebarUserBlock from "./SidebarUserBlock";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] border-r border-white/[0.08] bg-[#0D0D0D] flex flex-col justify-between select-none z-30 h-screen">
      <div className="flex flex-col">
        {/* Brand Logo - Aligned with Global Navbar */}
        <Link href="/" className="h-16 flex items-center gap-2.5 px-6 border-b border-white/[0.08]">
          <Image
            src="/profyl-logo.svg"
            alt="Profyl logo"
            width={28}
            height={28}
            priority
            className="size-7 object-contain"
          />
          <span className="font-display font-semibold tracking-tight text-lg text-white">
            profyl
          </span>
          <span className="font-mono text-[10px] text-neon ml-1 mt-0.5">
            v1.0
          </span>
        </Link>

        {/* Console Header */}
        <div className="px-4 pt-6 pb-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 px-2">
            Dashboard
          </div>
        </div>

        {/* Sidebar Tabs Navigation */}
        <SidebarNavigation />
      </div>

      {/* User Information & Log out */}
      <SidebarUserBlock />
    </aside>
  );
}
