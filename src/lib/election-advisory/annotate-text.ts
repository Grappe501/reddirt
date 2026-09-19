import { aeacGlossary } from "@/content/election-advisory/glossary";

export type AeacTextPart =
  | { type: "text"; value: string }
  | { type: "term"; value: string; slug: string };

type AliasRow = { alias: string; slug: string; length: number };

const aliasRows: AliasRow[] = aeacGlossary
  .flatMap((term) => term.aliases.map((alias) => ({ alias, slug: term.slug, length: alias.length })))
  .sort((a, b) => b.length - a.length);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const aliasPattern = aliasRows.map((row) => escapeRegExp(row.alias)).join("|");
const aliasRegex = aliasPattern ? new RegExp(`(?<![A-Za-z])(${aliasPattern})(?![A-Za-z])`, "gi") : null;
const aliasSlug = new Map(aliasRows.map((row) => [row.alias.toLowerCase(), row.slug]));

export function splitAeacDefinedText(text: string): AeacTextPart[] {
  if (!text || !aliasRegex) return [{ type: "text", value: text }];
  const parts: AeacTextPart[] = [];
  let cursor = 0;
  const matches = text.matchAll(aliasRegex);
  for (const match of matches) {
    const value = match[0];
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ type: "text", value: text.slice(cursor, index) });
    const slug = aliasSlug.get(value.toLowerCase());
    if (slug) parts.push({ type: "term", value, slug });
    else parts.push({ type: "text", value });
    cursor = index + value.length;
  }
  if (cursor < text.length) parts.push({ type: "text", value: text.slice(cursor) });
  return parts.length ? parts : [{ type: "text", value: text }];
}
