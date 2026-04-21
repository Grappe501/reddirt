/** Normalize a US phone string to 10 digits or null. */
export function normalizePhone10(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) return d.slice(1) || null;
  if (d.length === 10) return d;
  return null;
}

export function normalizeNamePart(s: string | null | undefined): string | null {
  if (!s?.trim()) return null;
  return s.replace(/\s+/g, " ").trim();
}
