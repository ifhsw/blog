"use client";

import { useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractTocFromJson(content: string): TocItem[] {
  try {
    const json = JSON.parse(content);
    const items: TocItem[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      const obj = node as Record<string, unknown>;
      if (obj.type === "heading" && typeof obj.attrs === "object") {
        const attrs = obj.attrs as Record<string, number>;
        const text = (obj.content as Array<{ text?: string }>)?.[0]?.text || "";
        const id = `heading-${attrs.level}-${text.replace(/\s+/g, "-").toLowerCase()}`;
        items.push({ id, text, level: attrs.level || 1 });
      }
      if (Array.isArray(obj.content)) {
        for (const child of obj.content) walk(child);
      }
    };
    walk(json);
    return items;
  } catch {
    const matches = content.matchAll(/<h([2-3])[^>]*>(.*?)<\/h\1>/gi);
    const items: TocItem[] = [];
    for (const m of matches) {
      items.push({ id: `heading-${m[1]}`, text: m[2], level: parseInt(m[1]) });
    }
    return items;
  }
}

export function MobileToc({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  const items = extractTocFromJson(content);
  if (items.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-6 z-40 w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-primary-200/50 text-primary-500 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center lg:hidden"
        aria-label="目录"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[60vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-primary-800">目录</h3>
              <button onClick={() => setOpen(false)} className="text-primary-400 hover:text-primary-600 text-lg">&times;</button>
            </div>
            <nav className="space-y-1">
              {items.map((item) => (
                <a
                  key={item.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    // Find heading by text content
                    const headings = document.querySelectorAll("h2, h3");
                    for (const h of headings) {
                      if (h.textContent?.trim() === item.text) {
                        h.scrollIntoView({ behavior: "smooth" });
                        break;
                      }
                    }
                  }}
                  className={`block py-2 text-sm transition-colors hover:text-primary-800 ${
                    item.level === 2 ? "text-primary-600/80" : "text-primary-500/60 pl-4"
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
