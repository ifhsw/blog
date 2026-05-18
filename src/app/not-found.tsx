import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-md animate-fade-in-up">
        <div className="text-8xl font-extrabold gradient-text mb-4 select-none">
          404
        </div>
        <h1 className="text-xl font-bold text-primary-800 mb-2">
          页面未找到
        </h1>
        <p className="text-primary-400/50 mb-8 leading-relaxed">
          此页已散佚于风雪中。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            返回首页
          </Link>
          <Link href="/archive" className="btn-secondary">
            浏览归档
          </Link>
        </div>
      </div>
    </main>
  );
}
