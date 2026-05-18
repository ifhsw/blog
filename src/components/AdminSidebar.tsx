"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/comments", label: "评论管理" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/settings", label: "站点设置" },
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
                ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                : "text-primary-600/60 hover:bg-primary-50/50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
