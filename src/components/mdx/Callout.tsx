import type { ReactNode } from "react";

type CalloutType = "info" | "warn" | "tip" | "note";

const config: Record<CalloutType, { icon: string; border: string; bg: string; text: string; label: string }> = {
  info: {
    icon: "ℹ",
    border: "border-blue-400/40",
    bg: "bg-blue-50/60",
    text: "text-blue-800",
    label: "信息",
  },
  warn: {
    icon: "⚠",
    border: "border-amber-400/50",
    bg: "bg-amber-50/60",
    text: "text-amber-800",
    label: "注意",
  },
  tip: {
    icon: "💡",
    border: "border-green-400/40",
    bg: "bg-green-50/60",
    text: "text-green-800",
    label: "提示",
  },
  note: {
    icon: "📝",
    border: "border-gray-300/60",
    bg: "bg-gray-50/60",
    text: "text-gray-700",
    label: "笔记",
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const c = config[type];
  return (
    <div className={`not-prose my-5 border-l-[3px] ${c.border} ${c.bg} rounded-r-xl p-4 backdrop-blur-sm`}>
      <div className={`flex items-center gap-2 text-sm font-semibold ${c.text} mb-1.5`}>
        <span className="text-base">{c.icon}</span>
        <span>{title || c.label}</span>
      </div>
      <div className={`text-sm ${c.text}/80 leading-relaxed`}>
        {children}
      </div>
    </div>
  );
}
