"use client";

import { changePassword } from "@/actions/auth";
import { useState } from "react";

export function ChangePasswordForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setMessage("");
    setLoading(true);
    try {
      const result = await changePassword(formData);
      if (result.success) {
        setMessage("密码修改成功");
        const form = document.getElementById("change-pwd-form") as HTMLFormElement;
        form?.reset();
      } else {
        setMessage(result.error || "修改失败");
      }
    } catch {
      setMessage("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="change-pwd-form" action={handleSubmit} className="space-y-3 max-w-sm">
      <div>
        <label className="block text-sm font-medium text-primary-600/60 mb-1">
          当前密码
        </label>
        <input
          name="currentPassword"
          type="password"
          className="input-field text-sm"
          autoComplete="current-password"
          required
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary-600/60 mb-1">
          新密码
        </label>
        <input
          name="newPassword"
          type="password"
          className="input-field text-sm"
          autoComplete="new-password"
          minLength={6}
          required
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="btn-primary text-sm"
        disabled={loading}
      >
        {loading ? "保存中..." : "修改密码"}
      </button>
      {message && (
        <p
          className={`text-xs ${
            message.includes("失败") || message.includes("错误")
              ? "text-red-500"
              : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
