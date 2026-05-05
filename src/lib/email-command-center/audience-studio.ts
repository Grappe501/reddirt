/**
 * EMAIL-AUDIENCE-STUDIO-1.0 — audience preview + building blocks over governed profile graph.
 * No SendGrid, no Gmail, no sends, no User/VolunteerProfile mutation.
 */

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { EmailWorkflowSourceType } from "@prisma/client";
import { emailProfileGraphSnapshotCounts } from "@/lib/email-command-center/profile-graph";

export type AudiencePreviewCriteria = {
  factKeyEquals?: string;
  factValueEquals?: string;
  factTypeEquals?: string;
  /** Match profiles with an approved audience hint label (governance: default APPROVED hints only). */
  audienceHintLabel?: string;
  /** When true, only APPROVED hints count for audienceHintLabel filter. Default true. */
  audienceHintApprovedOnly?: boolean;
  county?: string;
  city?: string;
  /** `EmailWorkflowItem.sourceType` — profile must be linked to a queue item with this source. */
  workflowSourceType?: string;
  minConfidence?: number;
  /** When true (default), preview universe requires at least one ACTIVE EmailContactProfileFact on the profile. */
  approvedFactsOnly?: boolean;
};

export type AudienceBuildingBlockRow = {
  kind: "approved_fact" | "pending_suggestion" | "audience_hint_label";
  factType?: string;
  factKey?: string;
  factValue?: string;
  label?: string;
  hintStatus?: string;
  profileOrSuggestionCount: number;
  avgConfidence: number | null;
  sourceLimitationsSample: string[];
};

export type AudienceClusterRow = {
  kind: "approved_hint_label" | "fact_combo";
  label?: string;
  factKey?: string;
  factValue?: string;
  matchProfiles: number;
};

export type AudiencePreviewSampleRow = {
  profileId: string;
  county: string | null;
  city: string | null;
  displayHint: string | null;
  emailDomainHint: string | null;
  activeFactCount: number;
};

export type AudienceStudioSnapshot = {
  dbAvailable: boolean;
  sendgridSyncStatus: "not_connected" | "foundation_rails";
  approvedActiveFacts: number;
  pendingProfileSuggestions: number;
  pendingAudienceHints: number;
  draftAudienceDefinitions: number;
  activeAudienceDefinitions: number;
  buildingBlockRowCount: number;
  audienceStudioPath: string;
  profilesReviewPath: string;
};

function trimOpt(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t ? t : undefined;
}

export function parseCriteria(raw: unknown): AudiencePreviewCriteria {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const num = (v: unknown): number | undefined =>
    typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() ? Number(v) : undefined;
  return {
    factKeyEquals: trimOpt(typeof o.factKeyEquals === "string" ? o.factKeyEquals : undefined),
    factValueEquals: trimOpt(typeof o.factValueEquals === "string" ? o.factValueEquals : undefined),
    factTypeEquals: trimOpt(typeof o.factTypeEquals === "string" ? o.factTypeEquals : undefined),
    audienceHintLabel: trimOpt(typeof o.audienceHintLabel === "string" ? o.audienceHintLabel : undefined),
    audienceHintApprovedOnly:
      typeof o.audienceHintApprovedOnly === "boolean" ? o.audienceHintApprovedOnly : undefined,
    county: trimOpt(typeof o.county === "string" ? o.county : undefined),
    city: trimOpt(typeof o.city === "string" ? o.city : undefined),
    workflowSourceType: trimOpt(typeof o.workflowSourceType === "string" ? o.workflowSourceType : undefined),
    minConfidence: num(o.minConfidence),
    approvedFactsOnly: typeof o.approvedFactsOnly === "boolean" ? o.approvedFactsOnly : undefined,
  };
}

