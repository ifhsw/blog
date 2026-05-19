import sanitizeHtml from "sanitize-html";

const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "del", "sup", "sub", "details", "summary", "kbd",
    "h1", "h2", "h3", "h4", "h5", "h6",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height", "loading"],
    a: ["href", "title", "target", "rel"],
    td: ["align"],
    th: ["align"],
    code: ["class"],
    span: ["class"],
    pre: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

export function sanitizeHtmlContent(html: string): string {
  return sanitizeHtml(html, defaultOptions);
}
