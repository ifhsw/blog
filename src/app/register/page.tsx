"use client";

import { registerAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result = await registerAction(formData);
      if (result.success) {
        router.push("/login");
      } else {
        setError(result.error || "注册失败");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200/50 mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary-800">创建账号</h1>
        <p className="text-sm text-primary-600/50 mt-1">加入我们，开始你的阅读之旅</p>
      </div>

      <form action={handleSubmit} className="card space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-primary-600/60 mb-1">
            用户名
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className="input-field"
            autoComplete="username"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary-600/60 mb-1">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input-field"
            autoComplete="email"
            inputMode="email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary-600/60 mb-1">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input-field"
            autoComplete="new-password"
            minLength={6}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              注册中...
            </>
          ) : (
            "注册"
          )}
        </button>

        <p className="text-sm text-center text-primary-600/60">
          已有账号？<Link href="/login" className="text-primary-500 hover:underline font-medium">登录</Link>
        </p>
      </form>
    </main>
  );
}
