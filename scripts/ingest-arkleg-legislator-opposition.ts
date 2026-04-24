/**
 * INTEL-4B — Arkansas arkleg + Senate HTML ingest for opposition intelligence (governed scraper).
 *
 * Fetches official legislator pages from arkleg.state.ar.us (per-session bill grids), optional
 * bill-detail pages for BLR/Sliq committee & floor video links, and senate.arkansas.gov biography.
 *
 * Usage (from RedDirt/):
 *   npm run ingest:arkleg-opposition -- --dry-run
 *   npm run ingest:arkleg-opposition -- --entity-id <cuid>
 *   npm run ingest:arkleg-opposition -- --replace
 *
 * Flags:
 *   --dry-run          Parse + report only (no DB writes)
 *   --replace          Delete prior rows tagged ingestPipeline=arkleg-legislator-v1 for this entity
 *   --entity-id        Use existing OppositionEntity
 *   --member           arkleg member query (default: K.+Hammer)
 *   --senate-profile   Senate bio URL (default Kim Hammer)
 *   --deep-bills       none | primary | all   (default: primary — bill detail + first committee video)
 *   --min-session-year (default 2019) — filters dropdown values; arkleg exposes 2019+ for Hammer
 *   --write-summary    Write arkleg-hammer-ingest-summary*.json and arkleg-hammer-all-bills.dryrun.json (full grid)
 *   --write-shortlist  Write arkleg-review-shortlist.json (or pass --write-summary to write both)
 *   --shortlist-probe-videos  With shortlist output: fetch bill-detail pages for Sliq URLs (rate-limited)
 *
 * Controversy = heuristic keyword topics only (not legal or AI “truth”); shortlist rows are discovery only.
 * INTEL-4B-3: shortlist + opponent-legislative-candidates.json are NOT verified — human review required.
 */
import { execFile } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import * as cheerio from "cheerio";
import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { OppositionConfidence, OppositionEntityType, OppositionReviewStatus, OppositionSourceType } from "@prisma/client";
import { prisma } from "../src/lib/db";
import {
  createOppositionBillRecord,
  createOppositionEntity,
  createOppositionMessageRecord,
  createOppositionSource,
  createOppositionVideoRecord,
} from "../src/lib/campaign-engine/opposition-intelligence";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, "..");

const LOG = "[ingest:arkleg-opposition]";
const PIPELINE = "arkleg-legislator-v1";
const ARKLEG_BASE = "https://www.arkleg.state.ar.us";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type Db = PrismaClient | Prisma.TransactionClient;

type ParsedBill = {
  billNumber: string;
  title: string;
  detailHref: string;
  roleSection: string;
  sessionCode: string;
};

type MeetingRow = {
  dateRaw: string;
  meetingLabel: string;
  videoUrl: string | null;
  mediaStartTime: string | null;
};

type Controversy = {
  controversialHeuristic: boolean;
  topics: string[];
  impactHint: string | null;
};

const CONTROVERSY_RULES: { topic: string; impactHint?: string; re: RegExp }[] = [
  { topic: "ELECTIONS_AND_BALLOTS", impactHint: "ELECTION_LAW", re: /\b(ELECTION|BALLOT|VOTING|VOTE\s+INTEGRITY|PETITION|INITIATIVE|REFEREND|RECOUNT|SIGNATURE)\b/i },
  { topic: "PUBLIC_HEALTH_EMERGENCY", impactHint: "EXECUTIVE_POWER_HEALTH", re: /\b(PUBLIC\s+HEALTH|HEALTH\s+EMERGENCY|PANDEMIC|COVID|ISOLATION|QUARANTINE|EXECUTIVE\s+ORDER)\b/i },
  { topic: "ABORTION_REPRODUCTIVE", impactHint: "CULTURE_WAR", re: /\b(UNBORN|ABORT|FETAL|REPRODUCTIVE)\b/i },
  { topic: "FIREARMS", impactHint: "SECOND_AMENDMENT", re: /\b(FIREARM|GUN|CONCEALED\s+CARRY)\b/i },
  { topic: "TAX_FISCAL", impactHint: "TAX_POLICY", re: /\b(TAX\s+CREDIT|INCOME\s+TAX|SALES\s+TAX|HOMESTEAD|REVENUE)\b/i },
  { topic: "EDUCATION_CURRICULUM", impactHint: "EDUCATION", re: /\b(CURRICULUM|CLASSROOM|CRT|INDOCTRIN|SCHOOL\s+CHOICE)\b/i },
  { topic: "IMMIGRATION", impactHint: "IMMIGRATION", re: /\b(IMMIGR|SANCTUARY|ALIEN)\b/i },
  { topic: "CRIMINAL_JUSTICE", impactHint: "CRIMINAL_LAW", re: /\b(SENTENC|PAROLE|DEATH\s+PENALTY|BAIL)\b/i },
];

