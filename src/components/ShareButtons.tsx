"use client";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/post/${slug}` : "";

  function copyLink() {
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-primary-400/60">分享：</span>
      <button
        onClick={copyLink}
        className="p-2 rounded-lg hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-colors"
        aria-label="复制链接"
        title="复制链接"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
    </div>
  );
}
