import fs from "node:fs";
import path from "node:path";
import type { HammerBillRow } from "@/lib/opposition/kimHammerWorkbench";
import type {
  KimHammerBillNarrativeIntelligence,
  KimHammerCountyAdministrationBurdenFile,
  KimHammerIntegrityFoundationPackage,
  KimHammerLegislativeChronologyFile,
  KimHammerLegislativeEvidenceStatus,
  KimHammerLegislativeEvidenceTier,
  KimHammerLegislativePublicationRisk,
  KimHammerStrategicBriefing,
} from "@/lib/opposition/types/kimHammerLegislativeNarrative";
import type { KimHammerStrategicBriefingSections } from "@/lib/opposition/kimHammerBriefingTypes";

const NARRATIVES_REL = "data/opposition/kim-hammer-election-record-legislative-narratives.json";
const FOUNDATION_REL = "data/opposition/kim-hammer-profile/kim-hammer-kh0b-2021-integrity-foundation.json";
const COUNTY_BURDEN_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-kh0b-county-administration-burden.json";
const CHRONOLOGY_REL = "data/opposition/kim-hammer-profile/kim-hammer-kh0b-legislative-chronology.json";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

function asStringArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeCampaignAlignment(raw: unknown): KimHammerStrategicBriefing["campaignAlignment"] {
  if (typeof raw === "string") {
    return { alignsWithKelly: [], conflictsWithKelly: [], neutralOrContextual: [raw] };
  }
  if (!raw || typeof raw !== "object") {
    return { alignsWithKelly: [], conflictsWithKelly: [], neutralOrContextual: [] };
  }
  const record = raw as Record<string, unknown>;
  return {
    alignsWithKelly: asStringArray(record.alignsWithKelly as string | string[] | undefined),
    conflictsWithKelly: asStringArray(record.conflictsWithKelly as string | string[] | undefined),
    neutralOrContextual: asStringArray(
      (record.neutralOrContextual as string | string[] | undefined) ??
        (record.neutral as string | string[] | undefined),
    ),
  };
}

export function normalizeStrategicBriefing(raw: unknown): KimHammerStrategicBriefing {
  const record = (raw ?? {}) as Record<string, unknown>;
  return {
    howToMessage: asStringArray(record.howToMessage as string | string[] | undefined),
    debateImpact: asStringArray(record.debateImpact as string | string[] | undefined),
    whenToUse: asStringArray(record.whenToUse as string | string[] | undefined),
    whenNotToUse: asStringArray(record.whenNotToUse as string | string[] | undefined),
    oppositionSetup: asStringArray(record.oppositionSetup as string | string[] | undefined),
    kellyMessageHelp: asStringArray(record.kellyMessageHelp as string | string[] | undefined),
    campaignAlignment: normalizeCampaignAlignment(record.campaignAlignment),
  };
}

export function toBriefingStrategicSections(
  briefing: KimHammerStrategicBriefing,
): KimHammerStrategicBriefingSections {
  return {
    howToMessage: briefing.howToMessage,
    debateImpact: briefing.debateImpact,
    whenToUse: briefing.whenToUse,
    whenNotToUse: briefing.whenNotToUse,
    oppositionSetup: briefing.oppositionSetup,
    kellyMessageHelp: briefing.kellyMessageHelp,
    campaignAlignment: briefing.campaignAlignment,
  };
}

function normalizeEvidenceTier(raw: unknown): KimHammerLegislativeEvidenceTier {
  if (typeof raw === "string") {
    if (raw.startsWith("TIER_1")) return "TIER_1_PUBLIC_DEPLOYABLE";
    if (raw.startsWith("TIER_2")) return "TIER_2_NEEDS_CORROBORATION";
    if (raw.startsWith("TIER_3")) return "TIER_3_INTERNAL_ONLY";
    return "NEEDS_REVIEW";
  }
  if (raw && typeof raw === "object") {
    const messaging = (raw as Record<string, string>).strategicMessaging;
    if (messaging === "INTERPRETATION" || messaging === "NEEDS_REVIEW") return "NEEDS_REVIEW";
    return "TIER_2_NEEDS_CORROBORATION";
  }
  return "NEEDS_REVIEW";
}

