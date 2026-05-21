"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    router.push(`/?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2 text-sm rounded-lg border border-primary-200/40 text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ← 上一页
      </button>
      {start > 1 && (
        <>
          <button onClick={() => goTo(1)} className="w-9 h-9 text-sm rounded-lg border border-primary-200/40 text-primary-600 hover:bg-primary-50 transition-colors">1</button>
          {start > 2 && <span className="text-primary-400/40">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={`w-9 h-9 text-sm rounded-lg transition-colors ${
            p === currentPage
              ? "bg-primary-900 text-white"
              : "border border-primary-200/40 text-primary-600 hover:bg-primary-50"
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-primary-400/40">...</span>}
          <button onClick={() => goTo(totalPages)} className="w-9 h-9 text-sm rounded-lg border border-primary-200/40 text-primary-600 hover:bg-primary-50 transition-colors">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 text-sm rounded-lg border border-primary-200/40 text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        下一页 →
      </button>
    </div>
  );
}
