"use client";

import { useState } from "react";
import { LocalRepository } from "./DashboardContext";
import TopicsInput from "./TopicsInput";

interface ProjectEditModalProps {
  repo: LocalRepository;
  onClose: () => void;
  onApply: (updated: Partial<LocalRepository>) => void;
}

const inputCls =
  "w-full bg-transparent border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon/60 focus:bg-white/[0.02] transition rounded-none font-mono";

export default function ProjectEditModal({ repo, onClose, onApply }: ProjectEditModalProps) {
  const [customTitle, setCustomTitle] = useState(repo.customTitle || "");
  const [customDescription, setCustomDescription] = useState(repo.customDescription || "");
  const [liveDemoUrl, setLiveDemoUrl] = useState(repo.liveDemoUrl || "");
  const [topics, setTopics] = useState<string[]>(repo.topics || []);

  const handleApply = () => {
    onApply({
      customTitle: customTitle.trim() || null,
      customDescription: customDescription.trim() || null,
      liveDemoUrl: liveDemoUrl.trim() || null,
      topics,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur background overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col border border-white/[0.08] bg-[#0F0F0F] rounded-none shadow-2xl scan-line overflow-hidden">
        {/* Visual corner indicators */}
        <span className="absolute size-3 border-neon -top-px -left-px border-t border-l" />
        <span className="absolute size-3 border-neon -bottom-px -right-px border-b border-r" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.08] select-none shrink-0">
          <div className="flex items-center gap-2">
            <span className="size-1.5 bg-neon" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">
              Projects / Customize Metadata
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-white/50 hover:text-white text-lg cursor-pointer px-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Form Scroll Area (flex-1 independently scrollable) */}
        <div className="relative p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">
          {/* Custom Display Title */}
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
              Custom Display Title (Default: {repo.name})
            </span>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className={inputCls}
              placeholder="e.g. My Custom Name"
            />
          </label>

          {/* Custom Description */}
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
              Custom Description
            </span>
            <textarea
              rows={3}
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full bg-transparent border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon/60 focus:bg-white/[0.02] transition resize-none rounded-none font-mono"
              placeholder="Provide a polished, recruiter-focused explanation of this project."
            />
          </label>

          {/* Live Demo URL (Homepage URL is removed entirely) */}
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
              Live Demo URL
            </span>
            <input
              type="url"
              value={liveDemoUrl}
              onChange={(e) => setLiveDemoUrl(e.target.value)}
              className={inputCls}
              placeholder="https://demo.app"
            />
          </label>

          {/* Topics Tag Input */}
          <TopicsInput topics={topics} onChange={setTopics} />
        </div>

        {/* Modal Actions Footer (Pinned at bottom, shrink-0) */}
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-white/5 select-none shrink-0 bg-[#0F0F0F] z-10">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/50 hover:text-white transition cursor-pointer px-2 py-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-neon text-[#0D0D0D] text-xs font-semibold px-5 py-2.5 rounded-none hover:opacity-90 transition cursor-pointer font-mono"
          >
            Apply →
          </button>
        </div>
      </div>
    </div>
  );
}
