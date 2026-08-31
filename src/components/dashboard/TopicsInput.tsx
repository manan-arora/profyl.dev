"use client";

import { useState, useMemo, useEffect } from "react";
import { TOPICS_REGISTRY, TECH_STACK_REGISTRY } from "@/lib/registries";
import { Plus } from "lucide-react";

interface TopicsInputProps {
  topics: string[];
  onChange: (topics: string[]) => void;
}

export default function TopicsInput({ topics, onChange }: TopicsInputProps) {
  const [topicQuery, setTopicQuery] = useState("");
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const combinedTopics = useMemo(() => {
    return Array.from(new Set([...TOPICS_REGISTRY, ...TECH_STACK_REGISTRY]));
  }, []);

  const topicSuggestions = useMemo(() => {
    const q = topicQuery.trim().toLowerCase();
    const filtered = combinedTopics.filter(
      (topic) => !topics.includes(topic) && (q === "" || topic.toLowerCase().includes(q))
    );
    return filtered.slice(0, 6);
  }, [topicQuery, topics, combinedTopics]);

  const showCustomOption = useMemo(() => {
    const trimmed = topicQuery.trim();
    return !!(
      trimmed &&
      !TOPICS_REGISTRY.includes(trimmed) &&
      !topics.includes(trimmed)
    );
  }, [topicQuery, topics]);

  const dropdownOptions = useMemo(() => {
    const list: Array<{ type: "suggestion" | "custom"; value: string }> = topicSuggestions.map(
      (topic) => ({ type: "suggestion", value: topic })
    );
    if (showCustomOption) {
      list.push({ type: "custom", value: topicQuery.trim() });
    }
    return list;
  }, [topicSuggestions, showCustomOption, topicQuery]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [dropdownOptions]);

  const addTopic = (topicName: string) => {
    if (topics.length >= 20) return; // Topics limit: max 20 tags
    if (topics.includes(topicName)) return;

    onChange([...topics, topicName]);
    setTopicQuery("");
    setShowTopicDropdown(false);
  };

  const removeTopic = (topicName: string) => {
    onChange(topics.filter((t) => t !== topicName));
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showTopicDropdown) {
        setShowTopicDropdown(true);
      } else if (dropdownOptions.length > 0) {
        setHighlightedIndex((prev) => (prev + 1 < dropdownOptions.length ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!showTopicDropdown) {
        setShowTopicDropdown(true);
      } else if (dropdownOptions.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : dropdownOptions.length - 1));
      }
    } else if (e.key === "Enter") {
      if (showTopicDropdown && highlightedIndex >= 0 && highlightedIndex < dropdownOptions.length) {
        e.preventDefault();
        addTopic(dropdownOptions[highlightedIndex].value);
      } else if (topicQuery.trim()) {
        e.preventDefault();
        addTopic(topicQuery.trim());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowTopicDropdown(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between select-none">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
          Project Topics
        </span>
        <span className="font-mono text-[9px] text-white/40">{topics.length}/20 selected</span>
      </div>

      {/* Selected tags list */}
      <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 border border-white/[0.08] bg-black rounded-none">
        {topics.map((t) => (
          <span
            key={t}
            className="group inline-flex items-center gap-1.5 border border-white/[0.08] px-2 py-0.5 text-xs bg-white/[0.02] rounded-none select-none text-white/80"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTopic(t)}
              className="text-white/40 hover:text-white font-mono text-[10px] cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
        {topics.length === 0 && (
          <span className="font-mono text-[9px] text-white/30 p-1">No custom topics</span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={topicQuery}
          disabled={topics.length >= 20}
          onChange={(e) => {
            setTopicQuery(e.target.value);
            setShowTopicDropdown(true);
          }}
          onFocus={() => setShowTopicDropdown(true)}
          onBlur={() => setTimeout(() => setShowTopicDropdown(false), 150)}
          onKeyDown={handleTopicKeyDown}
          className="w-full bg-transparent border border-white/[0.08] rounded-none px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon/60 focus:bg-white/[0.02] transition font-mono"
          placeholder={
            topics.length >= 20
              ? "Max topics limit reached"
              : "Add tags (e.g. SaaS, Auth) / Enter to add custom"
          }
        />

         {showTopicDropdown && topics.length < 20 && (topicSuggestions.length > 0 || showCustomOption) && (
          <div className="absolute left-0 right-0 z-40 mt-1 border border-white/[0.08] bg-[#141414] max-h-40 overflow-y-auto rounded-none shadow-2xl custom-scrollbar">
            {topicSuggestions.map((topic, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={topic}
                  type="button"
                  onMouseDown={() => addTopic(topic)}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between cursor-pointer border-b border-white/[0.04] last:border-b-0 font-mono transition ${
                    isHighlighted
                      ? "bg-white/[0.1] text-white"
                      : "text-white/80 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span>{topic}</span>
                  <span className="font-mono text-[9px] text-neon uppercase tracking-wider">
                    + add
                  </span>
                </button>
              );
            })}

            {showCustomOption && (() => {
              const customIndex = topicSuggestions.length;
              const isHighlighted = customIndex === highlightedIndex;
              return (
                <button
                  type="button"
                  onMouseDown={() => addTopic(topicQuery.trim())}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between border-t border-white/[0.08] font-semibold cursor-pointer font-mono transition ${
                    isHighlighted
                      ? "bg-white/[0.1] text-white"
                      : "text-neon hover:bg-white/[0.05]"
                  }`}
                >
                  <span>Add custom &quot;{topicQuery.trim()}&quot;</span>
                  <Plus className="size-3.5" />
                </button>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
