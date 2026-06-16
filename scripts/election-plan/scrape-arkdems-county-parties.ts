/**
 * Phase 18.7I — Scrape public Arkansas Democratic county party pages.
 * Source: https://www.arkdems.org/counties/
 *
 * Usage:
 *   npm run election-plan:county-parties:scrape
 *   npx tsx scripts/election-plan/scrape-arkdems-county-parties.ts --dry-run
 */
import * as cheerio from "cheerio";
import { getAllCountyVictoryTargets } from "../../src/lib/election-plan/load-county-victory-targets";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data/campaign-brain/county-party-intelligence");
const DOCS_DIR = path.join(ROOT, "docs/campaign-brain/county-party-intelligence");
const COUNTIES_75 = path.join(ROOT, "data/calendar-command-center/arkansas-counties-75.json");
const INDEX_URL = "https://www.arkdems.org/counties/";
const ELECTION_DAY = new Date("2026-11-03T23:59:59Z");
const UA =
  "RedDirt/election-plan-ingest (+https://github.com/Grappe501/reddirt; public county party research; contact via site)";

type FetchStatus = "ok" | "not_found" | "error" | "skipped";

type CountyPartyProfile = {
  county: string;
  slug: string;
  arkdemsSlug: string;
  countyPartyUrl: string | null;
  countyChair: string | null;
  electionCommissioner: string | null;
  meetingInfoRaw: string | null;
  parsedMeetingRule: ParsedMeetingRule | null;
  meetingLocation: string | null;
  meetingTime: string | null;
  contactUrl: string | null;
  website: string | null;
  facebook: string | null;
  xTwitter: string | null;
  instagram: string | null;
  sourceQuote: string | null;
  sourceUrl: string | null;
  lastFetchedAt: string | null;
  confidence: "high" | "medium" | "low" | "none";
  needsHumanVerification: boolean;
  fetchStatus: FetchStatus;
  fetchError: string | null;
};

type ParsedMeetingRule = {
  recurrence: "monthly" | "weekly" | "unknown";
  weekday: string | null;
  ordinal: "first" | "second" | "third" | "fourth" | "last" | null;
  timeLocal: string | null;
  parseStatus: "parsed" | "needs_human_call";
};

type SourceIndexEntry = {
  county: string;
  slug: string;
  sourceUrl: string | null;
  fetchStatus: FetchStatus;
  lastFetchedAt: string | null;
  confidence: CountyPartyProfile["confidence"];
};

type MeetingCandidate = {
  county: string;
  slug: string;
  date: string;
  timeLocal: string | null;
  location: string | null;
  sourceRule: string;
  routingRecommendation: "candidate_can_attend" | "surrogate_should_attend" | "county_team_follow_up" | "needs_confirmation";
  status: "candidate" | "needs_human_call";
  sourceUrl: string | null;
};

function countyToSlug(county: string): string {
  return county.toLowerCase().replace(/\s+/g, "-");
}

function arkdemsSlugFromCounty(county: string): string {
  return county.toLowerCase().replace(/\s+/g, "-");
}

function sanitizeContactUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("email-protection") || url.includes("cdn-cgi/l/email")) return null;
  return url;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function textAfterHeading($: cheerio.CheerioAPI, headingPattern: RegExp): string | null {
  let found: string | null = null;
  $("h2, h3, h4, h5, h6, p, strong, b").each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    if (headingPattern.test(t) && t.length < 80) {
      const next = $(el).next();
      const sibling = next.text().replace(/\s+/g, " ").trim();
      if (sibling && sibling.length > 0 && sibling.length < 500 && !headingPattern.test(sibling)) {
        found = sibling;
        return false;
      }
      const parentNext = $(el).parent().next();
      const pn = parentNext.text().replace(/\s+/g, " ").trim();
      if (pn && pn.length > 0 && pn.length < 500) {
        found = pn;
        return false;
      }
    }
  });
  return found;
}

