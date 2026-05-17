"use client";

import { registerAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await registerAction(formData);
    if (result.success) {
      router.push("/login");
    } else {
      setError(result.error || "注册失败");
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-warm-text text-center mb-8">注册</h1>
      <form action={handleSubmit} className="card space-y-4">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-warm-muted mb-1">用户名</label>
          <input name="username" type="text" className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-muted mb-1">邮箱</label>
          <input name="email" type="email" className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-muted mb-1">密码</label>
          <input name="password" type="password" className="input-field" minLength={6} required />
        </div>
        <button type="submit" className="btn-primary w-full">注册</button>
        <p className="text-sm text-center text-warm-muted">
          已有账号？<Link href="/login" className="text-warm-link hover:underline">登录</Link>
        </p>
      </form>
    </main>
  );
}
