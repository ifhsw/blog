// src/lib/editor/extensions/math.ts
import { Node } from "@tiptap/core";
import katex from "katex";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathInline: {
      setMathInline: (attrs: { latex: string }) => ReturnType;
    };
    mathBlock: {
      setMathBlock: (attrs: { latex: string }) => ReturnType;
    };
  }
}

export const MathInline = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return { latex: { default: "" } };
  },

  renderHTML({ node }) {
    try {
      const html = katex.renderToString(node.attrs.latex, { throwOnError: false });
      return ["span", { class: "math-inline" }, html];
    } catch {
      return ["span", {}, node.attrs.latex];
    }
  },

  parseHTML() {
    return [{ tag: "span.math-inline" }];
  },
});

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return { latex: { default: "" } };
  },

  renderHTML({ node }) {
    try {
      const html = katex.renderToString(node.attrs.latex, { throwOnError: false, displayMode: true });
      return ["div", { class: "math-block", style: "text-align:center;margin:16px 0;" }, html];
    } catch {
      return ["div", {}, node.attrs.latex];
    }
  },

  parseHTML() {
    return [{ tag: "div.math-block" }];
  },
});
