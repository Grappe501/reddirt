/**
 * Load and merge upcoming event sources for Phase 13 Forward Motion.
 */

import path from "node:path";

import { OPPORTUNITY_CLUSTERS } from "../../strategic-plan/data/opportunity-clusters";
import { classifyEventVerification } from "./event-verification";
import { BRAIN_DATA, BRAIN_ROOT, readJson, type OpportunityCounty } from "./inputs";
import type { UpcomingStopActivation } from "./forward-motion-types";

const PLAN_ROOT = path.join(process.cwd(), "docs/strategic-plan/plurality-victory-plan");
const FESTIVAL_LEADS = path.join(process.cwd(), "data/calendar-command-center/festival-leads.verified.json");
const IMPACT_SCORES = path.join(BRAIN_ROOT, "decision-intelligence/campaign-impact-scores.json");

export type RawEventCandidate = {
  eventId: string;
  eventName: string;
  county: string;
  city: string;
  date: string;
  type?: string;
  reconcileStatus?: string;
  mobilizeUrl?: string;
  source: string;
};

type ImpactRow = {
  eventId: string;
  title: string;
  county: string;
  type: string;
  date: string | null;
  campaignImpactScore: number;
  verificationConfidence: number;
  effectiveScore: number;
  assignment: string;
  verification: string;
  routeCluster?: string;
};

function normalizeCounty(name: string): string {
  return name.replace(/ County$/i, "").trim();
}

function countyDisplay(county: string): string {
  const n = normalizeCounty(county);
  return n.endsWith("County") ? n : `${n} County`;
}

function clusterForCounty(county: string): string {
  const n = normalizeCounty(county);
  for (const c of OPPORTUNITY_CLUSTERS) {
    if (c.counties.some((x) => normalizeCounty(x) === n)) return c.name;
  }
  return "Statewide";
}

function loadOpportunityMap(): Map<string, OpportunityCounty> {
  const data = readJson<{ counties: OpportunityCounty[] }>(
    path.join(PLAN_ROOT, "part-ii-electoral-math/opportunity-scorecard/statewide-opportunity-scorecard.json"),
  );
  const m = new Map<string, OpportunityCounty>();
  for (const c of data?.counties ?? []) {
    m.set(normalizeCounty(c.county), c);
  }
  return m;
}

function laneLabel(tier: string): string {
  if (tier === "A") return "Lane 2 recovery + registration";
  if (tier === "B") return "Relationship + persuasion";
  if (tier === "C") return "Coverage + volunteer build";
  return "Maintenance + presence";
}

function fallbackScore(county: string, oppMap: Map<string, OpportunityCounty>): {
  campaignImpactScore: number;
  effectiveScore: number;
  confidence: number;
  countyTier: string;
  primaryLane: string;
} {
  const opp = oppMap.get(normalizeCounty(county));
  const tier = opp?.tier ?? "D";
  const tierBase: Record<string, number> = { A: 65, B: 50, C: 38, D: 28 };
  const base = tierBase[tier] ?? 25;
  return {
    campaignImpactScore: base,
    effectiveScore: Math.round(base * 0.75),
    confidence: 0.75,
    countyTier: tier,
    primaryLane: laneLabel(tier),
  };
}

function mapVerification(
  eventId: string,
  date: string | null,
  reconcileStatus?: string,
  override?: string,
): { verificationStatus: "verified" | "tentative" | "missing"; confidence: number } {
  const rec = classifyEventVerification({
    eventId,
    confirmedDate: date,
    reconcileStatus,
    overrideStatus: override as "verified" | "tentative" | undefined,
  });
  if (rec.status === "missing" || !date) return { verificationStatus: "missing", confidence: rec.confidence };
  if (rec.status === "verified") return { verificationStatus: "verified", confidence: rec.confidence };
  return { verificationStatus: "tentative", confidence: rec.confidence };
}

function parseDate(s: string | null | undefined): string | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return null;
  return s.slice(0, 10);
}

function daysFromToday(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86_400_000);
}

function mobilizeStatusFromUrl(url?: string, inMobilize?: boolean): UpcomingStopActivation["mobilizeStatus"] {
  if (url?.trim()) return "drafted";
  if (inMobilize) return "draft_needed";
  return "not_started";
}