function hasFlag(name: string) {
  return process.argv.includes(name);
}

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

const execFileP = promisify(execFile);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** arkleg often serves a shell HTML to non-browser TLS clients; curl matches browser UA reliably on Windows CI. */
async function fetchTextViaCurl(url: string): Promise<string> {
  const { stdout } = await execFileP("curl", ["-sSfL", "-A", UA, url], {
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  });
  return stdout.toString();
}

async function fetchText(url: string): Promise<string> {
  if (process.env.ARKLEG_USE_NODE_FETCH === "1") {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`${LOG} HTTP ${res.status} ${url}`);
    return res.text();
  }
  return fetchTextViaCurl(url);
}

function absolutizeArkleg(href: string): string {
  if (href.startsWith("http")) return href;
  return `${ARKLEG_BASE}${href.startsWith("/") ? "" : "/"}${href}`;
}

/** arkleg expects `member=K.+Hammer` (literal +). `encodeURIComponent` yields %2B which breaks detail resolution. */
function arklegMemberParam(member: string): string {
  return encodeURIComponent(member).replace(/%2B/g, "+");
}

function analyzeControversy(title: string): Controversy {
  const topics: string[] = [];
  let impactHint: string | null = null;
  for (const rule of CONTROVERSY_RULES) {
    if (rule.re.test(title)) {
      topics.push(rule.topic);
      if (rule.impactHint && !impactHint) impactHint = rule.impactHint;
    }
  }
  return {
    controversialHeuristic: topics.length > 0,
    topics,
    impactHint,
  };
}

/** Title-only hints for INTEL-4B-3 shortlist prioritization (not verification). */
const SHORTLIST_TIER1 =
  /\b(ELECTION|BALLOT|VOTING|VOTE\s+INTEGRITY|PETITION|INITIATIVE|REFEREND|RECOUNT|SIGNATURE|INITIATED\s+ACT|REDISTRICT)\b/i;
const SHORTLIST_TIER2 =
  /\b(COUNTY|QUORUM\s+COURT|COUNTY\s+JUDGE|COUNTY\s+CLERK|JUSTICE\s+OF\s+THE\s+PEACE|REGIONAL\s+SOLID\s+WASTE)\b/i;
const SHORTLIST_TIER3 = /\b(CAMPAIGN\s+FINANCE|ETHICS|DISCLOSURE|LOBBY|CONFLICT\s+OF\s+INTEREST)\b/i;

const CANDIDATE_SEED_NOTE =
  "Candidate row generated from arkleg shortlist; requires human verification before live ingest.";

function legislativePriorityTier(title: string, controversy: Controversy): { tier: number; tierLabels: string[] } {
  const tierLabels: string[] = [];
  let tier = 99;
  if (SHORTLIST_TIER1.test(title)) {
    tier = Math.min(tier, 1);
    tierLabels.push("direct_democracy_or_election_admin_title_hint");
  }
  if (SHORTLIST_TIER2.test(title)) {
    tier = Math.min(tier, 2);
    tierLabels.push("county_governance_or_finance_title_hint");
  }
  if (SHORTLIST_TIER3.test(title)) {
    tier = Math.min(tier, 3);
    tierLabels.push("campaign_finance_ethics_disclosure_title_hint");
  }
  if (controversy.controversialHeuristic) {
    tier = Math.min(tier, 5);
    tierLabels.push("title_keyword_heuristic");
  }
  return { tier, tierLabels };
}

function shortlistLocalKey(b: ParsedBill): string {
  const roleSlug = b.roleSection.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 48);
  return `ARKLEG|${b.sessionCode}|${b.billNumber}|${roleSlug}`;
}

function recommendedManifestCategory(
  tier: number,
  officialVideoUrl: string | null
): "billRecord" | "accountabilityItem" | "videoRecord" {
  if (officialVideoUrl) return "videoRecord";
  if (tier === 3) return "accountabilityItem";
  return "billRecord";
}

function impactAreaForShortlist(tier: number, controversy: Controversy): string | null {
  if (controversy.impactHint) return controversy.impactHint;
  if (tier === 1) return "ELECTION_OR_BALLOT_TOPIC";
  if (tier === 2) return "COUNTY_TOPIC";
  if (tier === 3) return "ETHICS_OR_DISCLOSURE_TOPIC";
  if (tier === 5) return "OTHER_HEURISTIC_TOPIC";
  return null;
}

type ReviewShortlistItem = {
  localKey: string;
  billNumber: string;
  title: string;
  session: string;
  role: string;
  policyArea: string;
  impactArea: string | null;
  officialBillUrl: string;
  sourceUrl: string;
  officialVideoUrl: string | null;
  timestampLabel: string | null;
  whyFlagged: string;
  verificationStatus: "NEEDS_HUMAN_VERIFICATION";
  recommendedManifestCategory: "billRecord" | "accountabilityItem" | "videoRecord";
  notes: string;
};

