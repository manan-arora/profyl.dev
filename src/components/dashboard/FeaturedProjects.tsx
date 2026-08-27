"use client";

import { useState, useRef } from "react";
import { LocalRepository } from "./DashboardContext";

interface FeaturedProjectsProps {
  repos: LocalRepository[];
  onReorder: (from: number, to: number) => void;
}

export default function FeaturedProjects({ repos, onReorder }: FeaturedProjectsProps) {
  const dragIdx = useRef<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  // Handle Drag Over to trigger immediate visual reflow reordering
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOver(index);

    const from = dragIdx.current;
    if (from !== null && from !== index) {
      onReorder(from, index);
      dragIdx.current = index;
      setDragging(index);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none">
      {repos.map((r, i) => {
        const isDragging = dragging === i;
        const isOver = over === i && dragging !== i;

        return (
          <div
            key={r.id}
            draggable
            onDragStart={(e) => {
              dragIdx.current = i;
              setDragging(i);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", r.id);
            }}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragLeave={() => setOver((cur) => (cur === i ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              dragIdx.current = null;
              setDragging(null);
              setOver(null);
            }}
            onDragEnd={() => {
              dragIdx.current = null;
              setDragging(null);
              setOver(null);
            }}
            className={[
              "group relative flex items-center gap-4 px-4 py-3 bg-[#0F0F0F] cursor-grab active:cursor-grabbing transition-all rounded-none",
              isDragging
                ? "border border-dashed border-neon/50 bg-[#0D0D0D] opacity-25 scale-95"
                : isOver
                ? "border border-neon ring-1 ring-neon shadow-[0_0_12px_rgba(199,255,65,0.25)] translate-y-[-1px]"
                : "border border-neon shadow-[0_0_0_1px_rgba(199,255,65,0.15),0_0_18px_-6px_rgba(199,255,65,0.35)]",
            ].join(" ")}
          >
            <span
              className="font-mono text-[10px] text-white/30 select-none cursor-grab"
              aria-hidden
              title="Drag to reorder"
            >
              ⋮⋮
            </span>
            <div className="font-display text-2xl text-neon w-6 tabular-nums">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-white truncate font-semibold">
                {r.customTitle || r.name}
              </div>
              <div className="text-white/55 text-xs truncate">
                {r.customDescription || r.description || "No description provided"}
              </div>
            </div>
            <span className="border border-neon/40 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em] text-neon rounded-none">
              FEATURED
            </span>
          </div>
        );
      })}
    </div>
  );
}
