import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="border-b-2 border-warm-border bg-warm-card">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-warm-accent">
          📖 我的博客
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-warm-muted hover:text-warm-accent transition-colors">
            首页
          </Link>
          <Link href="/tech" className="text-warm-muted hover:text-warm-accent transition-colors">
            技术
          </Link>
          <Link href="/essay" className="text-warm-muted hover:text-warm-accent transition-colors">
            随笔
          </Link>
          <Link href="/archive" className="text-warm-muted hover:text-warm-accent transition-colors">
            归档
          </Link>
          <Link href="/about" className="text-warm-muted hover:text-warm-accent transition-colors">
            关于
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-warm-accent font-medium hover:underline">
              管理
            </Link>
          )}
          {session ? (
            <span className="text-warm-muted">
              {session.user?.name}
              <LogoutButton />
            </span>
          ) : (
            <Link href="/login" className="btn-primary text-sm">
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
