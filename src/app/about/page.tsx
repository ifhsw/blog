import { marked } from "marked";
import { getSiteSetting } from "@/actions/settings";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const aboutContent = await getSiteSetting("about_content");
  const customHtml = aboutContent ? (marked.parse(aboutContent) as string) : null;

  const skills = [
    { label: "前端开发", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
    { label: "系统设计", items: ["Node.js", "SQLite", "系统架构", "API 设计"] },
    { label: "其他", items: ["阅读", "写作", "开源", "摄影"] },
  ];

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {/* Hero */}
      <section className="animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
          <div className="w-20 h-20 bg-primary-800 flex items-center justify-center text-primary-200 text-3xl font-bold shadow-lg shrink-0"
               style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}>
            玄
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-primary-900 tracking-tight">
              关于
            </h1>
            <p className="mt-2 text-primary-500/50 leading-relaxed max-w-lg">
              墨色无声，笔下有风。这里是我的私人领域。
            </p>
          </div>
        </div>
      </section>

      {/* Skills grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {skills.map((group, i) => (
          <div
            key={group.label}
            className="card animate-fade-in-up"
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            <h3 className="text-sm font-semibold text-primary-600 mb-3 tracking-widest uppercase">
              {group.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span key={item} className="tag text-xs">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Bio */}
      <section className="card animate-fade-in-up" style={{ animationDelay: "400ms" }}>
        <h2 className="text-lg font-bold text-primary-800 mb-4">关于玄桥</h2>
        <div className="space-y-3 text-primary-600/60 leading-relaxed">
          <p>
            技术方面，关注前端开发、系统设计。相信好的架构如同好的水墨画——留白得当，层次分明。
          </p>
          <p>
            闲暇时阅读、写作、探索。每当有所思，便在此处落笔。
          </p>
          <p>
            如有共鸣，欢迎在文章下方留言。静候知音。
          </p>
        </div>
      </section>

      {/* Custom content */}
      {customHtml && (
        <article
          className="mt-10 animate-fade-in-up"
          dangerouslySetInnerHTML={{ __html: customHtml }}
        />
      )}

      {/* Contact hint */}
      <div className="mt-8 text-center text-sm text-primary-400/45 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <p>残雪古桥 · 墨色生寒 · 静候知音</p>
      </div>
    </main>
  );
}
