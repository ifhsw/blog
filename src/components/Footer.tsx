export function Footer() {
  return (
    <footer className="border-t border-white/8 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-white/70 tracking-tight">玄桥</span>
            <span className="text-xs text-white/25">·</span>
            <span className="text-xs text-white/35">
              &copy; {new Date().getFullYear()} 保留所有权利
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <a href="/about" className="hover:text-white/70 transition-colors">关于</a>
            <a href="/archive" className="hover:text-white/70 transition-colors">归档</a>
            <a href="/tech" className="hover:text-white/70 transition-colors">技术</a>
            <a href="/essay" className="hover:text-white/70 transition-colors">随笔</a>
            <span className="text-white/20">用 Next.js 构建</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
