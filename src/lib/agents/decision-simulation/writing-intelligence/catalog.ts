import type {
  ActorWritingIntelligence,
  AuthorshipConfidence,
  ComparisonAxis,
  DerivedWritingRecord,
  EvidenceBackedTrait,
  EvidenceState,
  TemporalSlice,
  TemporalWindowId,
  WritingActorId,
  WritingSourceType,
} from "./contracts";
import { WRITING_INTELLIGENCE_VERSION, WRITING_RETRIEVAL_DATE } from "./contracts";
import { averageFeatures, averageRhetoric, emptyRhetoric } from "./analyze";
import corpusJson from "./data/corpus.json";

const AS_OF = new Date(`${WRITING_RETRIEVAL_DATE}T12:00:00.000Z`);

function daysBetween(iso: string): number {
  const published = Date.parse(iso);
  if (!Number.isFinite(published)) return Number.POSITIVE_INFINITY;
  return (AS_OF.getTime() - published) / 86_400_000;
}

function inWindow(publishedAt: string, window: TemporalWindowId): boolean {
  const days = daysBetween(publishedAt);
  if (window === "ALL_TIME") return true;
  if (window === "LAST_24_MONTHS") return days <= 730;
  if (window === "LAST_12_MONTHS") return days <= 365;
  return days <= 90;
}

export function loadWritingCorpus(): DerivedWritingRecord[] {
  return corpusJson as DerivedWritingRecord[];
}

export function assertUniqueSourceUrls(records: DerivedWritingRecord[]): string[] {
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const record of records) {
    const url = record.source.canonicalUrl;
    if (seen.has(url)) errors.push(`duplicate URL ${url}`);
    seen.add(url);
    if (record.source.actorId !== "chris-jones-ar02" && record.source.actorId !== "french-hill-ar02") {
      errors.push(`bad actor ${record.source.actorId}`);
    }
    if (record.source.provenance !== "FIRST_PARTY") {
      errors.push(`non-first-party source ${record.source.id}`);
    }
    if (record.source.excerpt.length > 280) {
      errors.push(`excerpt too long ${record.source.id}`);
    }
  }
  return errors;
}

export function authorshipRule(sourceType: WritingSourceType, bylineDirect: boolean): AuthorshipConfidence {
  if (sourceType === "SUBSTACK" && bylineDirect) return "DIRECT_AUTHOR";
  if (sourceType === "OFFICIAL_NEWSLETTER" || sourceType === "OFFICIAL_STATEMENT") return "OFFICIAL_OFFICE";
  if (sourceType === "CAMPAIGN_ARTICLE") return "ATTRIBUTED";
  return "UNCERTAIN";
}

function countThemes(records: DerivedWritingRecord[]): string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    for (const tag of record.source.topicTags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);
}

function temporalSlice(records: DerivedWritingRecord[], window: TemporalWindowId): TemporalSlice {
  const rows = records.filter((item) => inWindow(item.source.publishedAt, window));
  const dates = rows.map((item) => item.source.publishedAt).sort();
  return {
    window,
    documentCount: rows.length,
    newestSourceDate: dates.at(-1) ?? null,
    oldestSourceDate: dates[0] ?? null,
    topThemes: countThemes(rows),
    rhetoric: averageRhetoric(rows.map((item) => item.rhetoric)),
  };
}

function comparisonAxes(records: DerivedWritingRecord[]): ComparisonAxis[] {
  const rhetoric = averageRhetoric(records.map((item) => item.rhetoric));
  const structure = records.reduce(
    (sum, item) => ({
      jones: sum.jones + item.structure.jonesArc,
      hill: sum.hill + item.structure.hillArc,
    }),
    { jones: 0, hill: 0 },
  );
  const n = Math.max(records.length, 1);
  const method = "Mean detector rate across first-party public writings in this corpus. Not a personality score.";
  return [
    { id: "story", label: "Story-driven", score: rhetoric.anecdote, methodology: method },
    { id: "technical", label: "Technical analogy", score: rhetoric.analogy, methodology: method },
    { id: "moral", label: "Moral framing", score: rhetoric.moralFraming, methodology: method },
    { id: "statistics", label: "Statistics", score: rhetoric.statistics, methodology: method },
    { id: "personal", label: "Personal narrative", score: rhetoric.personalNarrative, methodology: method },
    { id: "local", label: "Local imagery", score: rhetoric.localExample, methodology: method },
    { id: "institutional", label: "Institutional", score: Number(((rhetoric.authority + rhetoric.institutionalProcess + structure.hill / n) / 3).toFixed(4)), methodology: method },
    { id: "legislative", label: "Legislative proof", score: rhetoric.institutionalProcess, methodology: method },
  ];
}