async function buildReviewShortlistItems(
  uniqueBills: ParsedBill[],
  opts: { maxItems: number; probeVideos: boolean }
): Promise<ReviewShortlistItem[]> {
  type Cand = { bill: ParsedBill; tier: number; tierLabels: string[]; controversy: Controversy };
  const candidates: Cand[] = [];
  for (const b of uniqueBills) {
    const controversy = analyzeControversy(b.title);
    const { tier, tierLabels } = legislativePriorityTier(b.title, controversy);
    if (tier === 99) continue;
    candidates.push({ bill: b, tier, tierLabels, controversy });
  }
  candidates.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    const pa = /primary\s+sponsor/i.test(a.bill.roleSection) ? 0 : 1;
    const pb = /primary\s+sponsor/i.test(b.bill.roleSection) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    const sc = b.bill.sessionCode.localeCompare(a.bill.sessionCode);
    if (sc !== 0) return sc;
    return a.bill.billNumber.localeCompare(b.bill.billNumber);
  });
  const picked = candidates.slice(0, opts.maxItems);
  const out: ReviewShortlistItem[] = [];
  for (const c of picked) {
    const b = c.bill;
    let officialVideoUrl: string | null = null;
    let timestampLabel: string | null = null;
    if (opts.probeVideos) {
      try {
        const dhtml = await fetchText(b.detailHref);
        const meetings = parseBillMeetings(dhtml);
        const pickedM = pickCommitteePresentationMeeting(meetings);
        officialVideoUrl = pickedM?.videoUrl ?? null;
        timestampLabel = pickedM?.mediaStartTime ?? null;
        await sleep(450);
      } catch (e) {
        console.warn(`${LOG} shortlist video probe failed ${b.billNumber}`, e);
      }
    }
    const cat = recommendedManifestCategory(c.tier, officialVideoUrl);
    const topics = c.controversy.topics.length ? c.controversy.topics.join(", ") : "none";
    const whyFlagged = `Priority signals: ${c.tierLabels.join("; ")}. Keyword topics from title rules: ${topics}.`;
    const policyArea = c.controversy.topics[0] ?? "UNCLASSIFIED_TITLE_KEYWORDS";
    out.push({
      localKey: shortlistLocalKey(b),
      billNumber: b.billNumber,
      title: b.title,
      session: b.sessionCode,
      role: b.roleSection,
      policyArea,
      impactArea: impactAreaForShortlist(c.tier, c.controversy),
      officialBillUrl: b.detailHref,
      sourceUrl: b.detailHref,
      officialVideoUrl,
      timestampLabel,
      whyFlagged,
      verificationStatus: "NEEDS_HUMAN_VERIFICATION",
      recommendedManifestCategory: cat,
      notes:
        "Arkleg legislator bill-grid row only; do not treat title or role as verified until the official bill page is reviewed. " +
        CANDIDATE_SEED_NOTE,
    });
  }
  return out;
}

