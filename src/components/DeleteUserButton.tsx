"use client";

import { deleteUser } from "@/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteUserButton({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDelete() {
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      const result = await deleteUser(formData);
      if (result.success) {
        router.refresh();
      } else {
        setMessage(result.error || "删除失败");
        setConfirming(false);
      }
    } catch {
      setMessage("网络错误");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!confirming ? (
        <button
          className="text-xs text-red-400 hover:text-red-600 hover:underline transition-colors"
          onClick={() => setConfirming(true)}
        >
          删除
        </button>
      ) : (
        <span className="inline-flex items-center gap-2 text-xs">
          <span className="text-red-500">确定删除 {username}？</span>
          <button
            className="px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "..." : "确认"}
          </button>
          <button
            className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
            onClick={() => { setConfirming(false); setMessage(""); }}
          >
            取消
          </button>
          {message && <span className="text-red-400">{message}</span>}
        </span>
      )}
    </>
  );
}
