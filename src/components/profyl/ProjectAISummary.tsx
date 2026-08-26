"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface ProjectAISummaryProps {
    summary: string;
}

export function ProjectAISummary({ summary }: ProjectAISummaryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [visibleLength, setVisibleLength] = useState(0);

    useEffect(() => {
        if (!isOpen) return;

        // Already fully revealed
        if (visibleLength >= summary.length) return;

        const timer = setInterval(() => {
            setVisibleLength((current) => {
                const next = current + 2;

                if (next >= summary.length) {
                    clearInterval(timer);
                    return summary.length;
                }

                return next;
            });
        }, 20);

        return () => clearInterval(timer);
    }, [isOpen, summary, visibleLength]);

    const handleToggle = () => {
        setIsOpen((current) => !current);
    };

    return (
        <div className="mt-5 pt-4 border-t hairline">
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggle();
                }}
                className="w-full flex items-center justify-between text-left group py-2 px-1" aria-expanded={isOpen}
            >
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neon">
                    ◇ AI Summary
                </span>

                <ChevronDown
                    className={`size-3 text-[var(--neon)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isOpen && (
                <p className="font-mono text-[11px] leading-relaxed text-white/60 mt-3">
                    {summary.slice(0, visibleLength)}
                    {visibleLength < summary.length && (
                        <span className="text-neon animate-pulse">▋</span>
                    )}
                </p>
            )}
        </div>
    );
}