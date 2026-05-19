"use client";

import { useState, useRef, useMemo } from "react";
import { marked } from "marked";
import { sanitizeHtmlContent } from "@/lib/sanitize";

interface PostEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  initialData?: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    status: string;
    visibility?: string;
    tags?: string;
  };
  submitLabel: string;
  showStatus?: boolean;
  showVisibility?: boolean;
}

export function PostEditor({ action, initialData, submitLabel, showStatus = true, showVisibility = false }: PostEditorProps) {
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState(initialData?.content || "");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewHtml = useMemo(() => {
    if (!preview) return "";
    try {
      return sanitizeHtmlContent(marked.parse(content) as string);
    } catch {
      return "<p>预览解析失败</p>";
    }
  }, [preview, content]);

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const before = content.substring(0, start);
    const after = content.substring(start);

    const newText = before + text + after;
    setContent(newText);

    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const isTextFile = (name: string) => /\.(md|txt|markdown)$/i.test(name);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (isTextFile(file.name)) {
        // Insert raw markdown content directly (renders as article body)
        const text = await file.text();
        insertAtCursor(`\n${text}\n`);
      } else {
        // Upload image to server
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (data.success && data.url) {
          insertAtCursor(`![${file.name}](${data.url})\n`);
        } else {
          alert(data.error || "上传失败");
        }
      }
    } catch {
      alert("操作失败，请稍后重试");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-primary-600/60 mb-1">标题</label>
        <input name="title" defaultValue={initialData?.title} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-600/60 mb-1">摘要</label>
        <input name="excerpt" defaultValue={initialData?.excerpt || ""} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-600/60 mb-1">标签（逗号分隔）</label>
        <input name="tags" defaultValue={initialData?.tags || ""} className="input-field" placeholder="React, 生活, 教程" />
      </div>
      <div className="flex gap-4">
        <div className={showStatus ? "flex-1" : "w-full"}>
          <label className="block text-sm font-medium text-primary-600/60 mb-1">分类</label>
          <select name="category" defaultValue={initialData?.category || "TECH"} className="input-field">
            <option value="TECH">技术</option>
            <option value="ESSAY">随笔</option>
          </select>
        </div>
        {showStatus ? (
          <div className="flex-1">
            <label className="block text-sm font-medium text-primary-600/60 mb-1">状态</label>
            <select name="status" defaultValue={initialData?.status || "DRAFT"} className="input-field">
              <option value="DRAFT">投稿</option>
              <option value="PUBLISHED">发布</option>
            </select>
          </div>
        ) : (
          <input type="hidden" name="status" value="DRAFT" />
        )}
      </div>

      {showVisibility ? (
        <div>
          <label className="block text-sm font-medium text-primary-600/60 mb-1">可见性</label>
          <select name="visibility" defaultValue={initialData?.visibility || "PUBLIC"} className="input-field">
            <option value="PUBLIC">公开</option>
            <option value="PRIVATE">仅自己可见</option>
          </select>
        </div>
      ) : (
        <input type="hidden" name="visibility" value={initialData?.visibility || "PUBLIC"} />
      )}

      {/* Content area */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-primary-600/60">内容 (Markdown + MDX)</label>
          <div className="flex items-center gap-3">
            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.md,.txt,.markdown"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors
                         disabled:opacity-50 disabled:cursor-wait"
            >
              {uploading ? "上传中..." : "📎 上传"}
            </button>
            <span className="text-primary-200/50">|</span>
            <button type="button" onClick={() => setPreview(!preview)} className="text-xs text-primary-500 hover:underline">
              {preview ? "编辑" : "预览"}
            </button>
          </div>
        </div>

        {preview ? (
          <div className="input-field min-h-[400px] overflow-y-auto [&_img]:max-w-full [&_img]:rounded-lg [&_pre]:bg-[#1e1e2e] [&_pre]:text-gray-300 [&_pre]:p-4 [&_pre]:rounded-lg [&_code]:font-mono [&_code]:text-sm [&_table]:w-full [&_th]:border [&_td]:border [&_th]:p-2 [&_td]:p-2 [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[400px] font-mono text-sm resize-y"
            required
          />
        )}
      </div>

      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
