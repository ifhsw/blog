// src/lib/editor/extensions/callout.ts
import { Node, mergeAttributes } from "@tiptap/core";

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs: { type: "info" | "warn" | "tip" | "note" }) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: { default: "info", rendered: false },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type as string;
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      info:  { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af", icon: "💡" },
      warn:  { bg: "#fffbeb", border: "#f59e0b", text: "#92400e", icon: "⚠️" },
      tip:   { bg: "#f0fdf4", border: "#22c55e", text: "#166534", icon: "✅" },
      note:  { bg: "#f9fafb", border: "#6b7280", text: "#374151", icon: "📝" },
    };
    const c = colors[type] || colors.info;
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        style: `border-left:3px solid ${c.border};background:${c.bg};padding:8px 12px;border-radius:0 4px 4px 0;margin:12px 0;`,
      }),
      ["div", { style: `display:flex;align-items:center;gap:6px;color:${c.text};font-weight:600;margin-bottom:4px;` },
        ["span", {}, `${c.icon} ${type.toUpperCase()}`],
      ],
      ["div", { style: `color:${c.text};` }, 0],
    ];
  },

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  addCommands() {
    return {
      setCallout: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
          content: [{ type: "paragraph" }],
        });
      },
    };
  },
});
