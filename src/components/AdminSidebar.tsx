"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/comments", label: "评论管理" },
  { href: "/admin/users", label: "用户管理" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-48 shrink-0">
      <nav className="card space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === link.href
                ? "bg-warm-accent text-white"
                : "text-warm-muted hover:bg-warm-bg"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
