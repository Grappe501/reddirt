type Rules = { disallows: string[] };

const cache = new Map<string, Rules | null>();

function parseRobots(text: string): Rules {
  const disallows: string[] = [];
  let applies = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("#")[0]?.trim() ?? "";
    if (!line) continue;
    const m = /^(.+?):\s*(.*)$/i.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === "user-agent") {
      applies = val === "*" || val === "";
    } else if (applies && key === "disallow" && val) {
      disallows.push(val);
    }
  }
  return { disallows };
}

function pathAllowed(pathname: string, rules: Rules): boolean {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  for (const d of rules.disallows) {
    if (!d || d === "/") continue;
    const prefix = d.startsWith("/") ? d : `/${d}`;
    if (p === prefix || p.startsWith(prefix)) return false;
  }
  return true;
}

export async function fetchRobotsRules(origin: string): Promise<Rules | null> {
  if (cache.has(origin)) return cache.get(origin) ?? null;
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": pressMonitorUserAgent() },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      cache.set(origin, null);
      return null;
    }
    const text = await res.text();
    const rules = parseRobots(text);
    cache.set(origin, rules);
    return rules;
  } catch {
    cache.set(origin, null);
    return null;
  }
}

export function pressMonitorUserAgent(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim() || "https://reddirt.example";
  return `RedDirtPressMonitor/1.0 (+${site}; respectful RSS/article fetch for campaign press tracking)`;
}

export async function isUrlAllowedByRobots(url: string): Promise<{ ok: boolean; reason?: string }> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return { ok: false, reason: "unsupported_scheme" };
  }
  const rules = await fetchRobotsRules(u.origin);
  if (!rules) return { ok: true };
  const ok = pathAllowed(u.pathname, rules);
  return ok ? { ok: true } : { ok: false, reason: "robots_disallow" };
}

export function clearRobotsCacheForTests(): void {
  cache.clear();
}
