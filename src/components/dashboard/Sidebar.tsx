"use client";

import Image from "next/image";
import Link from "next/link";
import SidebarNavigation from "./SidebarNavigation";
import SidebarUserBlock from "./SidebarUserBlock";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Background backdrop overlay for mobile slide drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 w-[240px] border-r border-white/[0.08] bg-[#0D0D0D] flex flex-col justify-between select-none z-50 h-screen transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex flex-col">
          {/* Brand Logo - Aligned with Global Navbar */}
          <Link href="/" className="h-16 flex items-center justify-between gap-2.5 px-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
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
            </div>
            {/* Close button inside mobile menu */}
            <button
              onClick={onClose}
              className="lg:hidden font-mono text-white/50 hover:text-white text-lg cursor-pointer p-1"
              aria-label="Close sidebar"
            >
              ×
            </button>
          </Link>

          {/* Console Header */}
          <div className="px-4 pt-6 pb-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 px-2">
              Dashboard
            </div>
          </div>

          {/* Sidebar Tabs Navigation */}
          <div onClick={onClose}>
            <SidebarNavigation />
          </div>
        </div>

        {/* User Information & Log out */}
        <SidebarUserBlock />
      </aside>
    </>
  );
}
