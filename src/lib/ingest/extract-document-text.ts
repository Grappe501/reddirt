import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/**
 * Strip markup to plain text for RAG / transcripts (best-effort).
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require("pdf-parse") as (b: Buffer, opts?: object) => Promise<{ text?: string }>;
    const res = await pdfParse(buffer);
    return (res.text ?? "").trim();
  } catch {
    return "";
  }
}
