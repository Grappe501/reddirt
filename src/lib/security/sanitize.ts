import sanitizeHtml from "sanitize-html";

const storyOptions: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "ul", "ol", "li", "a"],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

export function sanitizeStoryHtml(input: string): string {
  return sanitizeHtml(input ?? "", storyOptions).trim();
}

export function sanitizePlainText(input: string, maxLen: number): string {
  const s = (input ?? "").replace(/[\u0000-\u001F\u007F]/g, "").trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}
