// src/lib/editor/extensions/image-caption.ts
import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageCaption: {
      setImageCaption: (attrs: { src: string; alt?: string; caption?: string }) => ReturnType;
    };
  }
}

export const ImageCaption = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: null, rendered: true },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const caption = node.attrs.caption;
    return [
      "figure",
      { class: "image-caption-wrapper", style: "margin:16px 0;text-align:center;" },
      ["img", mergeAttributes(HTMLAttributes, {
        style: "max-width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);",
        loading: "lazy",
      })],
      ...(caption
        ? [["figcaption", { style: "margin-top:6px;font-size:13px;color:#888;" }, caption]]
        : []),
    ];
  },

  parseHTML() {
    return [
      { tag: "figure.image-caption-wrapper" },
      { tag: "img[src]" },
    ];
  },

  addCommands() {
    return {
      setImageCaption:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
