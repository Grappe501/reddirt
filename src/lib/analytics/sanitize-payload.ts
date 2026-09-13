const ALLOWED_KEYS = new Set([
  "pathname",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "label",
  "href",
  "formType",
  "pathway",
  "device",
  "viewport",
  "locale",
  "timezone",
  "returning",
  "scroll",
  "seconds",
  "host",
  "submissionId",
]);

const BLOCKED_KEY = /^(ip|ip_address|email|e-?mail|phone|token|secret|password|authorization|cookie|ssn)$/i;

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
    const text =
      typeof value === "number" && Number.isFinite(value)
        ? String(Math.round(value))
        : typeof value === "string"
          ? value.trim().slice(0, 200)
          : "";
    if (!text) continue;
    if (key === "pathname") {
      const path = sanitizeAnalyticsPath(text);
      if (path) out.pathname = path;
      continue;
    }
    if (key === "device" || key === "viewport") {
      if (text === "phone" || text === "tablet" || text === "desktop" || text === "unknown") {
        out[key] = text;
      }
      continue;
    }
    if (key === "locale") {
      if (/^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(text)) out.locale = text.slice(0, 8);
      continue;
    }
    if (key === "timezone") {
      if (text === "UTC" || text === "GMT" || /^[A-Za-z]+(?:[_-][A-Za-z]+)*(?:\/[A-Za-z0-9_+-]+)+$/.test(text)) {
        out.timezone = text.slice(0, 64);
      }
      continue;
    }
    if (key === "returning") {
      if (text === "0" || text === "1") out.returning = text;
      continue;
    }
    if (key === "scroll") {
      if (text === "25" || text === "50" || text === "75" || text === "100") out.scroll = text;
      continue;
    }
    if (key === "seconds") {
      const n = Number(text);
      if (Number.isInteger(n) && n >= 0 && n <= 86400) out.seconds = String(n);
      continue;
    }
    if (key === "host") {
      const host = text.toLowerCase().replace(/^www\./, "");
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) continue;
      if (/^[a-z0-9][a-z0-9.-]{0,80}\.[a-z]{2,24}$/.test(host)) out.host = host.slice(0, 80);
      continue;
    }
    if (key === "submissionId") {
      if (/^[a-zA-Z0-9_-]{8,64}$/.test(text)) out.submissionId = text.slice(0, 64);
      continue;
    }
    out[key] = text;
  }
  return out;
}