export function explainAudienceCriteria(criteria: AudiencePreviewCriteria): string[] {
  const lines: string[] = [];
  const approvedDefault = criteria.approvedFactsOnly !== false;
  lines.push(
    approvedDefault
      ? "Universe: profiles with at least one ACTIVE approved profile fact (governed default)."
      : "Universe: relaxed — pending facts may be included when filters allow (use with care)."
  );
  if (criteria.factTypeEquals) lines.push(`Filter: factType equals "${criteria.factTypeEquals}".`);
  if (criteria.factKeyEquals) lines.push(`Filter: factKey equals "${criteria.factKeyEquals}".`);
  if (criteria.factValueEquals) lines.push(`Filter: factValue equals "${criteria.factValueEquals}".`);
  if (criteria.audienceHintLabel) {
    const ap = criteria.audienceHintApprovedOnly !== false;
    lines.push(
      `Filter: audience hint label "${criteria.audienceHintLabel}" (${ap ? "APPROVED hints only" : "includes non-approved hints — not broadcast-eligible"}).`
    );
  }
  if (criteria.county) lines.push(`Filter: EmailContactProfile.county equals "${criteria.county}".`);
  if (criteria.city) lines.push(`Filter: EmailContactProfile.city equals "${criteria.city}".`);
  if (criteria.workflowSourceType)
    lines.push(`Filter: linked EmailWorkflowItem.sourceType equals "${criteria.workflowSourceType}".`);
  if (criteria.minConfidence != null) lines.push(`Filter: fact confidence ≥ ${criteria.minConfidence} or null.`);
  lines.push("Audience hints are planning signals — not SendGrid segments.");
  lines.push("No email is sent from previews; SendGrid is not connected in this packet.");
  return lines;
}

function confidenceWhere(min?: number): Prisma.EmailContactProfileFactWhereInput {
  if (min == null || Number.isNaN(min)) return {};
  return {
    OR: [{ confidence: null }, { confidence: { gte: min } }],
  };
}

async function profileIdsMatchingFactFilters(
  criteria: AudiencePreviewCriteria
): Promise<Set<string> | null> {
  const minC = criteria.minConfidence;
  const conf = confidenceWhere(minC);
  const hasFactDim =
    Boolean(criteria.factKeyEquals) || Boolean(criteria.factValueEquals) || Boolean(criteria.factTypeEquals);

  if (!hasFactDim) return null;

  const where: Prisma.EmailContactProfileFactWhereInput = {
    status: "ACTIVE",
    ...conf,
    ...(criteria.factTypeEquals ? { factType: criteria.factTypeEquals } : {}),
    ...(criteria.factKeyEquals ? { factKey: criteria.factKeyEquals } : {}),
    ...(criteria.factValueEquals ? { factValue: criteria.factValueEquals } : {}),
  };

  const rows = await prisma.emailContactProfileFact.findMany({
    where,
    select: { profileId: true },
    distinct: ["profileId"],
  });
  return new Set(rows.map((r) => r.profileId));
}

async function profileIdsMatchingHintLabel(criteria: AudiencePreviewCriteria): Promise<Set<string> | null> {
  const label = criteria.audienceHintLabel?.trim();
  if (!label) return null;
  const approvedOnly = criteria.audienceHintApprovedOnly !== false;
  const where: Prisma.EmailAudienceHintWhereInput = {
    label: { equals: label, mode: "insensitive" },
    ...(approvedOnly ? { status: "APPROVED" } : {}),
    profileId: { not: null },
  };
  const rows = await prisma.emailAudienceHint.findMany({
    where,
    select: { profileId: true },
  });
  const ids = new Set<string>();
  for (const r of rows) {
    if (r.profileId) ids.add(r.profileId);
  }
  return ids;
}

async function profileIdsWithAnyActiveFacts(criteria: AudiencePreviewCriteria): Promise<Set<string>> {
  const conf = confidenceWhere(criteria.minConfidence);
  const rows = await prisma.emailContactProfileFact.findMany({
    where: { status: "ACTIVE", ...conf },
    select: { profileId: true },
    distinct: ["profileId"],
  });
  return new Set(rows.map((r) => r.profileId));
}

async function profileIdsMatchingGeo(criteria: AudiencePreviewCriteria): Promise<Set<string> | null> {
  if (!criteria.county && !criteria.city) return null;
  const rows = await prisma.emailContactProfile.findMany({
    where: {
      ...(criteria.county ? { county: { equals: criteria.county, mode: "insensitive" } } : {}),
      ...(criteria.city ? { city: { equals: criteria.city, mode: "insensitive" } } : {}),
    },
    select: { id: true },
  });
  return new Set(rows.map((r) => r.id));
}

