"use client";

import { loginAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result = await loginAction(formData);
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error || "登录失败");
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
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary-800">欢迎回来</h1>
        <p className="text-sm text-primary-600/50 mt-1">登录你的账号继续阅读</p>
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
            autoComplete="current-password"
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
              登录中...
            </>
          ) : (
            "登录"
          )}
        </button>

        <p className="text-sm text-center text-primary-600/60">
          没有账号？<Link href="/register" className="text-primary-500 hover:underline font-medium">注册</Link>
        </p>
      </form>
    </main>
  );
}
