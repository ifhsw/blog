"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from MDX-rendered DOM
    const article = document.querySelector("article");
    if (!article) return;

    const headings = article.querySelectorAll("h2, h3");
    const toc: TocItem[] = [];
    headings.forEach((h) => {
      const id = h.id || h.textContent?.replace(/\s+/g, "-").toLowerCase() || "";
      if (!h.id) h.id = id;
      toc.push({
        id,
        text: h.textContent || "",
        level: h.tagName === "H2" ? 2 : 3,
      });
    });
    setItems(toc);

    // IntersectionObserver for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [content]);

  if (items.length < 2) return null;

  return (
    <nav className="card p-4 overflow-hidden" aria-label="目录">
      <h4 className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-3 flex items-center gap-2 shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        目录
      </h4>
      <ul className="space-y-0.5 min-w-0">
        {items.map((item) => (
          <li key={item.id} className="min-w-0">
            <a
              href={`#${item.id}`}
              className={`block py-1.5 text-sm transition-all duration-200 rounded px-2 truncate ${
                item.level === 3 ? "pl-6 text-xs" : ""
              } ${
                activeId === item.id
                  ? "text-primary-600 font-medium bg-primary-50/60"
                  : "text-primary-600/55 hover:text-primary-700 hover:bg-primary-50/30"
              }`}
              title={item.text}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