async function profileIdsMatchingWorkflowSource(criteria: AudiencePreviewCriteria): Promise<Set<string> | null> {
  const st = criteria.workflowSourceType?.trim();
  if (!st) return null;
  const allowed = Object.values(EmailWorkflowSourceType) as string[];
  if (!allowed.includes(st)) return new Set();
  const items = await prisma.emailWorkflowItem.findMany({
    where: { sourceType: st as EmailWorkflowSourceType, emailContactProfileId: { not: null } },
    select: { emailContactProfileId: true },
    distinct: ["emailContactProfileId"],
  });
  return new Set(
    items.map((i) => i.emailContactProfileId).filter((x): x is string => typeof x === "string" && x.length > 0)
  );
}

function intersect(a: Set<string>, b: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const x of a) {
    if (b.has(x)) out.add(x);
  }
  return out;
}

/** Matched profile ids for criteria (same universe rules as `buildAudiencePreview`). */
export async function getAudiencePreviewMatchedProfileIds(
  criteria: AudiencePreviewCriteria
): Promise<string[]> {
  const approvedFactsOnly = criteria.approvedFactsOnly !== false;
  const sets: Set<string>[] = [];

  const factSet = await profileIdsMatchingFactFilters(criteria);
  if (factSet) sets.push(factSet);

  const hintSet = await profileIdsMatchingHintLabel(criteria);
  if (hintSet) sets.push(hintSet);

  const geoSet = await profileIdsMatchingGeo(criteria);
  if (geoSet) sets.push(geoSet);

  const wfSet = await profileIdsMatchingWorkflowSource(criteria);
  if (wfSet) sets.push(wfSet);

  let universe: Set<string>;
  if (sets.length === 0) {
    universe = await profileIdsWithAnyActiveFacts(criteria);
  } else {
    universe = sets[0]!;
    for (let i = 1; i < sets.length; i++) {
      universe = intersect(universe, sets[i]!);
    }
  }

  if (approvedFactsOnly) {
    const withFacts = await profileIdsWithAnyActiveFacts(criteria);
    universe = intersect(universe, withFacts);
  }

  return [...universe];
}

/** Preview match count + safe sample rows (no full email addresses in samples). */
export async function buildAudiencePreview(criteria: AudiencePreviewCriteria): Promise<{
  matchCount: number;
  samples: AudiencePreviewSampleRow[];
  limitations: string[];
}> {
  const limitations = explainAudienceCriteria(criteria);
  const ids = await getAudiencePreviewMatchedProfileIds(criteria);
  const matchCount = ids.length;

  const sampleIds = ids.slice(0, 12);
  if (sampleIds.length === 0) {
    return { matchCount: 0, samples: [], limitations };
  }

  const profiles = await prisma.emailContactProfile.findMany({
    where: { id: { in: sampleIds } },
    select: {
      id: true,
      county: true,
      city: true,
      displayName: true,
      primaryEmail: true,
      _count: { select: { facts: { where: { status: "ACTIVE" } } } },
    },
  });

  const emailDomainHint = (email: string | null | undefined): string | null => {
    if (!email?.includes("@")) return null;
    const d = email.split("@")[1]?.trim().toLowerCase();
    return d ? `@${d}` : null;
  };

  const samples: AudiencePreviewSampleRow[] = profiles.map((p) => ({
    profileId: p.id,
    county: p.county,
    city: p.city,
    displayHint: p.displayName ? `${p.displayName.slice(0, 1)}…` : null,
    emailDomainHint: emailDomainHint(p.primaryEmail),
    activeFactCount: p._count.facts,
  }));

  return { matchCount, samples, limitations };
}

