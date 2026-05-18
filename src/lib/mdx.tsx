import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { mdxComponents } from "@/components/mdx";
import { marked } from "marked";

const CALLOUT_TAGS = ["Info", "Warn", "Tip", "Note"];

/**
 * Escape callout tags inside markdown table rows so MDX
 * doesn't try to parse them as components.
 */
function escapeTableTags(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      if (!line.includes("|")) return line;
      let result = line;
      for (const tag of CALLOUT_TAGS) {
        const openRegex = new RegExp(`(?<!\\\\)<${tag}>(?!\\s*</${tag}>)`, "g");
        result = result.replace(openRegex, `\\<${tag}\\>`);
      }
      return result;
    })
    .join("\n");
}

/**
 * Escape @ in email-like patterns outside code blocks.
 */
function escapeAtSigns(source: string): string {
  const parts = source.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part;
      return part.replace(
        /(?<![`\w\\])[\w.+-]+@[\w-]+\.[\w.-]+(?![`\w])/g,
        (match) => match.replace("@", "\\@")
      );
    })
    .join("");
}

/**
 * Escape arbitrary <Tag> patterns outside code blocks and known components.
 * Any <Tag> that's not in our known component list is escaped to <Tag>.
 */
function escapeUnknownTags(source: string): string {
  const knownTags = [...CALLOUT_TAGS, "CodeBlock", "Callout", "ImageCaption"];
  const allKnown = knownTags.join("|");

  const parts = source.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part;
      // Escape <Tag> that is not a known component and not already escaped
      return part.replace(
        new RegExp(`<(?!/?(?:${allKnown})\\b)([A-Z][a-zA-Z]*)\\s*([^>]*)>`, "g"),
        (_, tag, attrs) => `\\<${tag}${attrs}\\>`
      );
    })
    .join("");
}

export async function compileMdx(source: string) {
  let safeSource = escapeAtSigns(source);
  safeSource = escapeTableTags(safeSource);
  safeSource = escapeUnknownTags(safeSource);

  try {
    const { content } = await compileMDX({
      source: safeSource,
      components: mdxComponents,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        parseFrontmatter: false,
      },
    });
    return content;
  } catch (err) {
    console.error("[mdx] compile error, falling back to marked:", (err as Error).message);
    // Fallback: render as plain markdown (no MDX components)
    const html = await marked.parse(safeSource);
    return (
      <div className="mdx-fallback">
        <div className="text-xs text-amber-600/70 mb-4 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200/50">
          ⚠ 部分格式未能解析，以下为纯 Markdown 渲染。
        </div>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }
}
