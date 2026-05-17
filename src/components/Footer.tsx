export function Footer() {
  return (
    <footer className="border-t border-warm-border mt-16 py-8 text-center text-sm text-warm-muted">
      <p>&copy; {new Date().getFullYear()} 我的博客 · 用 ❤️ 和 Next.js 构建</p>
    </footer>
  );
}
