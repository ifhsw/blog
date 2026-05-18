import React from "react";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { ImageCaption } from "./ImageCaption";

function Info(props: any) { return React.createElement(Callout, { type: "info", ...props }); }
function Warn(props: any) { return React.createElement(Callout, { type: "warn", ...props }); }
function Tip(props: any)  { return React.createElement(Callout, { type: "tip", ...props }); }
function Note(props: any) { return React.createElement(Callout, { type: "note", ...props }); }

function MdxImg(props: any) {
  return React.createElement(ImageCaption, props);
}

function MdxPre({ children, ...props }: any) {
  const codeEl = children?.props;
  const lang = codeEl?.className?.replace("language-", "") || "";
  const code = codeEl?.children || "";

  return React.createElement(
    "span",
    { className: "block code-block-wrapper" },
    React.createElement("pre", { "data-lang": lang || undefined, ...props },
      React.createElement("code", { className: codeEl?.className || "" }, code)
    )
  );
}

export const mdxComponents: Record<string, React.ComponentType<any>> = {
  CodeBlock,
  Callout,
  ImageCaption,
  Info,
  Warn,
  Tip,
  Note,
  img: MdxImg,
  pre: MdxPre,
};