function decisionTendencies(actorId: WritingActorId, records: DerivedWritingRecord[]): EvidenceBackedTrait[] {
  const ids = records.map((item) => item.source.id);
  const rhetoric = averageRhetoric(records.map((item) => item.rhetoric));
  const contrastShare = records.filter((item) => item.issueVoices.includes("ATTACK_CONTRAST")).length / Math.max(records.length, 1);
  const bipartisanShare = records.filter((item) => item.issueVoices.includes("BIPARTISAN")).length / Math.max(records.length, 1);
  const economicShare = records.filter((item) => item.issueVoices.includes("ECONOMIC")).length / Math.max(records.length, 1);
  const observed = (ok: boolean): EvidenceState => (ok ? "OBSERVED" : "INFERRED");
  if (actorId === "chris-jones-ar02") {
    return [
      {
        label: "Preferred terrain",
        value: "Affordability, systems diagnosis, and Arkansas kitchen-table consequences",
        sourceState: observed(economicShare >= 0.3),
        confidence: "HIGH",
        evidenceSourceIds: ids.slice(0, 8),
      },
      {
        label: "Document architecture",
        value: "Personal or everyday opening → systems explanation → moral/values frame → hopeful action",
        sourceState: observed(records.filter((item) => item.structure.jonesArc >= 0.6).length / records.length >= 0.35),
        confidence: "MEDIUM",
        evidenceSourceIds: ids.slice(0, 8),
      },
      {
        label: "Opponent naming",
        value: contrastShare >= 0.2 ? "Names incumbent/committee terrain on economic and AI pieces" : "Usually systemic rather than personal attack",
        sourceState: observed(rhetoric.opponentContrast > 0.15 || contrastShare >= 0.15),
        confidence: "MEDIUM",
        evidenceSourceIds: ids.filter((_, index) => index < 6),
      },
      {
        label: "Close / call to action",
        value: "Collective choice, blessings/sign-off, or explicit campaign ask after the diagnosis",
        sourceState: observed(rhetoric.callToAction > 0.2),
        confidence: "MEDIUM",
        evidenceSourceIds: ids.slice(0, 6),
      },
      {
        label: "Statistics vs story",
        value: rhetoric.anecdote >= rhetoric.statistics ? "Story and analogy first; figures support the system claim" : "Figures lead more often than story",
        sourceState: "OBSERVED",
        confidence: "MEDIUM",
        evidenceSourceIds: ids.slice(0, 6),
      },
    ];
  }
  return [
    {
      label: "Preferred terrain",
      value: "Committee/legislative accomplishment, fraud/housing/workforce, and district service",
      sourceState: observed(rhetoric.institutionalProcess > 0.2 || rhetoric.authority > 0.2),
      confidence: "HIGH",
      evidenceSourceIds: ids.slice(0, 8),
    },
    {
      label: "Document architecture",
      value: "Friends greeting → problem/statistic → Arkansas example → committee action → constituent close",
      sourceState: observed(records.filter((item) => item.structure.hillArc >= 0.6).length / records.length >= 0.3),
      confidence: "MEDIUM",
      evidenceSourceIds: ids.slice(0, 8),
    },
    {
      label: "Attack vs pivot",
      value: bipartisanShare >= contrastShare ? "Often pivots to bipartisan or institutional accomplishment" : "Contrast appears as often as bipartisan framing",
      sourceState: observed(bipartisanShare > 0 || contrastShare > 0),
      confidence: "MEDIUM",
      evidenceSourceIds: ids.slice(0, 8),
    },
    {
      label: "Local vs national",
      value: "National policy is usually tied to a central Arkansas illustration or office service note",
      sourceState: observed(rhetoric.localExample > 0.25),
      confidence: "HIGH",
      evidenceSourceIds: ids.slice(0, 8),
    },
    {
      label: "Statistics vs story",
      value: rhetoric.statistics >= rhetoric.anecdote ? "Leads with figures, then legislative proof" : "More anecdotal than the Hill archive average would suggest",
      sourceState: "OBSERVED",
      confidence: "MEDIUM",
      evidenceSourceIds: ids.slice(0, 6),
    },
  ];
}