function writeOpponentLegislativeCandidatesJson(
  items: ReviewShortlistItem[],
  memberKey: string,
  entityName: string,
  outPath: string
) {
  const entityLocalKey = "intel_seed_arkleg_legislator";
  const bundle: Record<string, unknown> = {
    entities: [
      {
        localKey: entityLocalKey,
        name: entityName,
        type: OppositionEntityType.OFFICEHOLDER,
        currentOffice: "Arkansas State Senator (District 16)",
        party: "Republican",
        reviewStatus: OppositionReviewStatus.DRAFT,
        metadataJson: {
          arklegMember: memberKey,
          INTEL_4B_3: "candidate_bridge_entity",
          curatorNote: CANDIDATE_SEED_NOTE,
        },
      },
    ],
    sources: [
      {
        localKey: "src_arkleg_portal_candidate",
        title: "Arkansas State Legislature (official portal)",
        sourceType: OppositionSourceType.LEGISLATIVE_RECORD,
        sourceUrl: `${ARKLEG_BASE}/`,
        publisher: "Arkansas Bureau of Legislative Research",
        accessedAt: new Date().toISOString(),
        confidence: OppositionConfidence.UNVERIFIED,
        reviewStatus: OppositionReviewStatus.DRAFT,
        notes: CANDIDATE_SEED_NOTE,
        metadataJson: { INTEL_4B_3: "portal_bookmark" },
      },
    ],
    billRecords: [] as Record<string, unknown>[],
    voteRecords: [],
    financeRecords: [],
    messageRecords: [],
    videoRecords: [] as Record<string, unknown>[],
    newsMentions: [],
    electionPatterns: [],
    accountabilityItems: [] as Record<string, unknown>[],
  };

  const bills = bundle.billRecords as Record<string, unknown>[];
  const videos = bundle.videoRecords as Record<string, unknown>[];
  const acct = bundle.accountabilityItems as Record<string, unknown>[];

  for (const it of items) {
    bills.push({
      entityLocalKey: entityLocalKey,
      sourceLocalKey: "src_arkleg_portal_candidate",
      sourceUrl: it.officialBillUrl,
      billNumber: it.billNumber,
      title: it.title,
      role: it.role,
      policyArea: it.policyArea,
      impactArea: it.impactArea,
      session: it.session,
      confidence: OppositionConfidence.UNVERIFIED,
      reviewStatus: OppositionReviewStatus.DRAFT,
      notes: CANDIDATE_SEED_NOTE,
      metadataJson: {
        shortlistLocalKey: it.localKey,
        verificationStatus: it.verificationStatus,
        recommendedManifestCategory: it.recommendedManifestCategory,
        ingestPipeline: "INTEL-4B-3-candidate-bridge",
      },
    });
    if (it.recommendedManifestCategory === "accountabilityItem") {
      acct.push({
        entityLocalKey: entityLocalKey,
        sourceLocalKey: "src_arkleg_portal_candidate",
        sourceUrl: it.officialBillUrl,
        title: it.title,
        category: it.policyArea,
        description: it.title,
        impact: it.impactArea,
        billNumber: it.billNumber,
        confidence: OppositionConfidence.UNVERIFIED,
        reviewStatus: OppositionReviewStatus.DRAFT,
        notes: CANDIDATE_SEED_NOTE,
        metadataJson: { shortlistLocalKey: it.localKey },
      });
    }
    if (it.officialVideoUrl) {
      videos.push({
        entityLocalKey: entityLocalKey,
        sourceLocalKey: "src_arkleg_portal_candidate",
        sourceUrl: it.officialVideoUrl,
        eventType: "committee_or_floor_archive",
        topic: it.title,
        billNumber: it.billNumber,
        timestampLabel: it.timestampLabel,
        transcriptStatus: "NOT_STARTED",
        confidence: OppositionConfidence.UNVERIFIED,
        reviewStatus: OppositionReviewStatus.DRAFT,
        notes: CANDIDATE_SEED_NOTE,
        metadataJson: { shortlistLocalKey: it.localKey, billDetailUrl: it.officialBillUrl },
      });
    }
  }

  writeFileSync(outPath, JSON.stringify(bundle, null, 2), "utf8");
}

function parseSessionOptions(html: string): { code: string; label: string }[] {
  const $ = cheerio.load(html);
  const out: { code: string; label: string }[] = [];
  $("select#ddBienniumSession option").each((_, el) => {
    const code = $(el).attr("value")?.trim() ?? "";
    if (!code) return;
    const label = $(el).text().trim();
    out.push({ code, label });
  });
  return out;
}

function sessionStartYear(code: string): number {
  const m = /^(\d{4})\//.exec(code);
  return m ? parseInt(m[1], 10) : 0;
}

function parseLegislatorBillGrid(html: string, sessionCode: string): ParsedBill[] {
  const $ = cheerio.load(html);
  const wrap = $("#tableDataWrapper[role='grid']").first();
  if (!wrap.length) return [];

  const bills: ParsedBill[] = [];
  let currentRole = "UNKNOWN";

  wrap.children(".row").each((_, row) => {
    const $row = $(row);
    if ($row.hasClass("tableSectionHeader") || $row.hasClass("tableSectionHeaderMobile")) {
      const t = $row.text().replace(/\s+/g, " ").trim();
      if (t) currentRole = t;
      return;
    }
    if (!$row.hasClass("tableRow") && !$row.hasClass("tableRowAlt")) return;

    const billCell = $row.find('[aria-colindex="1"]').first();
    const titleCell = $row.find('[aria-colindex="2"]').first();
    const billLink = billCell.find('a[href*="/Bills/Detail"]').filter((_, a) => {
      const label = $(a).attr("aria-label") ?? "";
      return label.includes("Bill Number") && !label.includes("History");
    }).first();
    if (!billLink.length) return;

    const href = billLink.attr("href") ?? "";
    const billNumber = billLink.text().trim();
    const title = titleCell.text().replace(/\s+/g, " ").trim();
    if (!billNumber || !href) return;

    bills.push({
      billNumber,
      title,
      detailHref: absolutizeArkleg(href),
      roleSection: currentRole,
      sessionCode,
    });
  });

  return bills;
}