function parseUsefulLinks($: cheerio.CheerioAPI): {
  contactUrl: string | null;
  website: string | null;
  facebook: string | null;
  xTwitter: string | null;
  instagram: string | null;
} {
  const out = {
    contactUrl: null as string | null,
    website: null as string | null,
    facebook: null as string | null,
    xTwitter: null as string | null,
    instagram: null as string | null,
  };
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim() ?? "";
    const label = $(el).text().replace(/\s+/g, " ").trim().toLowerCase();
    if (!href || href.startsWith("#")) return;
    const abs = href.startsWith("http") ? href : `https://www.arkdems.org${href.startsWith("/") ? "" : "/"}${href}`;
    if (label.includes("contact county party") || label.includes("contact")) out.contactUrl = abs;
    if (label === "website" || label.includes("county party website")) out.website = abs;
    if (href.includes("facebook.com")) out.facebook = abs;
    if ((href.includes("twitter.com") || href.includes("x.com")) && !href.includes("arkdems")) out.xTwitter = abs;
    if (href.includes("instagram.com") && !href.includes("arkdems")) out.instagram = abs;
  });
  return out;
}

function parseMeetingRule(raw: string | null): ParsedMeetingRule | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const ordinalMatch = lower.match(/\b(first|second|third|fourth|last|1st|2nd|3rd|4th)\b/);
  let ordinalRaw = ordinalMatch?.[1] ?? null;
  const ordinalMap: Record<string, ParsedMeetingRule["ordinal"]> = {
    first: "first",
    second: "second",
    third: "third",
    fourth: "fourth",
    last: "last",
    "1st": "first",
    "2nd": "second",
    "3rd": "third",
    "4th": "fourth",
  };
  const ordinal = ordinalRaw ? (ordinalMap[ordinalRaw] ?? null) : null;
  const weekdayMatch = lower.match(
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
  );
  const timeMatch = raw.match(/(\d{1,2}:\d{2}\s*[AP]M|\d{1,2}\s*[AP]M)/i);

  const weekday = weekdayMatch?.[1] ?? null;
  const timeLocal = timeMatch?.[0]?.trim() ?? null;

  const parseStatus =
    weekday && (ordinal || lower.includes("weekly") || lower.includes("monthly"))
      ? "parsed"
      : "needs_human_call";

  return {
    recurrence: lower.includes("weekly") ? "weekly" : lower.includes("monthly") ? "monthly" : "unknown",
    weekday,
    ordinal,
    timeLocal,
    parseStatus,
  };
}

function meetingLocationFromRaw(raw: string | null): string | null {
  if (!raw) return null;
  const m = raw.match(/\bat\s+(\d{1,2}:\d{2}\s*[AP]M\s+at\s+)?(.+)$/i);
  if (m?.[2]) return m[2].trim();
  const m2 = raw.match(/\bat\s+(.+)$/i);
  return m2?.[1]?.trim() ?? null;
}

