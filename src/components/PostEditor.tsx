// src/components/PostEditor.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { Callout } from "@/lib/editor/extensions/callout";
import { CodeBlock } from "@/lib/editor/extensions/code-block";
import { ImageCaption } from "@/lib/editor/extensions/image-caption";
import { MathInline, MathBlock } from "@/lib/editor/extensions/math";
import { TagInput } from "@/components/TagInput";
import { CoverUpload } from "@/components/CoverUpload";

const STORAGE_KEY = "blog-draft";

export function PostEditor({
  action,
  initialData,
  submitLabel,
  showStatus = true,
  showVisibility = false,
  tagSuggestions = [],
  postId,
}: {
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
    coverImage?: string;
    seoTitle?: string;
    seoDesc?: string;
    scheduledAt?: string;
  };
  submitLabel: string;
  showStatus?: boolean;
  showVisibility?: boolean;
  tagSuggestions?: string[];
  postId?: string;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "TECH");
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [visibility, setVisibility] = useState(initialData?.visibility || "PUBLIC");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse initial content (TipTap JSON string)
  const initialContent = (() => {
    if (initialData?.content) {
      try {
        return JSON.parse(initialData.content);
      } catch {
        return { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: initialData.content }] }] };
      }
    }
    return undefined;
  })();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Callout,
      CodeBlock,
      ImageCaption,
      Image,
      MathInline,
      MathBlock,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "开始写作... 输入 / 弹出菜单" }),
      CharacterCount.configure({}),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-5",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            uploadAndInsertImage(file);
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                uploadAndInsertImage(file);
                event.preventDefault();
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    onUpdate: () => {
      setSaveState("unsaved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => autoSaveDraft(), 3000);
    },
  });

  // Restore draft from localStorage
  useEffect(() => {
    if (!initialData?.content && editor) {
      const draft = localStorage.getItem(`${STORAGE_KEY}-new`);
      if (draft) {
        const confirmed = window.confirm("检测到未保存的草稿，是否恢复？");
        if (confirmed) {
          try {
            editor.commands.setContent(JSON.parse(draft));
          } catch { /* ignore */ }
        }
      }
    }
  }, []);

  const autoSaveDraft = useCallback(() => {
    if (!editor) return;
    const json = editor.getJSON();
    const key = postId ? `${STORAGE_KEY}-${postId}` : `${STORAGE_KEY}-new`;
    localStorage.setItem(key, JSON.stringify(json));
    setSaveState("saved");
  }, [editor, postId]);

  const uploadAndInsertImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        editor?.chain().focus().setImageCaption({ src: data.url, alt: file.name }).run();
      } else {
        alert(data.error || "上传失败");
      }
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleToolbarUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) uploadAndInsertImage(file);
  };

  const getContentJson = () => {
    if (!editor) return "";
    return JSON.stringify(editor.getJSON());
  };

  const characterCount = editor?.storage.characterCount?.characters?.() ?? 0;

  // Cleanup
  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  if (!editor) return null;

  return (
    <form ref={formRef} action={action} className="max-w-4xl mx-auto">
      <input type="hidden" name="content" value={getContentJson()} />
      <input type="hidden" name="wordCount" value={characterCount} />

      {/* Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur border-b border-primary-200/20 mb-4 -mx-2">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-primary-700">✏️ {postId ? "编辑文章" : "写文章"}</h1>
          <span className={`text-xs ${saveState === "saved" ? "text-green-500" : saveState === "saving" ? "text-amber-500" : "text-red-400"}`}>
            ● {saveState === "saved" ? "已保存" : saveState === "saving" ? "保存中..." : "未保存"}
          </span>
        </div>
        <div className="flex gap-3">
          <button type="submit" name="status" value="DRAFT" className="text-sm px-4 py-1.5 rounded-lg border border-primary-200/40 text-primary-600 hover:bg-primary-50 transition-colors">
            💾 存草稿
          </button>
          <button type="submit" name="status" value={status} className="text-sm px-5 py-1.5 rounded-lg bg-primary-900 text-white hover:bg-primary-800 transition-colors">
            {submitLabel}
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="px-2 mb-4">
        <CoverUpload name="coverImage" defaultValue={initialData?.coverImage} />
      </div>

      {/* Title */}
      <div className="px-2 mb-3">
        <textarea
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题..."
          rows={1}
          className="w-full text-3xl font-bold border-none outline-none resize-none bg-transparent text-primary-900 placeholder:text-primary-300/60"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
          required
        />
      </div>

      {/* Metadata Row */}
      <div className="px-2 mb-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-primary-400/60">📂</span>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-primary-200/30 rounded-lg px-3 py-1.5 text-sm bg-white text-primary-700 outline-none focus:ring-2 focus:ring-primary-200/50"
          >
            <option value="TECH">技术</option>
            <option value="ESSAY">随笔</option>
          </select>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-primary-400/60">🏷</span>
          <TagInput
            name="tags"
            defaultValue={initialData?.tags ? initialData.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []}
            suggestions={tagSuggestions}
          />
        </div>
        {showVisibility && (
          <div className="flex items-center gap-2">
            <span className="text-primary-400/60">👁</span>
            <select
              name="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="border border-primary-200/30 rounded-lg px-3 py-1.5 text-sm bg-white text-primary-700 outline-none focus:ring-2 focus:ring-primary-200/50"
            >
              <option value="PUBLIC">公开</option>
              <option value="PRIVATE">仅自己可见</option>
            </select>
          </div>
        )}
        {showStatus && (
          <div className="flex items-center gap-2">
            <span className="text-primary-400/60">📌</span>
            <select
              name="status_select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-primary-200/30 rounded-lg px-3 py-1.5 text-sm bg-white text-primary-700 outline-none focus:ring-2 focus:ring-primary-200/50"
            >
              <option value="DRAFT">草稿</option>
              <option value="PUBLISHED">发布</option>
            </select>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="sticky top-12 z-20 px-2 mb-3">
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-white border border-primary-200/20 rounded-xl shadow-sm">
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="B" title="加粗 (Ctrl+B)" />
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="I" title="斜体 (Ctrl+I)" style="italic" />
          <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="S" title="删除线" style="line-through" />
          <span className="w-px h-5 bg-primary-200/30 mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} label="H1" />
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="H2" />
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="H3" />
          <span className="w-px h-5 bg-primary-200/30 mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="&ldquo;" />
          <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} label="&lt;/&gt;" />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleToolbarUpload} className="hidden" />
          <ToolBtn onClick={() => fileInputRef.current?.click()} active={false} label="🖼" title="插入图片" />
          <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()} active={false} label="⊞" title="插入表格" />
          <ToolBtn onClick={() => {
            const url = window.prompt("URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }} active={editor.isActive("link")} label="🔗" title="插入链接" />
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} label="—" title="分割线" />
          <span className="w-px h-5 bg-primary-200/30 mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="•" />
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="1." />
          <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} label="☑" />
          <span className="w-px h-5 bg-primary-200/30 mx-1" />
          <ToolBtn onClick={() => editor.chain().focus().setCallout({ type: "info" }).run()} active={false} label="💡" title="Callout" />
          <ToolBtn onClick={() => {
            const latex = window.prompt("LaTeX 公式:");
            if (latex) editor.chain().focus().setMathBlock({ latex }).run();
          }} active={false} label="∑" title="数学公式" />
          <span className="text-xs text-primary-300/60 ml-auto">{characterCount.toLocaleString()} 字</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="px-2 mb-4">
        <div className="bg-white border border-primary-200/20 rounded-xl overflow-hidden shadow-sm">
          <EditorContent editor={editor} />
          {uploading && (
            <div className="px-6 py-2 text-xs text-primary-400/60 border-t border-primary-200/10">📎 图片上传中...</div>
          )}
        </div>
      </div>

      {/* Collapsible Panels */}
      <div className="px-2 mb-16 space-y-3">
        <details className="bg-white border border-primary-200/20 rounded-xl overflow-hidden">
          <summary className="cursor-pointer px-5 py-3 text-sm text-primary-600/70 hover:text-primary-800 transition-colors select-none">
            🔍 SEO 设置
          </summary>
          <div className="px-5 pb-4 space-y-3">
            <div>
              <label className="text-xs text-primary-400/60">自定义 Slug</label>
              <input name="slug" defaultValue="" className="w-full mt-1 border border-primary-200/30 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-200/50" placeholder="留空则从标题自动生成" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-primary-400/60">SEO 标题</label>
                <input name="seoTitle" defaultValue={initialData?.seoTitle || ""} className="w-full mt-1 border border-primary-200/30 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-200/50" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-primary-400/60">SEO 描述</label>
                <input name="seoDesc" defaultValue={initialData?.seoDesc || ""} className="w-full mt-1 border border-primary-200/30 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-200/50" />
              </div>
            </div>
          </div>
        </details>
        <details className="bg-white border border-primary-200/20 rounded-xl overflow-hidden">
          <summary className="cursor-pointer px-5 py-3 text-sm text-primary-600/70 hover:text-primary-800 transition-colors select-none">
            📅 定时发布
          </summary>
          <div className="px-5 pb-4 flex items-center gap-3">
            <input type="datetime-local" name="scheduledAt" defaultValue={initialData?.scheduledAt || ""} className="border border-primary-200/30 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-200/50" />
            <span className="text-xs text-primary-400/50">留空则立即发布</span>
          </div>
        </details>
      </div>
    </form>
  );
}

function ToolBtn({
  onClick, active, label, title, style,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  title?: string;
  style?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`text-xs px-2 py-1 rounded transition-colors ${
        active ? "bg-primary-200/50 text-primary-800" : "text-primary-500/70 hover:bg-primary-100/50 hover:text-primary-700"
      }`}
      style={style ? { fontStyle: style === "italic" ? "italic" : undefined, textDecoration: style === "line-through" ? "line-through" : undefined } : undefined}
    >
      {label}
    </button>
  );
}
