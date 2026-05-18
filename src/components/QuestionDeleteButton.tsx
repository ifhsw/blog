"use client";

import { deleteQuestion } from "@/actions/questions";
import { useState } from "react";

export function QuestionDeleteButton({ questionId }: { questionId: string }) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <span className="flex items-center gap-1 shrink-0">
        <form
          action={async () => {
            const formData = new FormData();
            formData.set("questionId", questionId);
            await deleteQuestion(formData);
          }}
        >
          <button
            type="submit"
            className="text-xs text-red-500 hover:underline"
          >
            确认
          </button>
        </form>
        <button
          className="text-xs text-primary-400 hover:underline"
          onClick={() => setConfirm(false)}
        >
          取消
        </button>
      </span>
    );
  }

  return (
    <button
      className="text-xs text-primary-400/40 hover:text-red-500 shrink-0 transition-colors"
      onClick={() => setConfirm(true)}
      title="删除提问"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </button>
  );
}