function readinessPct(stop: Omit<UpcomingStopActivation, "activationReadinessPct" | "nextAction">): number {
  const channels = [
    stop.mobilizeStatus,
    stop.facebookStatus,
    stop.newsReleaseStatus,
    stop.graphicsStatus,
    stop.phoneBankStatus,
    stop.postcardStatus,
    stop.storyWorkflowStatus,
  ];
  const done = channels.filter((s) =>
    ["drafted", "approved", "published", "sent", "requested", "script_ready", "scheduled", "capture_plan_ready"].includes(
      s,
    ),
  ).length;
  return Math.round((done / channels.length) * 1000) / 10;
}

function nextActionFor(stop: UpcomingStopActivation): string {
  if (stop.verificationStatus === "missing") return "Confirm event date before any public activation";
  if (stop.mobilizeStatus === "not_started" || stop.mobilizeStatus === "draft_needed")
    return "Draft Mobilize event — human approval required before publish";
  if (stop.facebookStatus === "not_started" || stop.facebookStatus === "draft_needed")
    return "Draft Facebook event copy — no API posting";
  if (stop.newsReleaseStatus === "not_started" || stop.newsReleaseStatus === "draft_needed")
    return "Generate news release draft for local media review";
  if (stop.graphicsStatus === "not_started" || stop.graphicsStatus === "needed")
    return "Submit social graphics request to designer";
  if (stop.storyWorkflowStatus === "not_started") return "Complete story capture brief";
  return "Review activation package — approve pieces for release";
}

export function loadEventCandidates(): RawEventCandidate[] {
  const out = new Map<string, RawEventCandidate>();

  const impact = readJson<{ all?: ImpactRow[]; top25?: ImpactRow[] }>(IMPACT_SCORES);
  const allScores = impact?.all ?? impact?.top25 ?? [];
  for (const row of allScores) {
    const date = parseDate(row.date);
    if (!date) continue;
    out.set(row.eventId, {
      eventId: row.eventId,
      eventName: row.title,
      county: row.county,
      city: "",
      date,
      type: row.type,
      source: "campaign-impact-scores",
    });
  }

  const festQueue = readJson<{ events: Array<Record<string, string>> }>(
    path.join(BRAIN_DATA, "festival-activation-queue.json"),
  );
  for (const e of festQueue?.events ?? []) {
    const date = parseDate(e.date);
    if (!date) continue;
    out.set(e.id, {
      eventId: e.id,
      eventName: e.eventName ?? e.id,
      county: e.county ?? "",
      city: e.city ?? "",
      date,
      reconcileStatus: e.reconcileStatus,
      mobilizeUrl: e.mobilizeUrl,
      source: "festival-activation-queue",
    });
  }

  const festLeads = readJson<Array<Record<string, string>>>(FESTIVAL_LEADS) ?? [];
  for (const e of festLeads) {
    const date = parseDate(e.date);
    if (!date) continue;
    const existing = out.get(e.id);
    out.set(e.id, {
      eventId: e.id,
      eventName: e.eventName ?? existing?.eventName ?? e.id,
      county: e.county ?? existing?.county ?? "",
      city: e.city ?? existing?.city ?? "",
      date,
      reconcileStatus: e.reconcileStatus ?? existing?.reconcileStatus,
      mobilizeUrl: existing?.mobilizeUrl,
      source: existing?.source ?? "festival-leads",
    });
  }

  const visitLog = readJson<{ visits: Array<{ eventId?: string; county: string; date: string; assignee?: string }> }>(
    path.join(BRAIN_DATA, "county-visit-log.json"),
  );
  for (const v of visitLog?.visits ?? []) {
    if (!v.eventId) continue;
    const date = parseDate(v.date);
    if (!date) continue;
    const existing = out.get(v.eventId);
    if (existing) {
      existing.date = date;
    } else {
      out.set(v.eventId, {
        eventId: v.eventId,
        eventName: v.eventId,
        county: v.county,
        city: "",
        date,
        source: "county-visit-log",
      });
    }
  }

  return [...out.values()];
}

