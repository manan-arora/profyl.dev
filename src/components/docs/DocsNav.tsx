"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface DocSection {
  id: string;
  label: string;
}

interface DocsNavProps {
  sections: DocSection[];
}

export function DocsNav({ sections }: DocsNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track active section on scroll to highlight in the nav
  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-20% 0px -60% 0px",
    });

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) {
        observer.observe(el);
      }
    });

    // Set initial active section if none are intersecting yet
    if (sections.length > 0 && !activeSection) {
      setActiveSection(sections[0].id);
    }

    return () => {
      observer.disconnect();
    };
  }, [sections, activeSection]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLinkClick = (id: string) => {
    setIsOpen(false);
    setActiveSection(id);
  };

  const activeLabel = sections.find((s) => s.id === activeSection)?.label || "Select Section";

  return (
    <>
      {/* Desktop Sidebar Nav */}
      <div className="hidden lg:block">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-4">
          Navigation
        </div>
        <nav className="flex flex-col gap-2.5">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`text-xs hover:text-neon hover:pl-1 transition-all font-mono block py-0.5 ${
                  isActive ? "text-neon pl-1 font-semibold" : "text-white/60"
                }`}
              >
                {sec.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Mobile Hamburger / Dropdown Nav */}
      <div 
        ref={dropdownRef}
        className="lg:hidden w-full sticky top-[64px] bg-[#0D0D0D]/90 backdrop-blur-md z-25 -mx-6 px-6 py-3 border-b border-white/10"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-xs font-mono text-white/70 hover:text-white transition-colors py-1 cursor-pointer focus:outline-none"
            aria-expanded={isOpen}
            aria-label="Toggle section menu"
          >
            <Menu className="size-4 text-neon" />
            <span>Table of Contents</span>
            <ChevronDown className={`size-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
          
          <span className="text-[11px] font-mono text-neon bg-neon/10 px-2 py-0.5 rounded border border-neon/20 truncate max-w-[200px]">
            {activeLabel}
          </span>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 bg-[#0D0D0D]/95 border-b border-white/10 py-3 px-6 shadow-xl max-h-[60vh] overflow-y-auto"
            >
              <nav className="flex flex-col gap-2 py-1">
                {sections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={() => handleLinkClick(sec.id)}
                      className={`text-xs py-2 border-b border-white/5 last:border-0 font-mono transition-colors block ${
                        isActive ? "text-neon font-semibold pl-1" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {sec.label}
                    </a>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
