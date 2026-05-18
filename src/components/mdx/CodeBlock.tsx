import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
}

export async function CodeBlock({ code, lang = "text", filename }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "dark",
  });

  return (
    <div className="not-prose group/code relative my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1c1c28] border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex items-center gap-3">
          {filename && (
            <span className="text-xs text-gray-400/70 font-mono">{filename}</span>
          )}
          <span className="text-[0.65rem] uppercase tracking-wider text-gray-500/60 font-mono">
            {lang}
          </span>
        </div>
      </div>
      {/* Code */}
      <div
        className="[&_pre]:!bg-[#12121c] [&_pre]:!p-5 [&_pre]:!m-0 [&_code]:!font-mono [&_code]:text-sm [&_code]:leading-relaxed [&_.line]:min-h-[1.5rem]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