export function buildActivationQueue(options: {
  horizonDays?: number;
  priorityWindowDays?: number;
}): UpcomingStopActivation[] {
  const horizonDays = options.horizonDays ?? 90;
  const priorityWindowDays = options.priorityWindowDays ?? 21;
  const oppMap = loadOpportunityMap();
  const overrides = readJson<{ overrides: Record<string, { status?: string }> }>(
    path.join(BRAIN_DATA, "event-verification-overrides.json"),
  )?.overrides ?? {};

  const impactById = new Map<string, ImpactRow>();
  const impact = readJson<{ all?: ImpactRow[] }>(IMPACT_SCORES);
  for (const row of impact?.all ?? []) impactById.set(row.eventId, row);

  const mobilizeIds = new Set(
    (readJson<{ events: Array<{ eventId: string }> }>(path.join(BRAIN_DATA, "mobilize-events.json"))?.events ?? []).map(
      (e) => e.eventId,
    ),
  );

  const visitAssign = new Map<string, string>();
  const visitLog = readJson<{ visits: Array<{ eventId?: string; assignee?: string }> }>(
    path.join(BRAIN_DATA, "county-visit-log.json"),
  );
  for (const v of visitLog?.visits ?? []) {
    if (v.eventId && v.assignee) visitAssign.set(v.eventId, v.assignee);
  }

  const candidates = loadEventCandidates().filter((c) => {
    const d = daysFromToday(c.date);
    return d >= 0 && d <= horizonDays && c.county;
  });

  const stops: UpcomingStopActivation[] = candidates.map((c) => {
    const impactRow = impactById.get(c.eventId);
    const fb = impactRow ? fallbackScore(c.county, oppMap) : fallbackScore(c.county, oppMap);
    const ver = mapVerification(
      c.eventId,
      c.date,
      c.reconcileStatus,
      overrides[c.eventId]?.status,
    );

    const campaignImpactScore = impactRow?.campaignImpactScore ?? fb.campaignImpactScore;
    const confidence = impactRow?.verificationConfidence ?? ver.confidence;
    const effectiveScore = impactRow?.effectiveScore ?? Math.round(campaignImpactScore * confidence);

    let assignment: UpcomingStopActivation["assignment"] = "County Team";
    const assignRaw = visitAssign.get(c.eventId) ?? impactRow?.assignment ?? "";
    if (/kelly/i.test(assignRaw)) assignment = "Kelly";
    else if (/surrogate/i.test(assignRaw)) assignment = "Surrogate";
    else if (effectiveScore >= 60) assignment = "Kelly";

    const opp = oppMap.get(normalizeCounty(c.county));
    const countyTier = opp?.tier ?? fb.countyTier;

    const base: Omit<UpcomingStopActivation, "activationReadinessPct" | "nextAction"> = {
      eventId: c.eventId,
      eventName: c.eventName,
      county: countyDisplay(c.county),
      city: c.city || "TBD",
      date: c.date,
      verificationStatus: ver.verificationStatus,
      confidence,
      campaignImpactScore,
      effectiveScore,
      assignment,
      cluster: clusterForCounty(c.county),
      countyTier,
      primaryLane: laneLabel(countyTier),
      mobilizeStatus: mobilizeStatusFromUrl(c.mobilizeUrl, mobilizeIds.has(c.eventId)),
      facebookStatus: "not_started",
      newsReleaseStatus:
        ver.verificationStatus === "verified" && effectiveScore >= 45 ? "draft_needed" : "not_started",
      graphicsStatus: daysFromToday(c.date) <= priorityWindowDays ? "needed" : "not_started",
      phoneBankStatus: daysFromToday(c.date) <= priorityWindowDays ? "list_needed" : "not_started",
      postcardStatus: "not_started",
      canvassStatus: "future",
      doorHangerStatus: "future",
      storyWorkflowStatus: "not_started",
      source: c.source,
    };

    const activationReadinessPct = readinessPct(base);
    return { ...base, activationReadinessPct, nextAction: "" };
  });

  for (const s of stops) {
    s.nextAction = nextActionFor(s);
    if (s.verificationStatus === "verified" && s.effectiveScore >= 50) {
      s.storyWorkflowStatus = "capture_plan_ready";
      if (s.facebookStatus === "not_started") s.facebookStatus = "draft_needed";
    }
  }

  stops.sort((a, b) => {
    const verRank = { verified: 0, tentative: 1, missing: 2 };
    const vd = verRank[a.verificationStatus] - verRank[b.verificationStatus];
    if (vd !== 0) return vd;
    if (b.effectiveScore !== a.effectiveScore) return b.effectiveScore - a.effectiveScore;
    const tierRank = { A: 0, B: 1, C: 2, D: 3 };
    const td =
      (tierRank[a.countyTier as keyof typeof tierRank] ?? 4) -
      (tierRank[b.countyTier as keyof typeof tierRank] ?? 4);
    if (td !== 0) return td;
    return a.date.localeCompare(b.date);
  });

  return stops;
}

export function stopsNextWeek(stops: UpcomingStopActivation[]): UpcomingStopActivation[] {
  return stops.filter((s) => {
    const d = daysFromToday(s.date);
    return d >= 0 && d <= 7;
  });
}

export { daysFromToday, clusterForCounty };
