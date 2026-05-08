/**
 * Email normalization and parsing for communication intelligence (no dot-merge heuristics).
 */

export type ParsedEmailAddress = {
  raw: string;
  address: string;
  displayName: string | null;
};

/** Lowercase, trim; returns empty string for unusable input. */
export function normalizeEmail(email: string): string {
  const t = email.trim().toLowerCase();
  if (!t || !t.includes("@")) return "";
  return t;
}

export function extractDomain(email: string): string | null {
  const n = normalizeEmail(email);
  const i = n.lastIndexOf("@");
  if (i <= 0 || i === n.length - 1) return null;
  return n.slice(i + 1) || null;
}

/**
 * Parse a simple RFC-like list "Name <a@b>, c@d" into addresses (best-effort; not a full MIME parser).
 */
export function parseEmailAddressList(raw: string | null | undefined): ParsedEmailAddress[] {
  if (!raw?.trim()) return [];
  const out: ParsedEmailAddress[] = [];
  const parts = raw.split(/,/);
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    const m = p.match(/^(?:"?([^"<]*)"?\s*)?<?([^\s<>]+@[^\s<>]+)>?$/);
    if (m) {
      const addr = normalizeEmail(m[2] ?? "");
      if (!addr) continue;
      const dn = (m[1] ?? "").trim();
      out.push({ raw: p, address: addr, displayName: dn.length ? dn : null });
      continue;
    }
    const bare = normalizeEmail(p);
    if (bare) out.push({ raw: p, address: bare, displayName: null });
  }
  return out;
}
