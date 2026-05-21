"use client";

import { useState, useEffect, useRef } from "react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import { Callout } from "@/lib/editor/extensions/callout";
import { CodeBlock } from "@/lib/editor/extensions/code-block";
import { ImageCaption } from "@/lib/editor/extensions/image-caption";
import { MathInline, MathBlock } from "@/lib/editor/extensions/math";
import { sanitizeHtmlContent } from "@/lib/sanitize";

const extensions = [
  StarterKit.configure({ codeBlock: false }),
  Callout,
  CodeBlock,
  ImageCaption,
  MathInline,
  MathBlock,
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight,
];

export function PostContent({ content }: { content: string }) {
  const [html, setHtml] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const json = JSON.parse(content);
      const raw = generateHTML(json as any, extensions);
      setHtml(sanitizeHtmlContent(raw));
    } catch {
      setHtml(sanitizeHtmlContent(content));
    }
  }, [content]);

  useEffect(() => {
    if (!html) return;
    const container = containerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      const pres = container.querySelectorAll("pre");
      pres.forEach((pre) => {
        if (pre.querySelector(".copy-btn")) return;
        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const btn = document.createElement("button");
        btn.className = "copy-btn";
        btn.textContent = "复制";
        btn.style.cssText = "position:absolute;top:8px;right:8px;padding:4px 10px;font-size:11px;background:rgba(255,255,255,0.1);color:#999;border:1px solid rgba(255,255,255,0.15);border-radius:4px;cursor:pointer;opacity:0;transition:opacity 0.2s;";
        btn.onclick = async () => {
          const code = pre.querySelector("code")?.textContent || "";
          await navigator.clipboard.writeText(code);
          btn.textContent = "已复制!";
          setTimeout(() => (btn.textContent = "复制"), 2000);
        };
        wrapper.appendChild(btn);
        wrapper.onmouseenter = () => (btn.style.opacity = "1");
        wrapper.onmouseleave = () => (btn.style.opacity = "0");
      });
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="py-8 animate-fade-in animation-delay-200 prose prose-lg max-w-none
        [&_img]:max-w-full [&_img]:rounded-lg
        [&_pre]:bg-[#1e1e2e] [&_pre]:text-gray-300 [&_pre]:p-4 [&_pre]:rounded-lg
        [&_code]:font-mono [&_code]:text-sm
        [&_table]:w-full [&_th]:border [&_td]:border [&_th]:p-2 [&_td]:p-2
        [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600"
      dangerouslySetInnerHTML={{ __html: html || '<div class="animate-pulse h-40 bg-primary-100/50 rounded-lg"></div>' }}
    />
  );
}