export async function listAudienceBuildingBlocks(): Promise<AudienceBuildingBlockRow[]> {
  const approvedGroups = await prisma.emailContactProfileFact.groupBy({
    by: ["factType", "factKey", "factValue"],
    where: { status: "ACTIVE" },
    _count: { _all: true },
    _avg: { confidence: true },
  });

  const pendingGroups = await prisma.emailContactProfileFactSuggestion.groupBy({
    by: ["suggestionType", "factKey", "factValue"],
    where: { status: "PENDING" },
    _count: { _all: true },
    _avg: { confidence: true },
  });

  const hintLabels = await prisma.emailAudienceHint.groupBy({
    by: ["label", "status"],
    _count: { _all: true },
    _avg: { confidence: true },
  });

  const limSamples = await prisma.emailContactProfileFactSuggestion.findMany({
    where: { status: "PENDING", NOT: { sourceLimitations: { equals: [] } } },
    take: 40,
    select: { sourceLimitations: true },
  });
  const flatLim = new Set<string>();
  for (const r of limSamples) {
    for (const s of r.sourceLimitations) {
      if (s.trim()) flatLim.add(s.trim().slice(0, 200));
    }
  }

  const out: AudienceBuildingBlockRow[] = [];

  for (const g of approvedGroups) {
    out.push({
      kind: "approved_fact",
      factType: g.factType,
      factKey: g.factKey,
      factValue: g.factValue.slice(0, 400),
      profileOrSuggestionCount: g._count._all,
      avgConfidence: g._avg.confidence,
      sourceLimitationsSample: [],
    });
  }

  for (const g of pendingGroups) {
    out.push({
      kind: "pending_suggestion",
      factType: g.suggestionType,
      factKey: g.factKey,
      factValue: g.factValue.slice(0, 400),
      profileOrSuggestionCount: g._count._all,
      avgConfidence: g._avg.confidence,
      sourceLimitationsSample: [...flatLim].slice(0, 3),
    });
  }

  for (const h of hintLabels) {
    out.push({
      kind: "audience_hint_label",
      label: h.label.slice(0, 400),
      hintStatus: h.status,
      profileOrSuggestionCount: h._count._all,
      avgConfidence: h._avg.confidence,
      sourceLimitationsSample: [],
    });
  }

  return out.sort((a, b) => b.profileOrSuggestionCount - a.profileOrSuggestionCount);
}

export async function listSuggestedAudienceClusters(): Promise<AudienceClusterRow[]> {
  const hints = await prisma.emailAudienceHint.groupBy({
    by: ["label"],
    where: { status: "APPROVED" },
    _count: { _all: true },
  });

  const facts = await prisma.emailContactProfileFact.groupBy({
    by: ["factKey", "factValue"],
    where: { status: "ACTIVE" },
    _count: { _all: true },
  });

  const clusters: AudienceClusterRow[] = [];

  for (const h of hints) {
    clusters.push({ kind: "approved_hint_label", label: h.label, matchProfiles: h._count._all });
  }

  for (const f of facts) {
    if (f._count._all >= 2) {
      clusters.push({
        kind: "fact_combo",
        factKey: f.factKey,
        factValue: f.factValue.slice(0, 240),
        matchProfiles: f._count._all,
      });
    }
  }

  return clusters.sort((a, b) => b.matchProfiles - a.matchProfiles).slice(0, 40);
}

export async function getAudienceStudioSnapshot(): Promise<AudienceStudioSnapshot> {
  const pg = await emailProfileGraphSnapshotCounts().catch(() => ({
    approvedActiveFacts: 0,
    pendingProfileSuggestions: 0,
    pendingAudienceHints: 0,
  }));

  try {
    const [draftAudienceDefinitions, activeAudienceDefinitions, blockRows] = await Promise.all([
      prisma.emailAudienceDefinition.count({ where: { status: "DRAFT" } }),
      prisma.emailAudienceDefinition.count({ where: { status: "ACTIVE" } }),
      prisma.emailContactProfileFact
        .groupBy({
          by: ["factType", "factKey", "factValue"],
          where: { status: "ACTIVE" },
        })
        .then((r) => r.length),
    ]);

    return {
      dbAvailable: true,
      sendgridSyncStatus: "foundation_rails",
      approvedActiveFacts: pg.approvedActiveFacts,
      pendingProfileSuggestions: pg.pendingProfileSuggestions,
      pendingAudienceHints: pg.pendingAudienceHints,
      draftAudienceDefinitions,
      activeAudienceDefinitions,
      buildingBlockRowCount: blockRows,
      audienceStudioPath: "/admin/workbench/email-command-center/audiences",
      profilesReviewPath: "/admin/workbench/email-command-center/profiles",
    };
  } catch {
    return {
      dbAvailable: false,
      sendgridSyncStatus: "not_connected",
      approvedActiveFacts: pg.approvedActiveFacts,
      pendingProfileSuggestions: pg.pendingProfileSuggestions,
      pendingAudienceHints: pg.pendingAudienceHints,
      draftAudienceDefinitions: 0,
      activeAudienceDefinitions: 0,
      buildingBlockRowCount: 0,
      audienceStudioPath: "/admin/workbench/email-command-center/audiences",
      profilesReviewPath: "/admin/workbench/email-command-center/profiles",
    };
  }
}

