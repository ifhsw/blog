"use client";

import { replyToQuestion } from "@/actions/questions";
import { QuestionDeleteButton } from "@/components/QuestionDeleteButton";
import { useState, useRef, useMemo } from "react";
import { marked } from "marked";

interface QuestionData {
  id: string;
  content: string;
  reply: string | null;
  repliedAt: Date | null;
  createdAt: Date;
  user?: { username: string };
}

function RenderedContent({ html }: { html: string }) {
  return (
    <div
      className="text-sm text-primary-800 leading-relaxed
        [&_p]:mb-2 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2
        [&_pre]:bg-[#1e1e2e] [&_pre]:text-gray-300 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-xs [&_pre]:overflow-x-auto
        [&_code]:font-mono [&_code]:text-xs [&_code]:bg-primary-100 [&_code]:px-1 [&_code]:rounded
        [&_pre_code]:bg-transparent [&_pre_code]:px-0
        [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400 [&_blockquote]:pl-3 [&_blockquote]:text-primary-600/70
        [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1
        [&_a]:text-blue-500 [&_a]:underline
        [&_table]:w-full [&_th]:border [&_td]:border [&_th]:p-1 [&_td]:p-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function parseMarkdown(text: string): string {
  try {
    return marked.parse(text) as string;
  } catch {
    return text;
  }
}

export function QuestionList({
  questions,
  isAdmin,
  canDelete,
}: {
  questions: QuestionData[];
  isAdmin: boolean;
  canDelete: boolean;
}) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyPreview, setReplyPreview] = useState(false);
  const [replyUploading, setReplyUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const replyPreviewHtml = useMemo(() => {
    if (!replyPreview) return "";
    return parseMarkdown(replyContent);
  }, [replyPreview, replyContent]);

  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = replyContent.substring(0, start);
    const after = replyContent.substring(start);
    const newText = before + text + after;
    setReplyContent(newText);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  async function handleReplyFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplyUploading(true);
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
        }
      }
    } catch {
      // silently fail
    } finally {
      setReplyUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function openReplyEditor(q: QuestionData) {
    setReplyTo(q.id);
    setReplyContent(q.reply || "");
    setReplyPreview(false);
  }

  if (questions.length === 0) {
    return (
      <div className="card text-center py-12 text-primary-400/60 text-sm">
        暂无提问。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="card space-y-3">
          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-primary-400/50">
              <span className="font-medium text-primary-600/80">
                {isAdmin ? q.user?.username : "匿名提问"}
              </span>
              <span>
                {new Date(q.createdAt).toLocaleDateString("zh-CN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {canDelete && <QuestionDeleteButton questionId={q.id} />}
          </div>

          {/* Question content */}
          <RenderedContent html={parseMarkdown(q.content)} />

          {/* Reply */}
          {(q.reply || isAdmin) && (
            <div className="mt-3 pt-3 border-t border-primary-100/80">
              {/* Reply display */}
              {q.reply && replyTo !== q.id && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary-600/70">
                      管理员回复
                    </span>
                    {q.repliedAt && (
                      <span className="text-xs text-primary-400/50">
                        {new Date(q.repliedAt).toLocaleDateString("zh-CN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {isAdmin && (
                      <button
                        className="text-xs text-blue-500 hover:underline ml-2"
                        onClick={() => openReplyEditor(q)}
                      >
                        编辑
                      </button>
                    )}
                  </div>
                  <RenderedContent html={parseMarkdown(q.reply)} />
                </div>
              )}

              {/* Reply/edit form */}
              {(replyTo === q.id || (!q.reply && isAdmin && replyTo !== q.id)) && (
                <div className={q.reply ? "mt-2" : ""}>
                  {!q.reply && replyTo !== q.id ? (
                    <button
                      className="text-xs text-blue-500 hover:underline"
                      onClick={() => openReplyEditor(q)}
                    >
                      回复
                    </button>
                  ) : (
                    <form
                      action={async (formData) => {
                        formData.set("reply", replyContent);
                        const result = await replyToQuestion(formData);
                        if (result.success) {
                          setReplyTo(null);
                          setReplyContent("");
                        }
                      }}
                      className="space-y-2"
                    >
                      <input type="hidden" name="questionId" value={q.id} />
                      {/* Toolbar */}
                      <div className="flex items-center gap-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.md,.txt,.markdown"
                          onChange={handleReplyFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={replyUploading}
                          className="text-xs text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
                        >
                          {replyUploading ? "上传中..." : "上传图片/文件"}
                        </button>
                        <span className="text-primary-200/50">|</span>
                        <button
                          type="button"
                          onClick={() => setReplyPreview(!replyPreview)}
                          className="text-xs text-primary-500 hover:underline"
                        >
                          {replyPreview ? "编辑" : "预览"}
                        </button>
                      </div>

                      {/* Content area */}
                      {replyPreview ? (
                        <div
                          className="input-field min-h-[80px] overflow-y-auto text-sm
                            [&_img]:max-w-full [&_img]:rounded-lg
                            [&_pre]:bg-[#1e1e2e] [&_pre]:text-gray-300 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-xs
                            [&_code]:font-mono [&_code]:text-xs
                            [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400 [&_blockquote]:pl-3"
                          dangerouslySetInnerHTML={{ __html: replyPreviewHtml }}
                        />
                      ) : (
                        <textarea
                          ref={textareaRef}
                          name="reply"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="input-field min-h-[80px] text-sm font-mono"
                          placeholder="输入回复... (支持 Markdown 和图片)"
                          required
                        />
                      )}
                      <div className="flex gap-2">
                        <button type="submit" className="btn-primary text-xs !py-1.5 !px-3">
                          {q.reply ? "修改回复" : "提交回复"}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary text-xs !py-1.5 !px-3"
                          onClick={() => {
                            setReplyTo(null);
                            setReplyContent("");
                          }}
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
