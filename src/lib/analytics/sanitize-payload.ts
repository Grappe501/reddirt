const ALLOWED_KEYS = new Set([
  "pathname",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "label",
  "href",
  "formType",
  "pathway",
]);

const BLOCKED_KEY = /ip|email|phone|token|secret|password|authorization|cookie|ssn/i;

export function sanitizeAnalyticsPath(path?: string): string | undefined {
  if (!path) return undefined;
  const p = path.trim().split("?")[0]?.slice(0, 180) || "";
  if (!p.startsWith("/")) return undefined;
  return p;
}

export function sanitizeAnalyticsPayload(raw: Record<string, unknown> | undefined): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!ALLOWED_KEYS.has(key) || BLOCKED_KEY.test(key)) continue;
    if (typeof value !== "string") continue;
    const text = value.trim().slice(0, 200);
    if (!text) continue;
    if (key === "pathname") {
      const path = sanitizeAnalyticsPath(text);
      if (path) out.pathname = path;
      continue;
    }
    out[key] = text;
  }
  return out;
}
