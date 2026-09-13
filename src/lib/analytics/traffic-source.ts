export type TrafficChannelId = "search" | "social" | "email" | "campaign" | "referral" | "direct";

export const CHANNEL_LABELS: Record<TrafficChannelId, string> = {
  search: "Search / SEO",
  social: "Social",
  email: "Email",
  campaign: "Tagged campaign",
  referral: "Other referral",
  direct: "Direct / unknown",
};

export type ClassifiedTrafficSource = {
  channel: TrafficChannelId;
  label: string;
  engine: string | null;
  host: string | null;
};

const SEARCH_HOST: Array<{ test: RegExp; engine: string }> = [
  { test: /(?:^|\.)google\./i, engine: "Google" },
  { test: /(?:^|\.)bing\./i, engine: "Bing" },
  { test: /(?:^|\.)duckduckgo\./i, engine: "DuckDuckGo" },
  { test: /(?:^|\.)yahoo\./i, engine: "Yahoo" },
  { test: /(?:^|\.)yandex\./i, engine: "Yandex" },
  { test: /(?:^|\.)baidu\./i, engine: "Baidu" },
  { test: /(?:^|\.)ecosia\./i, engine: "Ecosia" },
  { test: /(?:^|\.)brave\./i, engine: "Brave" },
];

const SOCIAL_HOST = /(?:^|\.)(?:facebook|fb|instagram|threads|tiktok|linkedin|reddit|youtube|youtu\.be|nextdoor|x\.com|twitter)\./i;
const SOCIAL_UTM = /facebook|instagram|threads|tiktok|linkedin|reddit|youtube|nextdoor|twitter|\bx\b/i;
const EMAIL_UTM = /email|e-?mail|newsletter|mailchimp|sendgrid|substack/i;
const SEARCH_UTM = /organic|seo|search/i;
const SOCIAL_MEDIUM = /social|paid_social|organic_social/i;

function referrerHost(raw: string | null | undefined): string | null {
  const text = (raw ?? "").trim();
  if (!text || text.startsWith("/")) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}/.test(text)) return null;
  const host = text.split("/")[0]?.replace(/^www\./i, "").toLowerCase() ?? "";
  return host || null;
}

function searchEngine(host: string | null): string | null {
  if (!host) return null;
  for (const row of SEARCH_HOST) {
    if (row.test.test(host)) return row.engine;
  }
  return null;
}

export function classifyTrafficSource(input: {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): ClassifiedTrafficSource {
  const utmSource = (input.utmSource ?? "").trim();
  const utmMedium = (input.utmMedium ?? "").trim();
  const utmCampaign = (input.utmCampaign ?? "").trim();
  const host = referrerHost(input.referrer);
  const engine = searchEngine(host);
  const hasUtm = Boolean(utmSource || utmMedium || utmCampaign);

  if (EMAIL_UTM.test(utmMedium) || EMAIL_UTM.test(utmSource)) {
    return { channel: "email", label: CHANNEL_LABELS.email, engine: null, host };
  }
  if (SEARCH_UTM.test(utmMedium) || engine) {
    return { channel: "search", label: engine ? `${engine} search` : CHANNEL_LABELS.search, engine, host };
  }
  if (SOCIAL_MEDIUM.test(utmMedium) || SOCIAL_UTM.test(utmSource) || (host && SOCIAL_HOST.test(host))) {
    return { channel: "social", label: CHANNEL_LABELS.social, engine: null, host };
  }
  if (hasUtm) {
    return { channel: "campaign", label: CHANNEL_LABELS.campaign, engine: null, host };
  }
  if (host) {
    return { channel: "referral", label: host, engine: null, host };
  }
  return { channel: "direct", label: CHANNEL_LABELS.direct, engine: null, host: null };
}
