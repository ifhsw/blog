"use client";

import { createQuestion } from "@/actions/questions";
import { useRef, useState, useMemo } from "react";
import { marked } from "marked";
import { sanitizeHtmlContent } from "@/lib/sanitize";

export function QaForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (/\.(md|txt|markdown)$/i.test(file.name)) {
        const text = await file.text();
        insertAtCursor(`\n${text}\n`);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          insertAtCursor(`![${file.name}](${data.url})\n`);
        } else {
          setMessage(data.error || "上传失败");
        }
      }
    } catch {
      setMessage("上传失败");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(formData: FormData) {
    setMessage("");
    setLoading(true);
    try {
      const result = await createQuestion(formData);
      if (result.success) {
        formRef.current?.reset();
        setContent("");
        setPreview(false);
        setMessage("提问已提交");
      } else {
        setMessage(result.error || "提交失败");
      }
    } catch {
      setMessage("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.md,.txt,.markdown"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || loading}
          className="text-xs text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
        >
          {uploading ? "上传中..." : "上传图片/文件"}
        </button>
        <span className="text-primary-200/50">|</span>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="text-xs text-primary-500 hover:underline"
        >
          {preview ? "编辑" : "预览"}
        </button>
      </div>

      {/* Content area */}
      <input type="hidden" name="content" value={content} />
      {preview ? (
        <div
          className="input-field min-h-[100px] overflow-y-auto text-sm
            [&_img]:max-w-full [&_img]:rounded-lg
            [&_pre]:bg-[#1e1e2e] [&_pre]:text-gray-300 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-xs
            [&_code]:font-mono [&_code]:text-xs
            [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-field min-h-[100px] text-sm font-mono"
          placeholder={"写下你想问的问题...\n支持 Markdown 格式和图片上传。\n你的身份对其他用户不可见。"}
          required
          disabled={loading}
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="btn-primary text-sm"
          disabled={loading}
        >
          {loading ? "提交中..." : "匿名提交"}
        </button>
        {message && (
          <span
            className={`text-xs ${
              message.includes("失败") || message.includes("错误")
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
