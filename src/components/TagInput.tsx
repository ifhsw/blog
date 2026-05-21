// src/components/TagInput.tsx
"use client";

import { useState, useRef } from "react";

interface TagInputProps {
  name: string;
  defaultValue?: string[];
  suggestions?: string[];
}

export function TagInput({ name, defaultValue = [], suggestions = [] }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput("");
    inputRef.current?.focus();
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="relative">
      <input type="hidden" name={name} value={tags.join(",")} />
      <div className="flex flex-wrap gap-2 items-center border border-primary-200/30 rounded-lg p-2 bg-white focus-within:ring-2 focus-within:ring-primary-200/50">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="text-primary-400 hover:text-red-500 leading-none">&times;</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "输入标签，回车确认..." : ""}
          className="flex-1 min-w-[80px] outline-none text-sm bg-transparent py-1"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-primary-200/30 rounded-lg shadow-md max-h-32 overflow-y-auto">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-primary-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
