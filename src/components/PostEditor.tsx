"use client";

import { useState } from "react";

interface PostEditorProps {
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    status: string;
    tags?: string;
  };
  submitLabel: string;
}

export function PostEditor({ action, initialData, submitLabel }: PostEditorProps) {
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState(initialData?.content || "");

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-warm-muted mb-1">标题</label>
        <input name="title" defaultValue={initialData?.title} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-warm-muted mb-1">摘要</label>
        <input name="excerpt" defaultValue={initialData?.excerpt || ""} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-warm-muted mb-1">标签（逗号分隔）</label>
        <input name="tags" defaultValue={initialData?.tags || ""} className="input-field" placeholder="React, 生活, 教程" />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-warm-muted mb-1">分类</label>
          <select name="category" defaultValue={initialData?.category || "TECH"} className="input-field">
            <option value="TECH">技术</option>
            <option value="ESSAY">随笔</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-warm-muted mb-1">状态</label>
          <select name="status" defaultValue={initialData?.status || "DRAFT"} className="input-field">
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">发布</option>
          </select>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-warm-muted">内容 (Markdown)</label>
          <button type="button" onClick={() => setPreview(!preview)} className="text-xs text-warm-link hover:underline">
            切换 {preview ? "编辑" : "预览"}
          </button>
        </div>
        {preview ? (
          <div className="input-field min-h-[300px] prose" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[300px] font-mono text-sm"
            required
          />
        )}
      </div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  );
}