function parseCountyPage(html: string, county: string, url: string, fetchedAt: string): CountyPartyProfile {
  const $ = cheerio.load(html);
  const slug = countyToSlug(county);

  let countyChair = textAfterHeading($, /^county chair$/i) ?? textAfterHeading($, /county chair/i);
  let electionCommissioner =
    textAfterHeading($, /^election commissioner$/i) ?? textAfterHeading($, /election commissioner/i);
  let meetingInfoRaw =
    textAfterHeading($, /^meeting info$/i) ?? textAfterHeading($, /meeting info/i);

  // Squarespace often nests headings — regex fallback on main content text
  const mainText = ($("main").text() || $("article").text() || $("body").text())
    .replace(/\s+/g, " ")
    .trim();

  if (!countyChair) {
    const m = mainText.match(/County Chair\s+(.+?)\s+(?:Election Commissioner|Meeting Info|Useful Links|$)/i);
    if (m?.[1]) countyChair = m[1].trim();
  }
  if (!electionCommissioner) {
    const m = mainText.match(/Election Commissioner\s+(.+?)\s+(?:Meeting Info|Useful Links|County Chair|$)/i);
    if (m?.[1]) electionCommissioner = m[1].trim();
  }
  if (!meetingInfoRaw) {
    const m = mainText.match(/Meeting Info\s+(.+?)\s+(?:Useful Links|County Chair|Back to all|$)/i);
    if (m?.[1]) meetingInfoRaw = m[1].trim();
  }

  // Heading walk: h2 label → collect text until next heading
  $("h1, h2, h3, h4").each((_, el) => {
    const label = $(el).text().replace(/\s+/g, " ").trim().toLowerCase();
    const parts: string[] = [];
    let sib = $(el).next();
    while (sib.length && !sib.is("h1, h2, h3, h4")) {
      const t = sib.text().replace(/\s+/g, " ").trim();
      if (t && t.length < 400) parts.push(t);
      sib = sib.next();
    }
    const val = parts.join(" ").trim();
    if (!val) return;
    if (label === "county chair" && !countyChair) countyChair = val;
    if (label === "election commissioner" && !electionCommissioner) electionCommissioner = val;
    if (label === "meeting info" && !meetingInfoRaw) meetingInfoRaw = val;
  });

  const links = parseUsefulLinks($);

  const hasChair = Boolean(countyChair && countyChair.length > 1);
  const hasMeeting = Boolean(meetingInfoRaw && meetingInfoRaw.length > 3);
  let confidence: CountyPartyProfile["confidence"] = "none";
  if (hasChair && hasMeeting) confidence = "high";
  else if (hasChair || hasMeeting) confidence = "medium";
  else if (links.contactUrl || links.website) confidence = "low";

  const parsedMeetingRule = parseMeetingRule(meetingInfoRaw);
  const needsHumanVerification =
    !hasChair || !hasMeeting || parsedMeetingRule?.parseStatus === "needs_human_call";

  const quoteParts = [
    countyChair ? `County Chair: ${countyChair}` : null,
    electionCommissioner ? `Election Commissioner: ${electionCommissioner}` : null,
    meetingInfoRaw ? `Meeting Info: ${meetingInfoRaw}` : null,
  ].filter(Boolean);

  return {
    county,
    slug,
    arkdemsSlug: arkdemsSlugFromCounty(county),
    countyPartyUrl: url,
    countyChair,
    electionCommissioner,
    meetingInfoRaw,
    parsedMeetingRule,
    meetingLocation: meetingLocationFromRaw(meetingInfoRaw),
    meetingTime: parsedMeetingRule?.timeLocal ?? null,
    contactUrl: sanitizeContactUrl(links.contactUrl),
    website: links.website,
    facebook: links.facebook,
    xTwitter: links.xTwitter,
    instagram: links.instagram,
    sourceQuote: quoteParts.length ? quoteParts.join(" · ") : null,
    sourceUrl: url,
    lastFetchedAt: fetchedAt,
    confidence,
    needsHumanVerification,
    fetchStatus: "ok",
    fetchError: null,
  };
}

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function nthWeekdayOfMonth(year: number, month: number, weekday: number, ordinal: ParsedMeetingRule["ordinal"]): Date | null {
  if (!ordinal) return null;
  if (ordinal === "last") {
    const last = new Date(Date.UTC(year, month + 1, 0));
    while (last.getUTCDay() !== weekday) last.setUTCDate(last.getUTCDate() - 1);
    return last;
  }
  const ordMap = { first: 1, second: 2, third: 3, fourth: 4, last: 0 };
  const n = ordMap[ordinal];
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(Date.UTC(year, month, d));
    if (dt.getUTCMonth() !== month) break;
    if (dt.getUTCDay() === weekday) {
      count++;
      if (count === n) return dt;
    }
  }
  return null;
}

