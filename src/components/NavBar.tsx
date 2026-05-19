"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LogoutButton } from "./LogoutButton";

interface NavBarProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
  userName: string | null;
}

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/tech", label: "技术" },
  { href: "/essay", label: "随笔" },
  { href: "/archive", label: "归档" },
  { href: "/qa", label: "问答" },
  { href: "/about", label: "关于" },
];

export function NavBar({ isAdmin, isLoggedIn, userName }: NavBarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 glass glass-border border-b">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 relative z-10">
          <span className="text-2xl font-extrabold tracking-tight gradient-text transition-all duration-500 group-hover:opacity-80">
            玄桥
          </span>
          <span className="hidden sm:inline-block text-sm font-medium text-primary-400/45 tracking-widest">
            写意留白
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-primary-700 bg-primary-50/70"
                    : "text-primary-700/70 hover:text-primary-700 hover:bg-primary-50/50"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400" />
                )}
              </Link>
            );
          })}

          {/* Write post — logged-in users */}
          {isLoggedIn && (
            <Link
              href={isAdmin ? "/admin/posts/new" : "/my-posts/new"}
              className="ml-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              写文章
            </Link>
          )}

          {/* My posts — non-admin users */}
          {isLoggedIn && !isAdmin && (
            <Link
              href="/my-posts"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                pathname.startsWith("/my-posts")
                  ? "bg-primary-500 text-white"
                  : "bg-primary-100 text-primary-700 hover:bg-primary-200"
              }`}
            >
              我的文章
            </Link>
          )}

          {/* Admin link */}
          {isAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-primary-500 text-white"
                  : "bg-primary-100 text-primary-700 hover:bg-primary-200"
              }`}
            >
              管理
            </Link>
          )}

          {/* Search */}
          <form action="/search" className="flex items-center">
            <input
              name="q"
              type="search"
              placeholder="搜索..."
              className="w-28 px-2 py-1 text-xs rounded-lg border border-primary-200/50 bg-transparent
                         text-primary-700 placeholder-primary-400/50
                         focus:outline-none focus:border-primary-300 focus:w-40 transition-all duration-200"
            />
          </form>

          {/* Divider */}
          <div className="mx-2 h-5 w-px bg-primary-200/60" />

          {/* Auth */}
          {userName ? (
            <span className="flex items-center gap-2 text-sm text-primary-600/80">
              <Link
                href="/account"
                className="hidden sm:inline text-xs font-medium text-primary-600/50 hover:text-primary-700 transition-colors"
              >
                {userName}
              </Link>
              <LogoutButton />
            </span>
          ) : (
            <Link
              href="/login"
              className="btn-primary text-sm !py-1.5 !px-4 !rounded-lg ml-1"
            >
              登录
            </Link>
          )}
        </nav>

        {/* Mobile: hamburger + login */}
        <div className="flex items-center gap-2 md:hidden">
          {!userName && (
            <Link href="/login" className="btn-primary text-xs !py-1 !px-3 !rounded-lg">
              登录
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-10 p-2 -mr-2 rounded-lg text-primary-700 hover:bg-primary-50/50 transition-colors"
            aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={mobileOpen}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                  mobileOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ${
                  mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-40 md:hidden transition-transform duration-300 var(--ease-spring) ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="pt-20 px-6 pb-6 space-y-1">
          {navLinks.map(({ href, label }) => {
            const isActive = href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-semibold"
                    : "text-primary-700/70 hover:bg-primary-50/30 hover:text-primary-700"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {isLoggedIn && (
            <Link
              href={isAdmin ? "/admin/posts/new" : "/my-posts/new"}
              className="mt-2 block px-4 py-3 rounded-xl text-base font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              写文章
            </Link>
          )}

          {isLoggedIn && !isAdmin && (
            <Link
              href="/my-posts"
              className={`mt-2 block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                pathname.startsWith("/my-posts")
                  ? "bg-primary-500 text-white"
                  : "bg-primary-100 text-primary-700"
              }`}
            >
              我的文章
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`mt-2 block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-primary-500 text-white"
                  : "bg-primary-100 text-primary-700"
              }`}
            >
              管理后台
            </Link>
          )}

          {userName && (
            <div className="mt-4 pt-4 border-t border-primary-200/30 px-4">
              <Link
                href="/account"
                className="block text-sm text-primary-600/70 hover:text-primary-800 transition-colors mb-2"
              >
                {userName}
              </Link>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
