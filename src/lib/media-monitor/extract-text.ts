import sanitizeHtml from "sanitize-html";

/** Strip tags and collapse whitespace — best-effort article text from public HTML. */
export function htmlToPlainText(html: string): string {
  const plain = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return plain.replace(/\s+/g, " ").trim();
}

export function clipText(s: string, max = 12_000): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