export function buildActorWritingIntelligence(actorId: WritingActorId, records = loadWritingCorpus()): ActorWritingIntelligence {
  const rows = records.filter((item) => item.source.actorId === actorId);
  const dates = rows.map((item) => item.source.publishedAt).sort();
  const authorship = {
    DIRECT_AUTHOR: 0,
    OFFICIAL_OFFICE: 0,
    ATTRIBUTED: 0,
    UNCERTAIN: 0,
  } satisfies Record<AuthorshipConfidence, number>;
  const sourceTypes: Partial<Record<WritingSourceType, number>> = {};
  for (const row of rows) {
    authorship[row.source.authorshipConfidence] += 1;
    sourceTypes[row.source.sourceType] = (sourceTypes[row.source.sourceType] ?? 0) + 1;
  }
  const motifCounts = new Map<string, { count: number; newest: string }>();
  for (const row of rows) {
    for (const motif of row.motifs) {
      const prev = motifCounts.get(motif.motif) ?? { count: 0, newest: row.source.publishedAt };
      motifCounts.set(motif.motif, {
        count: prev.count + motif.count,
        newest: row.source.publishedAt > prev.newest ? row.source.publishedAt : prev.newest,
      });
    }
  }
  const motifTotal = [...motifCounts.values()].reduce((sum, item) => sum + item.count, 0) || 1;
  const issueMap = new Map<string, DerivedWritingRecord[]>();
  for (const row of rows) {
    for (const voice of row.issueVoices) {
      issueMap.set(voice, [...(issueMap.get(voice) ?? []), row]);
    }
  }
  const recent = rows.filter((item) => inWindow(item.source.publishedAt, "LAST_90_DAYS"));
  const year = rows.filter((item) => inWindow(item.source.publishedAt, "LAST_12_MONTHS"));
  const recentRhetoric = averageRhetoric(recent.map((item) => item.rhetoric));
  const yearRhetoric = averageRhetoric(year.map((item) => item.rhetoric));
  const tendencies = decisionTendencies(actorId, rows);
  const evidenceCounts = { OBSERVED: 0, INFERRED: 0, HYPOTHESIS: 0 } satisfies Record<EvidenceState, number>;
  for (const trait of tendencies) evidenceCounts[trait.sourceState] += 1;

  return {
    actorId,
    version: WRITING_INTELLIGENCE_VERSION,
    generatedAt: `${WRITING_RETRIEVAL_DATE}T00:00:00.000Z`,
    documentCount: rows.length,
    newestSourceDate: dates.at(-1) ?? null,
    oldestSourceDate: dates[0] ?? null,
    authorship,
    sourceTypes,
    topThemes: countThemes(rows),
    fingerprint: {
      lexicalNotes: actorId === "chris-jones-ar02"
        ? ["system", "arkansas", "families", "accountability", "affordability"]
        : ["arkansas", "committee", "friends", "workforce", "housing"],
      syntax: averageFeatures(rows.map((item) => item.features)),
      rhetoric: averageRhetoric(rows.map((item) => item.rhetoric)),
      structure: {
        jonesArc: Number((rows.reduce((sum, item) => sum + item.structure.jonesArc, 0) / Math.max(rows.length, 1)).toFixed(4)),
        hillArc: Number((rows.reduce((sum, item) => sum + item.structure.hillArc, 0) / Math.max(rows.length, 1)).toFixed(4)),
      },
      motifs: [...motifCounts.entries()]
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([motif, value]) => ({
          motif,
          count: value.count,
          share: Number((value.count / motifTotal).toFixed(4)),
          recency: value.newest,
        })),
    },
    issueVoices: [...issueMap.entries()]
      .map(([id, list]) => ({
        id: id as ActorWritingIntelligence["issueVoices"][number]["id"],
        documentCount: list.length,
        share: Number((list.length / Math.max(rows.length, 1)).toFixed(4)),
        rhetoric: averageRhetoric(list.map((item) => item.rhetoric)),
      }))
      .sort((a, b) => b.documentCount - a.documentCount),
    decisionTendencies: tendencies,
    temporal: (["ALL_TIME", "LAST_24_MONTHS", "LAST_12_MONTHS", "LAST_90_DAYS"] as TemporalWindowId[]).map((window) =>
      temporalSlice(rows, window),
    ),
    drift: {
      voiceDrift: recent.length && year.length
        ? `90-day analogy ${recentRhetoric.analogy} vs 12-month ${yearRhetoric.analogy}`
        : "Insufficient recent slice",
      issueDrift: `${countThemes(recent).slice(0, 3).join(", ") || "n/a"} vs year ${countThemes(year).slice(0, 3).join(", ") || "n/a"}`,
      rhetoricalDrift: `90-day contrast ${recentRhetoric.opponentContrast} vs 12-month ${yearRhetoric.opponentContrast}`,
      partisanshipDrift: `90-day institutional ${recentRhetoric.institutionalProcess} vs 12-month ${yearRhetoric.institutionalProcess}`,
      messagePriorityDrift: (countThemes(recent)[0] ?? "unknown") + " is the most common recent tag",
    },
    comparison: comparisonAxes(rows),
    uncertainty: [
      "Public pages can be partial if a host truncates or paywalls body text.",
      "Official newsletters are office voice, not a claim that every sentence was personally typed.",
      "Detector scores are corpus rates, not psychological diagnoses.",
      rows.length < 20 ? "Corpus is below the preferred depth for this actor." : "More sources will still refine rare-issue voices.",
    ],
    sources: rows.map((item) => item.source),
    evidenceCounts,
  };
}

export function getWritingIntelligencePair(records = loadWritingCorpus()) {
  return {
    jones: buildActorWritingIntelligence("chris-jones-ar02", records),
    hill: buildActorWritingIntelligence("french-hill-ar02", records),
  };
}

export function customActorHasSources(sourceCount: number): boolean {
  return sourceCount > 0;
}
