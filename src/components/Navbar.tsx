"use client";

import Image from "next/image";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { useState, useEffect } from "react";

const NAV = [
  { label: "Product", href: "#" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why Profyl", href: "#why-profyl" },
  { label: "Manifesto", href: "#manifesto" },
];

const getTargetId = (href: string) =>
  href === "#" ? "product" : href.replace("#", "");

const getInitialActiveId = () => {
  if (typeof window === "undefined") return "product";

  const hashId = window.location.hash.replace("#", "");
  if (hashId && NAV.some((item) => getTargetId(item.href) === hashId)) {
    return hashId;
  }

  return "product";
};

export function Navbar() {
  const [activeId, setActiveId] = useState<string>(getInitialActiveId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -60% 0px",
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions,
    );

    NAV.forEach((item) => {
      const targetId = getTargetId(item.href);
      const el = document.getElementById(targetId);
      if (el) observer.observe(el);
    });

    return () => {
      NAV.forEach((item) => {
        const targetId = getTargetId(item.href);
        const el = document.getElementById(targetId);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    setActiveId(id);
    setIsMenuOpen(false);
    const targetEl = document.getElementById(id);
    if (targetEl) {
      const offset = 80; // offset for the sticky navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = targetEl.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    // Update hash in URL
    window.history.pushState(null, "", id === "product" ? "/" : `#${id}`);
  };

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

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => {
            const targetId =
              item.href === "#" ? "product" : item.href.replace("#", "");
            const isActive = activeId === targetId;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, targetId)}
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

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign in
              </Link>

              <Link
                href="/sign-up"
                className="bg-neon text-[#0D0D0D] text-sm font-semibold px-4 py-2 hover:opacity-90 transition"
              >
                Get Profyl →
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="bg-neon text-[#0D0D0D] text-sm font-semibold px-4 py-2 hover:opacity-90 transition"
              >
                Dashboard →
              </Link>
            </Show>
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
            {NAV.map((item) => {
              const targetId =
                item.href === "#" ? "product" : item.href.replace("#", "");
              const isActive = activeId === targetId;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, targetId)}
                  className={`py-2 border-b border-white/[0.04] transition-colors ${
                    isActive ? "text-neon font-medium" : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <div className="pt-2 flex flex-col gap-3">
              <Show when="signed-out">
                <Link
                  href="/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 text-white/70 hover:text-white transition-colors border-b border-white/[0.04]"
                >
                  Sign in
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-neon text-[#0D0D0D] text-center text-sm font-semibold py-3 hover:opacity-90 transition"
                >
                  Get Profyl →
                </Link>
              </Show>

              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-neon text-[#0D0D0D] text-center text-sm font-semibold py-3 hover:opacity-90 transition"
                >
                  Dashboard →
                </Link>
              </Show>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
