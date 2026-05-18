"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Page error:", error);
    }
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-md animate-fade-in-up">
        <div className="text-7xl font-extrabold text-primary-300/40 mb-4 select-none">
          Oops
        </div>
        <h1 className="text-xl font-bold text-primary-800 mb-2">
          出了点问题
        </h1>
        <p className="text-primary-600/50 mb-8 leading-relaxed">
          抱歉，页面加载时遇到了意外错误。请稍后再试。
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            重试
          </button>
          <Link href="/" className="btn-secondary">
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