function normalizeDebateFrames(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, string>).map(([key, value]) => `${key}: ${value}`);
  }
  return [];
}

function normalizeBillNarrative(raw: Record<string, unknown>): KimHammerBillNarrativeIntelligence {
  return {
    billNumber: String(raw.billNumber),
    actNumber: raw.actNumber != null ? String(raw.actNumber) : null,
    sessionYear: String(raw.sessionYear ?? ""),
    packageId: raw.legislativePackageId ? String(raw.legislativePackageId) : undefined,
    evidenceStatus: (raw.evidenceStatus as KimHammerLegislativeEvidenceStatus) ?? "INTERPRETATION",
    plainEnglishSummary: String(raw.plainEnglishSummary ?? ""),
    billNarrative: String(raw.billNarrative ?? ""),
    countyImpactNarrative: String(raw.countyImpactNarrative ?? ""),
    operationalBurdenNarrative: String(raw.operationalBurdenNarrative ?? ""),
    courtRiskNarrative: raw.courtRiskNarrative ? String(raw.courtRiskNarrative) : undefined,
    debateFrames: normalizeDebateFrames(raw.debateFrames),
    counterArguments: asStringArray(raw.counterArguments as string | string[] | undefined),
    supporterArguments: asStringArray(raw.supporterArguments as string | string[] | undefined),
    evidenceTier: normalizeEvidenceTier(raw.evidenceTier),
    publicationRisk: (raw.publicationRisk as KimHammerLegislativePublicationRisk) ?? "MEDIUM",
    strategicBriefing: normalizeStrategicBriefing(raw.strategicBriefing),
    sourceLinks: asStringArray(raw.sourceLinks as string | string[] | undefined),
    governanceNotes: asStringArray(raw.governanceNotes as string | string[] | undefined),
  };
}

type RawNarrativesFile = {
  generatedAt?: string;
  narrativeVersion?: string;
  governanceRule?: string;
  bills: Array<Record<string, unknown>>;
};

export function loadKimHammerLegislativeNarratives(): {
  generatedAt: string;
  narrativeVersion: string;
  governanceRule: string;
  bills: KimHammerBillNarrativeIntelligence[];
} {
  const raw = readJson<RawNarrativesFile>(NARRATIVES_REL);
  return {
    generatedAt: raw.generatedAt ?? new Date().toISOString(),
    narrativeVersion: raw.narrativeVersion ?? "1.0",
    governanceRule: raw.governanceRule ?? "",
    bills: raw.bills.map(normalizeBillNarrative),
  };
}

type RawFoundationFile = KimHammerIntegrityFoundationPackage & {
  strategicBriefing: unknown;
  evidenceStatus?: unknown;
};

export function loadKimHammerIntegrityFoundation2021(): KimHammerIntegrityFoundationPackage & {
  strategicBriefing: KimHammerStrategicBriefing;
} {
  const raw = readJson<RawFoundationFile>(FOUNDATION_REL);
  return {
    ...raw,
    evidenceStatus:
      typeof raw.evidenceStatus === "string"
        ? raw.evidenceStatus
        : "INTERPRETATION",
    strategicBriefing: normalizeStrategicBriefing(raw.strategicBriefing),
  };
}

export function loadKimHammerCountyAdministrationBurden(): KimHammerCountyAdministrationBurdenFile & {
  strategicBriefing: KimHammerStrategicBriefing;
} {
  const raw = readJson<Record<string, unknown>>(COUNTY_BURDEN_REL);
  return {
    ...(raw as unknown as KimHammerCountyAdministrationBurdenFile),
    strategicBriefing: normalizeStrategicBriefing(raw.strategicBriefing),
  };
}

export function loadKimHammerLegislativeChronology(): KimHammerLegislativeChronologyFile {
  return readJson<KimHammerLegislativeChronologyFile>(CHRONOLOGY_REL);
}

