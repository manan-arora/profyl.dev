"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { id: "hero", label: "Overview" },
  { id: "highlights", label: "Highlights" },
  { id: "projects", label: "Projects" },
  { id: "github", label: "GitHub" },
  { id: "leetcode", label: "LeetCode" },
];

export function ProfylPublicNav() {
  const { isSignedIn } = useAuth();
  const [activeId, setActiveId] = useState<string>("hero");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Observe sections to highlight based on scroll position
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -60% 0px", // triggers when section is in the upper middle area of viewport
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    // Also set initial active ID based on current hash if present
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      if (NAV_ITEMS.some((item) => item.id === hashId)) {
        setActiveId(hashId);
      }
    }

    return () => {
      NAV_ITEMS.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveId(id);
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // offset for the sticky navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    // Update hash in URL
    window.history.pushState(null, "", `#${id}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile URL copied to clipboard!");
    }
  };

  const claimUrl = isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b hairline bg-[#0D0D0D]/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
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
          
        </Link>

        {/* Anchor Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`text-sm transition-all duration-200 relative py-1 ${
                  isActive
                    ? "text-neon neon-text-glow font-medium"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-neon rounded-full transition-all duration-300" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Public Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleShare}
              className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              Share
            </button>
            <Link
              href={claimUrl}
              className="bg-neon text-[#0D0D0D] text-sm font-semibold px-4 py-2 hover:opacity-90 transition inline-block"
            >
              Claim Yours →
            </Link>
          </div>

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex md:hidden items-center justify-center p-2 text-white/70 hover:text-white transition cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Overlay */}
      {isMenuOpen && (
        <div className="md:hidden border-t hairline bg-[#0D0D0D]/95 backdrop-blur-md">
          <div className="flex flex-col gap-4 p-6 font-mono text-sm">
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`py-2 border-b border-white/[0.04] transition-colors ${
                    isActive ? "text-neon font-medium" : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="py-2 text-white/70 hover:text-white transition-colors border-b border-white/[0.04] text-left cursor-pointer"
              >
                Share Profile
              </button>
              <Link
                href={claimUrl}
                onClick={() => setIsMenuOpen(false)}
                className="bg-neon text-[#0D0D0D] text-center text-sm font-semibold py-3 hover:opacity-90 transition"
              >
                Claim Yours →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
