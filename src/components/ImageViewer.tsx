"use client";

import { useState, useEffect, useCallback } from "react";

export function ImageViewer() {
  const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);

  const close = useCallback(() => {
    setFullscreenSrc(null);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const img = e.target as HTMLElement;
      if (img.tagName !== "IMG") return;
      if (img.closest("[data-no-fullscreen]")) return;
      const src = (img as HTMLImageElement).src;
      if (src) {
        setFullscreenSrc(src);
        document.body.style.overflow = "hidden";
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [close]);

  if (!fullscreenSrc) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4 animate-fade-in"
      onClick={close}
    >
      <img
        src={fullscreenSrc}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        onClick={close}
        aria-label="关闭"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
