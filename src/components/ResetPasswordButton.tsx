"use client";

import { resetUserPassword } from "@/actions/auth";
import { useState } from "react";

export function ResetPasswordButton({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setMessage("");
    setLoading(true);
    try {
      const result = await resetUserPassword(formData);
      if (result.success) {
        setMessage("密码已重置");
        setOpen(false);
      } else {
        setMessage(result.error || "操作失败");
      }
    } catch {
      setMessage("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="text-xs text-blue-500 hover:underline"
        onClick={() => setOpen(!open)}
      >
        重置密码
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-primary-100/80">
          <form action={handleSubmit} className="space-y-2">
            <input type="hidden" name="userId" value={userId} />
            <p className="text-xs text-primary-500/60">
              为 <span className="font-medium">{username}</span> 设置新密码：
            </p>
            <input
              name="newPassword"
              type="password"
              className="input-field text-sm"
              placeholder="新密码（至少6位）"
              minLength={6}
              required
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn-primary text-xs !py-1.5 !px-3"
                disabled={loading}
              >
                {loading ? "保存中..." : "确认"}
              </button>
              <button
                type="button"
                className="btn-secondary text-xs !py-1.5 !px-3"
                onClick={() => setOpen(false)}
              >
                取消
              </button>
            </div>
          </form>
          {message && (
            <p
              className={`text-xs mt-1 ${
                message.includes("失败") || message.includes("错误")
                  ? "text-red-500"
                  : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </>
  );
}
