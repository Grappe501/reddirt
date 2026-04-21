/** Structured body blocks — render without a markdown runtime (CMS-ready). */

export type DocumentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution?: string };

export type RelatedRef = { collection: "story" | "editorial" | "explainer"; slug: string };