export function findKimHammerBillNarrative(
  billNumber: string,
): KimHammerBillNarrativeIntelligence | null {
  const file = loadKimHammerLegislativeNarratives();
  return (
    file.bills.find((row) => row.billNumber.toUpperCase() === billNumber.toUpperCase()) ?? null
  );
}

function fallbackStrategicBriefing(bill: HammerBillRow): KimHammerStrategicBriefing {
  return {
    howToMessage: [
      `Use ${bill.billNumber} inside a pattern story about ${bill.topicCategory.slice(0, 2).join(" and ") || "election law"} — cite Arkleg act record first.`,
      bill.plainEnglishSummary ??
        `${bill.keyProvisions[0] ?? bill.title} Confirm enrolled act text before external use.`,
    ],
    debateImpact: [
      "Forces opponent to defend procedural choices, not just slogans.",
      "Opens county implementation and voter-access follow-ups if burden themes apply.",
    ],
    whenToUse: [
      "When moderator or opponent cites election-integrity record without year context.",
      "When linking 2021 foundation → 2023 equipment/enforcement → 2025 petition package.",
    ],
    whenNotToUse: [
      "As a standalone attack without act citation.",
      "When county burden or access impacts are still NEEDS_REVIEW for this bill.",
    ],
    oppositionSetup: [
      `Ask: "You sponsored ${bill.billNumber} — what changed for county clerks on the ground?"`,
      "Follow with: who pays, who trains, who is accountable when rules conflict.",
    ],
    kellyMessageHelp: [
      "Supports modern SOS doctrine: support counties, transparent rules, protect participation.",
      "Avoid motive language — stay on operational governance contrast.",
    ],
    campaignAlignment: {
      alignsWithKelly: bill.topicCategory.includes("secretary_of_state_duties")
        ? ["Clarifies SOS-adjacent duties — opportunity to distinguish Kelly's modernization plan."]
        : [],
      conflictsWithKelly: [
        ...(bill.directDemocracyImpact.includes("Touches") ||
        bill.directDemocracyImpact.includes("initiative")
          ? ["Direct democracy / petition process friction — contrast with Kelly access posture."]
          : []),
        ...(bill.countyAdministrationImpact.includes("Likely changes county")
          ? ["County clerk burden — contrast with Kelly county-support doctrine."]
          : []),
      ],
      neutralOrContextual: [
        "Integrity goals may overlap — distinguish methods, burden evidence, and transparency.",
      ],
    },
  };
}

export function resolveKimHammerBillNarrative(bill: HammerBillRow): KimHammerBillNarrativeIntelligence {
  const stored = findKimHammerBillNarrative(bill.billNumber);
  if (stored) return stored;

  return {
    billNumber: bill.billNumber,
    actNumber: bill.actNumber,
    sessionYear: bill.sessionYear,
    packageId: bill.legislativePackageId,
    evidenceStatus: "NEEDS_REVIEW",
    plainEnglishSummary:
      bill.plainEnglishSummary ??
      `${bill.title} (${bill.sessionYear}). ${bill.finalDisposition} Title-level summary only — enrolled act review required.`,
    billNarrative: bill.keyProvisions.join(" "),
    countyImpactNarrative: bill.countyAdministrationImpact,
    operationalBurdenNarrative: "NEEDS_REVIEW — county implementation evidence not yet attached.",
    debateFrames: [
      "Agree on integrity goals; test county support and voter access preservation.",
    ],
    counterArguments: [],
    supporterArguments: [],
    evidenceTier: bill.confidenceLevel === "HIGH" ? "TIER_2_NEEDS_CORROBORATION" : "NEEDS_REVIEW",
    publicationRisk: "MEDIUM",
    strategicBriefing: fallbackStrategicBriefing(bill),
    sourceLinks: bill.sourceLinks.filter((link) => link.startsWith("http")),
    governanceNotes: [
      "Auto-generated fallback narrative from bill index — not yet KH-0B curated.",
      ...bill.notes,
    ],
  };
}

export {
  NARRATIVES_REL,
  FOUNDATION_REL,
  COUNTY_BURDEN_REL,
  CHRONOLOGY_REL,
};