function parseBillMeetings(html: string): MeetingRow[] {
  const $ = cheerio.load(html);
  const meetings: MeetingRow[] = [];
  const h3 = $("h3")
    .filter((_, el) => $(el).text().trim() === "Meetings")
    .first();
  if (!h3.length) return meetings;

  const scope = h3.parent();
  scope.find(".row.tableRow, .row.tableRowAlt").each((_, row) => {
    const $r = $(row);
    const dateRaw = $r.find('[aria-colindex="1"]').first().text().replace(/\s+/g, " ").trim();
    const meetingHtml = $r.find('[aria-colindex="2"]').first().html() ?? "";
    const meetingLabel = cheerio.load(`<wrap>${meetingHtml}</wrap>`)("wrap").text().replace(/\s+/g, " ").trim();
    const vid = $r.find('a[href*="sliq.net"]').first();
    const videoUrl = vid.attr("href") ?? null;
    let mediaStartTime: string | null = null;
    if (videoUrl) {
      try {
        const u = new URL(videoUrl);
        mediaStartTime = u.searchParams.get("mediaStartTime");
      } catch {
        mediaStartTime = null;
      }
    }
    if (dateRaw && meetingLabel) {
      meetings.push({ dateRaw, meetingLabel, videoUrl, mediaStartTime });
    }
  });

  return meetings;
}

function pickCommitteePresentationMeeting(meetings: MeetingRow[]): MeetingRow | null {
  const withVideo = meetings.filter((m) => m.videoUrl);
  if (!withVideo.length) return null;

  const committeeFirst = withVideo.find((m) => {
    const L = m.meetingLabel.toLowerCase();
    if (/\bconvenes\b/.test(L) && !/committee/.test(L)) return false;
    return /committee|public health|efficiency|state agencies|city county|judiciary|education|revenue/i.test(m.meetingLabel);
  });
  return committeeFirst ?? withVideo[0] ?? null;
}

function parseSenateBioParagraphs(html: string): { text: string; pdfUrl: string | null } {
  const $ = cheerio.load(html);
  const body = $(".accordion-body").first();
  const pdfHref = body.find('a[href$=".pdf"]').first().attr("href") ?? null;
  const parts: string[] = [];
  body.find("p").each((_, p) => {
    const t = $(p).text().replace(/\s+/g, " ").trim();
    if (t) parts.push(t);
  });
  return { text: parts.join("\n\n"), pdfUrl: pdfHref };
}

function metaBase(extra?: Record<string, unknown>): Prisma.InputJsonValue {
  return {
    ingestPipeline: PIPELINE,
    fetchedAt: new Date().toISOString(),
    ...extra,
  } as Prisma.InputJsonValue;
}

async function findEntityByArklegMember(member: string, db: Db) {
  const rows = await db.oppositionEntity.findMany({
    where: {
      metadataJson: {
        path: ["arklegMember"],
        equals: decodeURIComponent(member.replace(/\+/g, " ")),
      },
    },
    take: 1,
  });
  if (rows[0]) return rows[0];
  const rows2 = await db.oppositionEntity.findMany({
    where: {
      metadataJson: {
        path: ["arklegMember"],
        equals: member,
      },
    },
    take: 1,
  });
  return rows2[0] ?? null;
}

async function deletePipelineRows(entityId: string, db: Db) {
  const tag = { path: ["ingestPipeline"], equals: PIPELINE } as const;
  await db.oppositionBillRecord.deleteMany({ where: { entityId, metadataJson: tag } });
  await db.oppositionVideoRecord.deleteMany({ where: { entityId, metadataJson: tag } });
  await db.oppositionMessageRecord.deleteMany({ where: { entityId, metadataJson: tag } });
  await db.oppositionSource.deleteMany({ where: { metadataJson: tag } });
}

