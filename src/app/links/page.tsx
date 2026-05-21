import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "友链 - 玄桥",
  description: "推荐博客与友人链接",
};

const friends = [
  { name: "张鑫旭", url: "https://www.zhangxinxu.com/", desc: "鑫空间，专注前端技术" },
  { name: "阮一峰", url: "https://www.ruanyifeng.com/", desc: "科技爱好者周刊" },
  { name: "酷壳", url: "https://www.coolshell.cn/", desc: "享受编程和技术带来的快乐" },
  { name: "DIYgod", url: "https://diygod.cc/", desc: "写代码是热爱，写到世界充满爱" },
];

export default function LinksPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-2xl font-bold text-primary-800 mb-2">友链</h1>
      <p className="text-sm text-primary-500/50 mb-8">互联网上的友人，值得常去看看。</p>
      <div className="space-y-3">
        {friends.map((f) => (
          <a
            key={f.name}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl border border-primary-200/20 hover:bg-primary-50/50 transition-colors group"
          >
            <div className="font-semibold text-primary-800 group-hover:text-primary-900 transition-colors">{f.name}</div>
            <div className="text-sm text-primary-500/50 mt-1">{f.desc}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
