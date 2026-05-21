// src/lib/editor/extensions/code-block.ts
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { toHtml } from "hast-util-to-html";

const lowlight = createLowlight(common);

export const CodeBlock = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: "plaintext",
        rendered: true,
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const lang = node.attrs.language || "plaintext";
    const tree = lowlight.highlight(lang, node.textContent);
    const html = toHtml(tree);
    return [
      "div",
      { class: "code-block-wrapper" },
      ["div", { class: "code-block-header" },
        ["span", { class: "code-block-dots" }, "●●●"],
        ["span", { class: "code-block-lang" }, lang],
      ],
      ["pre", HTMLAttributes,
        ["code", { class: `language-${lang}` }, html],
      ],
    ];
  },
});