export async function emailAudienceStudioSnapshotCounts(): Promise<{
  buildingBlockApprovedTriples: number;
  draftAudienceDefinitions: number;
  activeAudienceDefinitions: number;
  /** False when audience studio tables are missing or DB is unreachable. */
  studioTablesReachable: boolean;
}> {
  try {
    const [triples, draftAudienceDefinitions, activeAudienceDefinitions] = await Promise.all([
      prisma.emailContactProfileFact
        .groupBy({
          by: ["factType", "factKey", "factValue"],
          where: { status: "ACTIVE" },
        })
        .then((r) => r.length),
      prisma.emailAudienceDefinition.count({ where: { status: "DRAFT" } }),
      prisma.emailAudienceDefinition.count({ where: { status: "ACTIVE" } }),
    ]);
    return {
      buildingBlockApprovedTriples: triples,
      draftAudienceDefinitions,
      activeAudienceDefinitions,
      studioTablesReachable: true,
    };
  } catch {
    return {
      buildingBlockApprovedTriples: 0,
      draftAudienceDefinitions: 0,
      activeAudienceDefinitions: 0,
      studioTablesReachable: false,
    };
  }
}

export async function createDraftAudienceDefinition(input: {
  name: string;
  description?: string | null;
  criteria: AudiencePreviewCriteria;
  createdByUserId: string;
}): Promise<{ id: string }> {
  const name = input.name.trim();
  if (!name) throw new Error("Audience name is required.");
  const row = await prisma.emailAudienceDefinition.create({
    data: {
      name,
      description: input.description?.trim() || null,
      status: "DRAFT",
      criteriaJson: input.criteria as Prisma.InputJsonValue,
      createdByUserId: input.createdByUserId,
      metadataJson: {
        packet: "EMAIL-AUDIENCE-STUDIO-1.0",
        note: "Draft definition — not synced to SendGrid; preview-only governance surface.",
      } as Prisma.InputJsonValue,
    },
  });
  return { id: row.id };
}

export async function archiveAudienceDefinition(id: string, updatedByUserId: string): Promise<void> {
  const row = await prisma.emailAudienceDefinition.findUnique({ where: { id } });
  if (!row) throw new Error("Audience definition not found.");
  if (row.status === "ARCHIVED") return;
  await prisma.emailAudienceDefinition.update({
    where: { id },
    data: {
      status: "ARCHIVED",
      updatedByUserId,
      metadataJson: {
        ...(typeof row.metadataJson === "object" && row.metadataJson != null && !Array.isArray(row.metadataJson)
          ? (row.metadataJson as Record<string, unknown>)
          : {}),
        archivedAt: new Date().toISOString(),
      } as Prisma.InputJsonValue,
    },
  });
}

export async function listEmailAudienceDefinitions(opts?: {
  includeArchived?: boolean;
}): Promise<
  Array<{
    id: string;
    name: string;
    status: string;
    criteriaJson: unknown;
    updatedAt: Date;
  }>
> {
  const rows = await prisma.emailAudienceDefinition.findMany({
    where: opts?.includeArchived ? {} : { status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    take: 60,
    select: { id: true, name: true, status: true, criteriaJson: true, updatedAt: true },
  });
  return rows;
}

export async function logAudiencePreviewRun(params: {
  criteria: AudiencePreviewCriteria;
  matchCount: number;
  generatedByUserId: string | null;
  audienceDefinitionId?: string | null;
}): Promise<void> {
  await prisma.emailAudiencePreviewRun.create({
    data: {
      criteriaJson: params.criteria as Prisma.InputJsonValue,
      matchCount: params.matchCount,
      generatedByUserId: params.generatedByUserId,
      audienceDefinitionId: params.audienceDefinitionId ?? null,
      metadataJson: { packet: "EMAIL-AUDIENCE-STUDIO-1.0" } as Prisma.InputJsonValue,
    },
  });
}
