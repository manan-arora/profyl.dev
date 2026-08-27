"use client";

import { useState, useMemo } from "react";
import { useDashboard } from "./DashboardContext";
import { TECH_STACK_REGISTRY } from "@/lib/registries";
import { Plus } from "lucide-react";

export default function TechStackInput() {
  const { localProfile, updateProfile } = useDashboard();
  const [techQuery, setTechQuery] = useState("");
  const [showTechDropdown, setShowTechDropdown] = useState(false);

  // Filter tech stack suggestions based on query and already selected technologies
  const techSuggestions = useMemo(() => {
    const q = techQuery.trim().toLowerCase();
    const selected = localProfile.techStack || [];
    const filtered = TECH_STACK_REGISTRY.filter(
      (tech) => !selected.includes(tech) && (q === "" || tech.toLowerCase().includes(q))
    );
    return filtered.slice(0, 6); // Limit suggestions dropdown to 6 items
  }, [techQuery, localProfile.techStack]);

  const addTechnology = (techName: string) => {
    const selected = localProfile.techStack || [];
    if (selected.length >= 8) return;
    if (selected.includes(techName)) return;

    updateProfile({ techStack: [...selected, techName] });
    setTechQuery("");
  };

  const removeTechnology = (techName: string) => {
    const selected = localProfile.techStack || [];
    updateProfile({ techStack: selected.filter((t) => t !== techName) });
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && techQuery.trim()) {
      e.preventDefault();
      addTechnology(techQuery.trim());
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
          {selectedTechs.length}/8 selected
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
              No technologies selected (Max 8)
            </span>
          )}
        </div>

        {/* Autocomplete Input */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={techQuery}
            disabled={selectedTechs.length >= 8}
            onChange={(e) => {
              setTechQuery(e.target.value);
              setShowTechDropdown(true);
            }}
            onFocus={() => setShowTechDropdown(true)}
            onBlur={() => setTimeout(() => setShowTechDropdown(false), 150)}
            onKeyDown={handleTechKeyDown}
            className="w-full bg-transparent border border-white/[0.08] rounded-none px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon/60 focus:bg-white/[0.02] transition font-mono"
            placeholder={
              selectedTechs.length >= 8
                ? "Max limit reached — remove tags to add others"
                : "Search or type custom technology... (Enter to add)"
            }
          />

          {/* Dropdown suggestions with custom scrollbar styling */}
          {showTechDropdown && (techSuggestions.length > 0 || techQuery.trim()) && (
            <div className="absolute left-0 right-0 z-40 mt-1 border border-white/[0.08] bg-[#141414] max-h-56 overflow-y-auto rounded-none shadow-2xl custom-scrollbar">
              {techSuggestions.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onMouseDown={() => addTechnology(tech)}
                  className="w-full text-left px-4 py-2.5 text-xs text-white/80 hover:bg-white/[0.05] hover:text-white flex items-center justify-between cursor-pointer border-b border-white/[0.04] last:border-b-0 font-mono"
                >
                  <span>{tech}</span>
                  <span className="font-mono text-[9px] text-neon uppercase tracking-wider">
                    + select
                  </span>
                </button>
              ))}

              {/* Allow custom tag option */}
              {techQuery.trim() &&
                !TECH_STACK_REGISTRY.includes(techQuery.trim()) &&
                !selectedTechs.includes(techQuery.trim()) && (
                  <button
                    type="button"
                    onMouseDown={() => addTechnology(techQuery.trim())}
                    className="w-full text-left px-4 py-2.5 text-xs text-neon hover:bg-white/[0.05] flex items-center justify-between border-t border-white/[0.08] font-semibold cursor-pointer font-mono"
                  >
                    <span>Add custom &quot;{techQuery.trim()}&quot;</span>
                    <Plus className="size-3.5" />
                  </button>
                )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