function generateMeetingCandidates(profiles: CountyPartyProfile[]): MeetingCandidate[] {
  const out: MeetingCandidate[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (const p of profiles) {
    const rule = p.parsedMeetingRule;
    if (!rule || rule.parseStatus !== "parsed" || !rule.weekday) {
      if (p.meetingInfoRaw) {
        out.push({
          county: p.county,
          slug: p.slug,
          date: "",
          timeLocal: p.meetingTime,
          location: p.meetingLocation,
          sourceRule: p.meetingInfoRaw,
          routingRecommendation: "needs_confirmation",
          status: "needs_human_call",
          sourceUrl: p.sourceUrl,
        });
      }
      continue;
    }

    const wd = WEEKDAY_INDEX[rule.weekday];
    if (wd === undefined) continue;

    const cursor = new Date(now);
    cursor.setDate(1);
    while (cursor <= ELECTION_DAY) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      let date: Date | null = null;
      if (rule.recurrence === "monthly" && rule.ordinal) {
        date = nthWeekdayOfMonth(y, m, wd, rule.ordinal);
      } else if (rule.recurrence === "weekly") {
        date = new Date(cursor);
        while (date.getDay() !== wd) date.setDate(date.getDate() + 1);
        if (date.getMonth() !== m) date = null;
      } else if (rule.ordinal) {
        date = nthWeekdayOfMonth(y, m, wd, rule.ordinal);
      }

      if (date && date >= now && date <= ELECTION_DAY) {
        const iso = date.toISOString().slice(0, 10);
        out.push({
          county: p.county,
          slug: p.slug,
          date: iso,
          timeLocal: rule.timeLocal,
          location: p.meetingLocation,
          sourceRule: p.meetingInfoRaw ?? "",
          routingRecommendation: p.confidence === "high" ? "candidate_can_attend" : "needs_confirmation",
          status: "candidate",
          sourceUrl: p.sourceUrl,
        });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date) || a.county.localeCompare(b.county));
}

function buildSearchChunks(profiles: CountyPartyProfile[]): object[] {
  return profiles
    .filter((p) => p.fetchStatus === "ok")
    .map((p) => {
      const action =
        !p.countyChair || p.needsHumanVerification
          ? "Call county party chair and confirm meeting before scheduling"
          : p.parsedMeetingRule?.parseStatus === "parsed"
            ? "Request speaking slot · confirm with chair · add to calendar as proposed"
            : "Pair with local coffee or house party · surrogate outreach";
      return {
        id: `county-party:${p.slug}`,
        county: p.county,
        slug: p.slug,
        title: `${p.county} County Democratic Party`,
        href: `/election-plan/county-parties/${p.slug}`,
        type: "County Party",
        sourceUrl: p.sourceUrl,
        sourcePath: "data/campaign-brain/county-party-intelligence/county-party-profiles.normalized.json",
        content: [
          p.countyChair ? `County Chair: ${p.countyChair}` : "",
          p.electionCommissioner ? `Election Commissioner: ${p.electionCommissioner}` : "",
          p.meetingInfoRaw ? `Meeting: ${p.meetingInfoRaw}` : "",
          p.website ? `Website: ${p.website}` : "",
          p.facebook ? `Facebook: ${p.facebook}` : "",
          `Recommended action: ${action}`,
          p.needsHumanVerification ? "Status: needs human verification" : "Status: public intelligence · confirm by phone",
          p.sourceUrl ? `Public source: ${p.sourceUrl}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        keywords: [
          p.county.toLowerCase(),
          "county party",
          "democratic party",
          "arkdems",
          p.countyChair?.toLowerCase() ?? "",
          "county chair",
          "meeting",
          `${p.county.toLowerCase()} county chair`,
        ].filter(Boolean),
      };
    });
}

function buildReport(profiles: CountyPartyProfile[], candidates: MeetingCandidate[]): string {
  const scraped = profiles.filter((p) => p.fetchStatus === "ok").length;
  const chairs = profiles.filter((p) => p.countyChair).length;
  const commissioners = profiles.filter((p) => p.electionCommissioner).length;
  const meetings = profiles.filter((p) => p.meetingInfoRaw).length;
  const parseable = profiles.filter((p) => p.parsedMeetingRule?.parseStatus === "parsed").length;
  const needsVerify = profiles.filter((p) => p.needsHumanVerification).length;
  const parsedCandidates = candidates.filter((c) => c.status === "candidate");

  const topMeetings = parsedCandidates
    .filter((c) => c.date >= new Date().toISOString().slice(0, 10))
    .slice(0, 15);

  return `# County Party Intelligence Report

Generated: ${new Date().toISOString()}
Source: [Arkansas Democrats Counties Directory](${INDEX_URL})

## Rollup

| Metric | Count |
|--------|------:|
| Counties in registry | 75 |
| Pages fetched OK | ${scraped} |
| County chairs found | ${chairs} |
| Election commissioners found | ${commissioners} |
| Meeting info found | ${meetings} |
| Parseable meeting rules | ${parseable} |
| Needs human verification | ${needsVerify} |
| Generated meeting candidates | ${parsedCandidates.length} |

## Disclaimer

This is **public web data only**. Pages may be outdated. Fields marked \`needsHumanVerification\` require a phone call before scheduling Kelly or a surrogate.

## Top upcoming county meeting opportunities

${topMeetings.map((m) => `- **${m.date}** · ${m.county} · ${m.timeLocal ?? "time TBD"} · ${m.location ?? "location TBD"} · ${m.routingRecommendation}`).join("\n") || "_None parseable yet — run scrape after network access._"}

## Counties needing human follow-up

${profiles
  .filter((p) => p.needsHumanVerification)
  .slice(0, 25)
  .map((p) => `- ${p.county}: ${p.fetchStatus === "ok" ? "verify chair/meeting" : p.fetchError ?? p.fetchStatus}`)
  .join("\n")}
`;
}

function buildRoutingPlan(candidates: MeetingCandidate[], profiles: CountyPartyProfile[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const strategic = new Set(getAllCountyVictoryTargets().filter((c) => c.isStrategic).map((c) => c.county));
  const growthByCounty = new Map(getAllCountyVictoryTargets().map((c) => [c.county, c.percentIncrease]));

  const upcoming = candidates
    .filter((c) => c.status === "candidate" && c.date >= today)
    .sort((a, b) => {
      const aStrat = strategic.has(a.county) ? 0 : 1;
      const bStrat = strategic.has(b.county) ? 0 : 1;
      if (aStrat !== bStrat) return aStrat - bStrat;
      const aGrowth = growthByCounty.get(a.county) ?? 0;
      const bGrowth = growthByCounty.get(b.county) ?? 0;
      if (bGrowth !== aGrowth) return bGrowth - aGrowth;
      return a.date.localeCompare(b.date);
    });

  const top10 = upcoming.slice(0, 60);
  const top10Deduped: MeetingCandidate[] = [];
  const seenCounty = new Set<string>();
  for (const m of top10) {
    if (seenCounty.has(m.slug)) continue;
    seenCounty.add(m.slug);
    top10Deduped.push(m);
    if (top10Deduped.length >= 10) break;
  }
  const weekdayEvening = upcoming.filter((m) => {
    const d = new Date(`${m.date}T12:00:00`);
    const wd = d.getDay();
    return wd >= 1 && wd <= 4;
  });
  const weekend = upcoming.filter((m) => {
    const d = new Date(`${m.date}T12:00:00`);
    const wd = d.getDay();
    return wd === 0 || wd === 5 || wd === 6;
  });

  return `# County Meeting Routing Plan

Generated: ${new Date().toISOString()}

> **Presentation line:** This is not pretending every county page is perfectly current. It ingests public data, flags what is verified, flags what needs a phone call, and turns county party information into an actionable routing plan.

## Routing categories

| Tag | Meaning |
|-----|---------|
| candidate_can_attend | Parsed public meeting rule · high confidence · weekday/evening |
| surrogate_should_attend | Kelly unavailable · local leader carries message |
| county_team_follow_up | Call party chair · confirm date before locking calendar |
| needs_confirmation | Meeting rule not parseable or low confidence |

## Top 10 by route fit (strategic county + growth target + date)

${top10Deduped
  .map((m) => {
    const strat = strategic.has(m.county) ? "strategic" : "standard";
    const growth = growthByCounty.get(m.county);
    return `- **${m.date}** · ${m.county} · ${m.timeLocal ?? "TBD"} · ${strat}${growth != null ? ` · +${growth.toFixed(0)}% growth` : ""} · ${m.routingRecommendation}`;
  })
  .join("\n") || "_No parseable meetings — human call list required._"}

## Proposed Calendar Fill · Phase C blocks

${upcoming
  .slice(0, 40)
  .map(
    (m) =>
      `- **${m.date}** ${m.county} County Dem meeting · ${m.routingRecommendation} · source: ${m.sourceUrl ?? "arkdems.org"}`,
  )
  .join("\n") || "_No parseable meetings — human call list required._"}

## Locked backbone integration

- Confirmed county party meetings graduate from **proposed** → **scheduled** → **locked** only after chair phone confirmation.
- Unconfirmed parsed dates stay in Calendar Fill Phase C as **intelligence**, not Mobilize events.

## Open weekday evening opportunities

${weekdayEvening.slice(0, 15).map((m) => `- ${m.date} · ${m.county} · ${m.timeLocal ?? "TBD"}`).join("\n") || "_None listed._"}

## Open weekend opportunities

County party meetings on Mon–Thu free weekends for fairs and festivals.

${weekend.slice(0, 8).map((m) => `- ${m.date} · ${m.county} (meeting on weekend — lower Kelly priority unless strategic)`).join("\n") || "_Most county meetings are weekday evenings._"}

## 20-week plan integration

- Lock confirmed county party meetings into **open weekday evening** slots first.
- Pair unconfirmed counties with **coffee / house party** same-week follow-up.
- Do not publish Mobilize until chair confirms public attendance is welcome.

## Counties needing human call (${profiles.filter((p) => p.needsHumanVerification).length})

${profiles
  .filter((p) => p.needsHumanVerification)
  .slice(0, 20)
  .map((p) => `- ${p.county}: ${p.meetingInfoRaw ? "verify meeting rule" : "missing meeting info"} · ${p.sourceUrl ?? ""}`)
  .join("\n")}
`;
}

async function discoverCountyUrls(html: string): Promise<Map<string, string>> {
  const $ = cheerio.load(html);
  const map = new Map<string, string>();
  $('a[href*="/county/"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const m = href.match(/\/county\/([^/]+)\/?/i);
    if (!m) return;
    const arkdemsSlug = m[1]!.toLowerCase();
    const abs = href.startsWith("http") ? href : `https://www.arkdems.org${href.startsWith("/") ? "" : "/"}${href}`;
    map.set(arkdemsSlug, abs.replace(/\/$/, "") + "/");
  });
  return map;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const counties: string[] = JSON.parse(readFileSync(COUNTIES_75, "utf8")).counties;

  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(DOCS_DIR, { recursive: true });

  console.log(`Fetching index ${INDEX_URL}…`);
  let urlMap = new Map<string, string>();
  if (!dryRun) {
    try {
      const indexHtml = await fetchHtml(INDEX_URL);
      urlMap = await discoverCountyUrls(indexHtml);
      console.log(`Discovered ${urlMap.size} county URLs from index.`);
    } catch (e) {
      console.warn("Index fetch failed, using constructed URLs:", e);
    }
  }

  const profiles: CountyPartyProfile[] = [];
  const sourceIndex: SourceIndexEntry[] = [];
  const fetchedAt = new Date().toISOString();

  for (const county of counties) {
    const arkdemsSlug = arkdemsSlugFromCounty(county);
    const slug = countyToSlug(county);
    const url =
      urlMap.get(arkdemsSlug) ?? `https://www.arkdems.org/county/${arkdemsSlug}/`;

    if (dryRun) {
      profiles.push({
        county,
        slug,
        arkdemsSlug,
        countyPartyUrl: url,
        countyChair: null,
        electionCommissioner: null,
        meetingInfoRaw: null,
        parsedMeetingRule: null,
        meetingLocation: null,
        meetingTime: null,
        contactUrl: null,
        website: null,
        facebook: null,
        xTwitter: null,
        instagram: null,
        sourceQuote: null,
        sourceUrl: url,
        lastFetchedAt: null,
        confidence: "none",
        needsHumanVerification: true,
        fetchStatus: "skipped",
        fetchError: "dry-run",
      });
      continue;
    }

    try {
      await sleep(400);
      const html = await fetchHtml(url);
      const profile = parseCountyPage(html, county, url, fetchedAt);
      profiles.push(profile);
      sourceIndex.push({
        county,
        slug,
        sourceUrl: url,
        fetchStatus: profile.fetchStatus,
        lastFetchedAt: fetchedAt,
        confidence: profile.confidence,
      });
      console.log(`OK ${county}: chair=${profile.countyChair ?? "—"} meeting=${profile.meetingInfoRaw ? "yes" : "no"}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      profiles.push({
        county,
        slug,
        arkdemsSlug,
        countyPartyUrl: url,
        countyChair: null,
        electionCommissioner: null,
        meetingInfoRaw: null,
        parsedMeetingRule: null,
        meetingLocation: null,
        meetingTime: null,
        contactUrl: null,
        website: null,
        facebook: null,
        xTwitter: null,
        instagram: null,
        sourceQuote: null,
        sourceUrl: url,
        lastFetchedAt: fetchedAt,
        confidence: "none",
        needsHumanVerification: true,
        fetchStatus: msg.includes("404") ? "not_found" : "error",
        fetchError: msg,
      });
      sourceIndex.push({
        county,
        slug,
        sourceUrl: url,
        fetchStatus: msg.includes("404") ? "not_found" : "error",
        lastFetchedAt: fetchedAt,
        confidence: "none",
      });
      console.warn(`FAIL ${county}: ${msg}`);
    }
  }

  const candidates = generateMeetingCandidates(profiles);
  const chunks = buildSearchChunks(profiles);

  const indexOut = {
    version: 1,
    generatedAt: fetchedAt,
    sourceIndexUrl: INDEX_URL,
    countyCount: counties.length,
    entries: sourceIndex,
  };

  const profilesOut = {
    version: 1,
    generatedAt: fetchedAt,
    disclaimer:
      "Public ArkDems.org data only. May be outdated. needsHumanVerification=true requires phone confirmation before scheduling.",
    profiles,
  };

  const candidatesOut = {
    version: 1,
    generatedAt: fetchedAt,
    electionDay: ELECTION_DAY.toISOString().slice(0, 10),
    candidates,
  };

  if (!dryRun) {
    writeFileSync(path.join(DATA_DIR, "county-party-source-index.json"), JSON.stringify(indexOut, null, 2));
    writeFileSync(path.join(DATA_DIR, "county-party-profiles.normalized.json"), JSON.stringify(profilesOut, null, 2));
    writeFileSync(
      path.join(DATA_DIR, "county-party-meeting-calendar.candidates.json"),
      JSON.stringify(candidatesOut, null, 2),
    );
    writeFileSync(path.join(DATA_DIR, "county-party-search-chunks.json"), JSON.stringify({ version: 1, chunks }, null, 2));
    writeFileSync(path.join(DOCS_DIR, "COUNTY-PARTY-INTELLIGENCE-REPORT.md"), buildReport(profiles, candidates));
    writeFileSync(path.join(DOCS_DIR, "COUNTY-MEETING-ROUTING-PLAN.md"), buildRoutingPlan(candidates, profiles));
  }

  console.log("\nSummary:");
  console.log(`  fetched OK: ${profiles.filter((p) => p.fetchStatus === "ok").length}`);
  console.log(`  chairs: ${profiles.filter((p) => p.countyChair).length}`);
  console.log(`  meetings: ${profiles.filter((p) => p.meetingInfoRaw).length}`);
  console.log(`  parseable: ${profiles.filter((p) => p.parsedMeetingRule?.parseStatus === "parsed").length}`);
  console.log(`  candidates: ${candidates.filter((c) => c.status === "candidate").length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
