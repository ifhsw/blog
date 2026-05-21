// src/lib/editor/render.ts
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Callout } from "./extensions/callout";
import { CodeBlock } from "./extensions/code-block";
import { ImageCaption } from "./extensions/image-caption";
import { MathInline, MathBlock } from "./extensions/math";

const extensions = [
  StarterKit.configure({ codeBlock: false }),
  Callout,
  CodeBlock,
  ImageCaption,
  Image,
  MathInline,
  MathBlock,
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight,
  Underline,
  Link.configure({ openOnClick: true }),
];

export function renderPostContent(json: object): string {
  try {
    return generateHTML(json as any, extensions);
  } catch (err) {
    console.error("[render] generateHTML error:", (err as Error).message);
    return "<p>内容渲染失败</p>";
  }
}
