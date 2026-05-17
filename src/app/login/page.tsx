"use client";

import { loginAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await loginAction(formData);
    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "登录失败");
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold text-primary-800 text-center mb-8">登录</h1>
      <form action={handleSubmit} className="card space-y-4">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-primary-600/60 mb-1">邮箱</label>
          <input name="email" type="email" className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary-600/60 mb-1">密码</label>
          <input name="password" type="password" className="input-field" required />
        </div>
        <button type="submit" className="btn-primary w-full">登录</button>
        <p className="text-sm text-center text-primary-600/60">
          没有账号？<Link href="/register" className="text-primary-500 hover:underline">注册</Link>
        </p>
      </form>
    </main>
  );
}
