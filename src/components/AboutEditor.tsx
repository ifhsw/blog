"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { sanitizeHtmlContent } from "@/lib/sanitize";
import { updateSiteSetting } from "@/actions/settings";

interface Props {
  initialContent: string | null;
}

export function AboutEditor({ initialContent }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent || "");
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
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

  function insertAtCursor(text: string) {
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
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        insertAtCursor(`![${file.name}](${data.url})\n`);
      } else {
        setMessage(data.error || "上传失败");
      }
    } catch {
      setMessage("上传失败");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await updateSiteSetting("about_content", content);
      setMessage("保存成功");
      router.refresh();
    } catch {
      setMessage("保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
        >
          {uploading ? "上传中..." : "上传图片"}
        </button>
        <span className="text-primary-200/50">|</span>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="text-xs text-primary-500 hover:underline"
        >
          {preview ? "编辑" : "预览"}
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm !py-1.5 !px-4"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="input-field min-h-[300px] overflow-y-auto
            [&_img]:max-w-full [&_img]:rounded-lg
            [&_pre]:bg-[#1e1e2e] [&_pre]:text-gray-300 [&_pre]:p-4 [&_pre]:rounded-lg
            [&_code]:font-mono [&_code]:text-sm
            [&_table]:w-full [&_th]:border [&_td]:border [&_th]:p-2 [&_td]:p-2
            [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-field min-h-[300px] font-mono text-sm resize-y"
          placeholder="在此编辑关于页面的 Markdown 内容..."
        />
      )}

      {message && (
        <p
          className={`text-sm ${
            message.includes("失败") ? "text-red-500" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
