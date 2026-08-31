"use client";

import { useState, useMemo, useEffect } from "react";
import { useDashboard } from "./DashboardContext";
import { TECH_STACK_REGISTRY } from "@/lib/registries";
import { Plus } from "lucide-react";

export default function TechStackInput() {
  const { localProfile, updateProfile } = useDashboard();
  const [techQuery, setTechQuery] = useState("");
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Filter tech stack suggestions based on query and already selected technologies
  const techSuggestions = useMemo(() => {
    const q = techQuery.trim().toLowerCase();
    const selected = localProfile.techStack || [];
    const filtered = TECH_STACK_REGISTRY.filter(
      (tech) => !selected.includes(tech) && (q === "" || tech.toLowerCase().includes(q))
    );
    return filtered.slice(0, 6); // Limit suggestions dropdown to 6 items
  }, [techQuery, localProfile.techStack]);

  const showCustomOption = useMemo(() => {
    const trimmed = techQuery.trim();
    const selected = localProfile.techStack || [];
    return !!(
      trimmed &&
      !TECH_STACK_REGISTRY.includes(trimmed) &&
      !selected.includes(trimmed)
    );
  }, [techQuery, localProfile.techStack]);

  const dropdownOptions = useMemo(() => {
    const list: Array<{ type: "suggestion" | "custom"; value: string }> = techSuggestions.map(
      (tech) => ({ type: "suggestion", value: tech })
    );
    if (showCustomOption) {
      list.push({ type: "custom", value: techQuery.trim() });
    }
    return list;
  }, [techSuggestions, showCustomOption, techQuery]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [dropdownOptions]);

  const addTechnology = (techName: string) => {
    const selected = localProfile.techStack || [];
    if (selected.length >= 6) return;
    if (selected.includes(techName)) return;

    updateProfile({ techStack: [...selected, techName] });
    setTechQuery("");
    setShowTechDropdown(false);
  };

  const removeTechnology = (techName: string) => {
    const selected = localProfile.techStack || [];
    updateProfile({ techStack: selected.filter((t) => t !== techName) });
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showTechDropdown) {
        setShowTechDropdown(true);
      } else if (dropdownOptions.length > 0) {
        setHighlightedIndex((prev) => (prev + 1 < dropdownOptions.length ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!showTechDropdown) {
        setShowTechDropdown(true);
      } else if (dropdownOptions.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : dropdownOptions.length - 1));
      }
    } else if (e.key === "Enter") {
      if (showTechDropdown && highlightedIndex >= 0 && highlightedIndex < dropdownOptions.length) {
        e.preventDefault();
        addTechnology(dropdownOptions[highlightedIndex].value);
      } else if (techQuery.trim()) {
        e.preventDefault();
        addTechnology(techQuery.trim());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowTechDropdown(false);
    }
  };

  const selectedTechs = localProfile.techStack || [];

  return (
    <section className="relative border border-white/[0.08] bg-[#111] rounded-none p-6">
      <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
      <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-neon" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
            Tech Stack
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/40">
          {selectedTechs.length}/6 selected
        </span>
      </div>

      <div className="relative space-y-4">
        {/* Active chips list */}
        <div className="flex flex-wrap gap-2 min-h-[38px] p-2 border border-white/[0.08] bg-[#0D0D0D] rounded-none">
          {selectedTechs.map((tech) => (
            <span
              key={tech}
              className="group inline-flex items-center gap-2 border border-white/[0.08] px-2.5 py-1 text-xs bg-white/[0.02] rounded-none select-none text-white/80"
            >
              <span className="size-1 bg-neon rounded-full" />
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(tech)}
                className="text-white/40 hover:text-white ml-1 font-mono text-[11px] cursor-pointer"
                aria-label={`Remove ${tech}`}
              >
                ×
              </button>
            </span>
          ))}
          {selectedTechs.length === 0 && (
            <span className="font-mono text-[10px] text-white/30 p-1">
              No technologies selected (Max 6)
            </span>
          )}
        </div>

        {/* Autocomplete Input */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={techQuery}
            disabled={selectedTechs.length >= 6}
            onChange={(e) => {
              setTechQuery(e.target.value);
              setShowTechDropdown(true);
            }}
            onFocus={() => setShowTechDropdown(true)}
            onBlur={() => setTimeout(() => setShowTechDropdown(false), 150)}
            onKeyDown={handleTechKeyDown}
            className="w-full bg-transparent border border-white/[0.08] rounded-none px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon/60 focus:bg-white/[0.02] transition font-mono"
            placeholder={
              selectedTechs.length >= 6
                ? "Max limit reached — remove tags to add others"
                : "Search or type custom technology... (Enter to add)"
            }
          />

          {/* Dropdown suggestions with custom scrollbar styling */}
          {showTechDropdown && selectedTechs.length < 6 && (techSuggestions.length > 0 || showCustomOption) && (
            <div className="absolute left-0 right-0 z-40 mt-1 border border-white/[0.08] bg-[#141414] max-h-56 overflow-y-auto rounded-none shadow-2xl custom-scrollbar">
              {techSuggestions.map((tech, index) => {
                const isHighlighted = index === highlightedIndex;
                return (
                  <button
                     key={tech}
                     type="button"
                     onMouseDown={() => addTechnology(tech)}
                     className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer border-b border-white/[0.04] last:border-b-0 font-mono transition ${
                       isHighlighted
                         ? "bg-white/[0.1] text-white"
                         : "text-white/80 hover:bg-white/[0.05] hover:text-white"
                     }`}
                  >
                    <span>{tech}</span>
                    <span className="font-mono text-[9px] text-neon uppercase tracking-wider">
                      + select
                    </span>
                  </button>
                );
              })}

              {/* Allow custom tag option */}
              {showCustomOption && (() => {
                const customIndex = techSuggestions.length;
                const isHighlighted = customIndex === highlightedIndex;
                return (
                  <button
                    type="button"
                    onMouseDown={() => addTechnology(techQuery.trim())}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between border-t border-white/[0.08] font-semibold cursor-pointer font-mono transition ${
                      isHighlighted
                        ? "bg-white/[0.1] text-white"
                        : "text-neon hover:bg-white/[0.05]"
                    }`}
                  >
                    <span>Add custom &quot;{techQuery.trim()}&quot;</span>
                    <Plus className="size-3.5" />
                  </button>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