async function main() {
  loadEnvConfig(REPO);
  const dryRun = hasFlag("--dry-run");
  const replace = hasFlag("--replace");
  const member = argValue("--member") ?? "K.+Hammer";
  const entityIdArg = argValue("--entity-id");
  const senateProfile = argValue("--senate-profile") ?? "https://senate.arkansas.gov/senators/576/";
  const deepBills = (argValue("--deep-bills") ?? "primary") as "none" | "primary" | "all";
  const minYear = parseInt(argValue("--min-session-year") ?? "2019", 10);
  const writeSummary = hasFlag("--write-summary");
  const writeShortlist = hasFlag("--write-shortlist") || writeSummary;
  const shortlistProbeVideos = hasFlag("--shortlist-probe-videos");
  const entityName = argValue("--entity-name") ?? "Kim Hammer";

  if (!["none", "primary", "all"].includes(deepBills)) {
    console.error(`${LOG} --deep-bills must be none|primary|all`);
    process.exit(1);
  }

  const legislatorUrl = `${ARKLEG_BASE}/Legislators/Detail?member=${arklegMemberParam(member)}&ddBienniumSession=2025%2F2026F`;
  console.log(`${LOG} bootstrap ${legislatorUrl}`);
  const bootHtml = await fetchText(legislatorUrl);
  await sleep(400);

  if (bootHtml.includes("<h1>Legislators List</h1>")) {
    console.error(`${LOG} arkleg returned legislators list — member query or session may be invalid`);
    process.exit(1);
  }

  const sessionOpts = parseSessionOptions(bootHtml).filter((s) => sessionStartYear(s.code) >= minYear);
  if (!sessionOpts.length) {
    console.error(`${LOG} no sessions >= ${minYear} in dropdown`);
    process.exit(1);
  }

  const allBills: ParsedBill[] = [];
  for (const { code, label } of sessionOpts) {
    const url = `${ARKLEG_BASE}/Legislators/Detail?member=${arklegMemberParam(member)}&ddBienniumSession=${encodeURIComponent(code)}`;
    console.log(`${LOG} session ${label} (${code})`);
    const html = await fetchText(url);
    const bills = parseLegislatorBillGrid(html, code);
    console.log(`${LOG}   bills: ${bills.length}`);
    allBills.push(...bills);
    await sleep(400);
  }

  const dedupe = new Map<string, ParsedBill>();
  for (const b of allBills) {
    const k = `${b.sessionCode}|${b.billNumber}|${b.roleSection}`;
    dedupe.set(k, b);
  }
  const uniqueBills = [...dedupe.values()];
  console.log(`${LOG} total unique bill rows: ${uniqueBills.length}`);

  const controversial: {
    billNumber: string;
    session: string;
    role: string;
    title: string;
    topics: string[];
    impactHint: string | null;
  }[] = [];

  for (const b of uniqueBills) {
    const c = analyzeControversy(b.title);
    if (c.controversialHeuristic) {
      controversial.push({
        billNumber: b.billNumber,
        session: b.sessionCode,
        role: b.roleSection,
        title: b.title,
        topics: c.topics,
        impactHint: c.impactHint,
      });
    }
  }
  controversial.sort((a, b) => a.session.localeCompare(b.session) || a.billNumber.localeCompare(b.billNumber));

  console.log(`${LOG} controversial (heuristic): ${controversial.length}`);
  for (const row of controversial.slice(0, 40)) {
    console.log(`  ${row.session} ${row.billNumber} [${row.role}] → ${row.topics.join(", ")}`);
  }
  if (controversial.length > 40) console.log(`  … ${controversial.length - 40} more`);

  let senateBio: { text: string; pdfUrl: string | null } = { text: "", pdfUrl: null };
  try {
    const senHtml = await fetchText(senateProfile);
    senateBio = parseSenateBioParagraphs(senHtml);
    console.log(`${LOG} senate bio chars: ${senateBio.text.length}`);
    await sleep(400);
  } catch (e) {
    console.warn(`${LOG} senate profile fetch failed`, e);
  }

  type VideoPlan = {
    bill: ParsedBill;
    meeting: MeetingRow;
    billDetailUrl: string;
  };
  const videoPlans: VideoPlan[] = [];

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, bills: uniqueBills.length, controversial, videoPlans: "skipped in dry-run" }, null, 2));
    const genDir = path.join(REPO, "data/intelligence/generated");
    if (writeSummary) {
      mkdirSync(genDir, { recursive: true });
      const f = path.join(genDir, "arkleg-hammer-ingest-summary.dryrun.json");
      writeFileSync(
        f,
        JSON.stringify(
          {
            controversial,
            billsSample: uniqueBills.slice(0, 5),
            totalUniqueBillRows: uniqueBills.length,
          },
          null,
          2
        ),
        "utf8"
      );
      console.log(`${LOG} wrote ${f}`);
      const allPath = path.join(genDir, "arkleg-hammer-all-bills.dryrun.json");
      writeFileSync(
        allPath,
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            member,
            entityName,
            pipeline: PIPELINE,
            totalUniqueBillRows: uniqueBills.length,
            bills: uniqueBills.map((b) => ({
              billNumber: b.billNumber,
              title: b.title,
              session: b.sessionCode,
              role: b.roleSection,
              officialBillUrl: b.detailHref,
            })),
          },
          null,
          2
        ),
        "utf8"
      );
      console.log(`${LOG} wrote ${allPath} (${uniqueBills.length} rows)`);
    }
    if (writeShortlist) {
      mkdirSync(genDir, { recursive: true });
      const items = await buildReviewShortlistItems(uniqueBills, { maxItems: 25, probeVideos: shortlistProbeVideos });
      const shortlistPath = path.join(genDir, "arkleg-review-shortlist.json");
      writeFileSync(
        shortlistPath,
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            member,
            entityName,
            pipeline: PIPELINE,
            maxItems: 25,
            probeVideos: shortlistProbeVideos,
            items,
          },
          null,
          2
        ),
        "utf8"
      );
      console.log(`${LOG} wrote ${shortlistPath} (${items.length} items)`);
      const candPath = path.join(REPO, "data/intelligence/opponent-legislative-candidates.json");
      writeOpponentLegislativeCandidatesJson(items, member, entityName, candPath);
      console.log(`${LOG} wrote ${candPath}`);
    }
    return;
  }

  const primaryBills = uniqueBills.filter((b) => /primary\s+sponsor/i.test(b.roleSection));
  const deepTargets =
    deepBills === "none" ? [] : deepBills === "primary" ? primaryBills : uniqueBills;

  if (deepBills !== "none") {
    console.log(`${LOG} deep bill detail (${deepBills}): ${deepTargets.length} pages`);
    for (const b of deepTargets) {
      try {
        const dhtml = await fetchText(b.detailHref);
        const meetings = parseBillMeetings(dhtml);
        const picked = pickCommitteePresentationMeeting(meetings);
        if (picked?.videoUrl) {
          videoPlans.push({ bill: b, meeting: picked, billDetailUrl: b.detailHref });
        }
        await sleep(450);
      } catch (e) {
        console.warn(`${LOG} bill detail fail ${b.billNumber}`, e);
      }
    }
    console.log(`${LOG} video clips resolved: ${videoPlans.length}`);
  }

  const run = async (db: Db) => {
    let entityId = entityIdArg?.trim() ?? null;
    if (!entityId) {
      const found = await findEntityByArklegMember(member, db);
      if (found) entityId = found.id;
    }
    if (!entityId) {
      const created = await createOppositionEntity(
        {
          name: "Kim Hammer",
          type: OppositionEntityType.OFFICEHOLDER,
          currentOffice: "Arkansas State Senator (District 16)",
          party: "Republican",
          geography: "Saline / Pulaski (partial)",
          metadataJson: metaBase({
            arklegMember: member.replace(/\+/g, " "),
            senateProfileUrl: senateProfile,
          }),
        },
        db
      );
      entityId = created.id;
      console.log(`${LOG} created entity ${entityId}`);
    } else {
      const existing = await db.oppositionEntity.findUnique({ where: { id: entityId } });
      const prev =
        existing?.metadataJson && typeof existing.metadataJson === "object" && !Array.isArray(existing.metadataJson)
          ? (existing.metadataJson as Record<string, unknown>)
          : {};
      const merged = {
        ...prev,
        ...(metaBase({
          arklegMember: member.replace(/\+/g, " "),
          senateProfileUrl: senateProfile,
        }) as Record<string, unknown>),
      };
      await db.oppositionEntity.update({
        where: { id: entityId },
        data: { metadataJson: merged as Prisma.InputJsonValue },
      });
    }

    if (!entityId) throw new Error("entity_missing");

    if (replace) {
      console.log(`${LOG} replace: deleting prior ${PIPELINE} rows`);
      await deletePipelineRows(entityId, db);
    }

    await createOppositionSource(
      {
        title: `Arkansas Legislature — member profile (${member})`,
        sourceType: OppositionSourceType.LEGISLATIVE_RECORD,
        sourceUrl: legislatorUrl,
        publisher: "Arkansas Bureau of Legislative Research",
        accessedAt: new Date(),
        confidence: OppositionConfidence.VERIFIED,
        reviewStatus: OppositionReviewStatus.NEEDS_REVIEW,
        notes: "Seed URL for session list; per-bill sources stored separately.",
        metadataJson: metaBase({ kind: "arkleg_member_profile" }),
      },
      db
    );

    if (senateBio.text) {
      const senateSrc = await createOppositionSource(
        {
          title: "Arkansas Senate — official biography page",
          sourceType: OppositionSourceType.WEBSITE,
          sourceUrl: senateProfile,
          publisher: "Arkansas Senate",
          accessedAt: new Date(),
          confidence: OppositionConfidence.VERIFIED,
          reviewStatus: OppositionReviewStatus.NEEDS_REVIEW,
          metadataJson: metaBase({ kind: "senate_bio_html" }),
        },
        db
      );
      if (senateBio.pdfUrl) {
        await createOppositionSource(
          {
            title: "Arkansas Senate — biography PDF",
            sourceType: OppositionSourceType.USER_PROVIDED_DOCUMENT,
            sourceUrl: senateBio.pdfUrl.startsWith("http") ? senateBio.pdfUrl : new URL(senateBio.pdfUrl, senateProfile).href,
            publisher: "Arkansas Senate",
            accessedAt: new Date(),
            confidence: OppositionConfidence.VERIFIED,
            reviewStatus: OppositionReviewStatus.NEEDS_REVIEW,
            metadataJson: metaBase({ kind: "senate_bio_pdf" }),
          },
          db
        );
      }
      await createOppositionMessageRecord(
        {
          entityId,
          sourceId: senateSrc.id,
          messageType: "OFFICIAL_BIO_HTML",
          topic: "Biography",
          summary: senateBio.text.slice(0, 12000),
          confidence: OppositionConfidence.VERIFIED,
          reviewStatus: OppositionReviewStatus.NEEDS_REVIEW,
          metadataJson: metaBase({ kind: "senate_bio_text" }),
        },
        db
      );
      await createOppositionSource(
        {
          title: "Arkansas Senate — official YouTube channel",
          sourceType: OppositionSourceType.SOCIAL_MEDIA,
          sourceUrl: "https://www.youtube.com/user/arkansassenate",
          publisher: "Arkansas Senate",
          accessedAt: new Date(),
          confidence: OppositionConfidence.VERIFIED,
          reviewStatus: OppositionReviewStatus.NEEDS_REVIEW,
          notes: "Search manually for member name + bill keywords; not auto-scraped.",
          metadataJson: metaBase({ kind: "senate_youtube_channel" }),
        },
        db
      );
    }

    for (const b of uniqueBills) {
      const c = analyzeControversy(b.title);
      const billSource = await createOppositionSource(
        {
          title: `${b.billNumber} — ${b.sessionCode} (${b.roleSection})`,
          sourceType: OppositionSourceType.LEGISLATIVE_RECORD,
          sourceUrl: b.detailHref,
          publisher: "Arkansas Bureau of Legislative Research",
          accessedAt: new Date(),
          confidence: OppositionConfidence.VERIFIED,
          reviewStatus: OppositionReviewStatus.NEEDS_REVIEW,
          metadataJson: metaBase({ billNumber: b.billNumber, session: b.sessionCode, role: b.roleSection }),
        },
        db
      );

      await createOppositionBillRecord(
        {
          entityId,
          sourceId: billSource.id,
          billNumber: b.billNumber,
          title: b.title,
          role: b.roleSection,
          session: b.sessionCode,
          policyArea: c.topics.length ? c.topics.join("; ") : null,
          impactArea: c.impactHint,
          confidence: OppositionConfidence.VERIFIED,
          reviewStatus: OppositionReviewStatus.NEEDS_REVIEW,
          notes: c.controversialHeuristic
            ? `Heuristic tags: ${c.topics.join(", ")} — not a legal conclusion; analyst review.`
            : null,
          metadataJson: metaBase({
            ingestKey: `${b.sessionCode}|${b.billNumber}|${b.roleSection}`,
            controversialHeuristic: c.controversialHeuristic,
            controversyTopics: c.topics,
          }),
        },
        db
      );
    }

    for (const vp of videoPlans) {
      const vSrc = await createOppositionSource(
        {
          title: `Video — ${vp.bill.billNumber} ${vp.meeting.meetingLabel.slice(0, 80)}`,
          sourceType: OppositionSourceType.VIDEO,
          sourceUrl: vp.meeting.videoUrl!,
          publisher: "Arkansas Legislature (Sliq Harmony)",
          accessedAt: new Date(),
          confidence: OppositionConfidence.VERIFIED,
          reviewStatus: OppositionReviewStatus.NEEDS_REVIEW,
          metadataJson: metaBase({
            billNumber: vp.bill.billNumber,
            session: vp.bill.sessionCode,
            mediaStartTime: vp.meeting.mediaStartTime,
          }),
        },
        db
      );

      await createOppositionVideoRecord(
        {
          entityId,
          sourceId: vSrc.id,
          billNumber: vp.bill.billNumber,
          eventType: "COMMITTEE_OR_FLOOR",
          topic: vp.meeting.meetingLabel.slice(0, 500),
          transcriptStatus: "NOT_STARTED",
          timestampLabel: vp.meeting.mediaStartTime,
          confidence: OppositionConfidence.VERIFIED,
          reviewStatus: OppositionReviewStatus.NEEDS_REVIEW,
          notes: `Meeting date (site): ${vp.meeting.dateRaw}. Picked first substantive committee/floor link with video; verify speaker in player.`,
          metadataJson: metaBase({
            billDetailUrl: vp.billDetailUrl,
            meetingDateRaw: vp.meeting.dateRaw,
            selectionHeuristic: "first_committee_preference_else_first_video",
          }),
        },
        db
      );
    }
  };

  await prisma.$transaction((tx) => run(tx as unknown as PrismaClient));
  console.log(`${LOG} committed.`);

  if (writeSummary) {
    const dir = path.join(REPO, "data/intelligence/generated");
    mkdirSync(dir, { recursive: true });
    const f = path.join(dir, "arkleg-hammer-ingest-summary.json");
    writeFileSync(
      f,
      JSON.stringify(
        {
          pipeline: PIPELINE,
          controversial,
          videoCount: videoPlans.length,
          billCount: uniqueBills.length,
        },
        null,
        2
      ),
      "utf8"
    );
    console.log(`${LOG} wrote ${f}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
