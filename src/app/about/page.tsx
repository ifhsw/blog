export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-warm-text mb-6">关于我</h1>
      <div className="card space-y-4">
        <p className="text-warm-muted leading-relaxed">
          你好，欢迎来到我的个人博客。这里记录了我的技术探索和生活随想。
        </p>
        <p className="text-warm-muted leading-relaxed">
          技术方面，我关注前端开发、系统设计和开源项目。生活方面，我喜欢阅读、写作和探索新事物。
        </p>
        <p className="text-warm-muted leading-relaxed">
          希望通过这个博客，与你分享我的思考与收获。
        </p>
      </div>
    </main>
  );
}
