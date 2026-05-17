import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 glass glass-border border-b">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 relative">
          <span className="text-2xl font-extrabold tracking-tight gradient-text transition-all duration-500 group-hover:opacity-80">
            Blog
          </span>
          <span className="hidden sm:inline-block text-sm font-medium text-primary-600/50 tracking-wide">
            记录技术与生活
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {[
            { href: "/", label: "首页" },
            { href: "/tech", label: "技术" },
            { href: "/essay", label: "随笔" },
            { href: "/archive", label: "归档" },
            { href: "/about", label: "关于" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative px-3 py-2 text-sm font-medium text-primary-700/70
                         hover:text-primary-700 rounded-lg
                         transition-colors duration-200
                         hover:bg-primary-50/50"
            >
              {label}
            </Link>
          ))}

          {/* Admin link */}
          {isAdmin && (
            <Link
              href="/admin"
              className="ml-1 px-3 py-1.5 text-xs font-semibold rounded-lg
                         bg-primary-100 text-primary-700
                         hover:bg-primary-200 transition-colors"
            >
              管理
            </Link>
          )}

          {/* Divider */}
          <div className="mx-2 h-5 w-px bg-primary-200/60" />

          {/* Auth */}
          {session ? (
            <span className="flex items-center gap-2 text-sm text-primary-600/80">
              <span className="hidden sm:inline text-xs font-medium text-primary-600/50">
                {session.user?.name}
              </span>
              <LogoutButton />
            </span>
          ) : (
            <Link href="/login" className="btn-primary text-sm !py-1.5 !px-4 !rounded-lg ml-1">
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
