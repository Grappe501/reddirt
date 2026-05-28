import fs from "node:fs";
import path from "node:path";
import type { CampaignGraphEntity } from "@/lib/intelligence/types/campaignIntelligenceGraph";

const bills = [
  "SB486",
  "SB487",
  "SB488",
  "SB582",
  "SB643",
  "SB644",
  "SB254",
  "SB258",
  "SB272",
  "SB273",
  "SB292",
];

const entities: CampaignGraphEntity[] = [];

for (const billNumber of bills) {
  const is487 = billNumber === "SB487";
  const is488 = billNumber === "SB488";
  entities.push({
    entityId: `bill-${billNumber}`,
    entityType: "BILL",
    title: `${billNumber} — Kim Hammer election-law bill`,
    linkedEntities: [`narrative-${billNumber}`, "narrative-kh0b-2021-integrity-foundation"],
    doctrineLinks: is487
      ? ["doctrine-grassroots-principles", "doctrine-segmented-targeting", "doctrine-steve-strategy"]
      : is488
        ? ["doctrine-sos-keeper-records", "doctrine-steve-strategy"]
        : ["doctrine-steve-strategy", "doctrine-opponent-contrast-matrix"],
    countyLinks: is487 ? ["county-pulaski", "county-statewide"] : ["county-statewide"],
    citationLinks: is487 ? ["cite-sb487-2021"] : is488 ? ["cite-sb488-2021"] : [],
    exportLinks: [],
    strategicThemes: is487
      ? ["county_burden", "precinct_control", "implementation_burden"]
      : is488
        ? ["transparency_tradeoff", "public_records"]
        : ["election_integrity", "enforcement"],
    civicImpactThemes: is487
      ? ["polling_access", "county_operations", "voter_notice"]
      : is488
        ? ["transparency", "public_records_access"]
        : ["voter_process", "enforcement"],
    governingPrinciples: ["process_legitimacy", "county_partnership"],
    operationalImpacts: is487
      ? ["GIS mapping", "clerk training", "voter notification"]
      : ["poll worker training"],
    debateUsage: ["county_forums", "SOS_qualification_debate"],
    messagingFrames: is487
      ? ["support clerks", "stable polling places", "transparent site changes"]
      : ["calm lawful polling places"],
    publicRisk: "MEDIUM",
    reviewStatus: "INTERPRETATION",
    graphConfidence: "HIGH",
    synchronizationPriority: "P1_LIVE",
    sourceArtifact: "data/opposition/kim-hammer-election-record-legislative-narratives.json",
  });

  entities.push({
    entityId: `narrative-${billNumber}`,
    entityType: "NARRATIVE",
    title: `${billNumber} bill narrative cell`,
    linkedEntities: [`bill-${billNumber}`],
    doctrineLinks: [],
    countyLinks: [],
    citationLinks: [],
    exportLinks: [],
    strategicThemes: [],
    civicImpactThemes: [],
    governingPrinciples: [],
    operationalImpacts: [],
    debateUsage: [],
    messagingFrames: [],
    publicRisk: "MEDIUM",
    reviewStatus: "INTERPRETATION",
    graphConfidence: "MEDIUM",
    synchronizationPriority: "P1_LIVE",
  });
}

const registryNarratives = [
  {
    id: "narrative-kh0b-2021-integrity-foundation",
    title: "2021 Integrity Foundation",
    links: ["bill-SB486", "bill-SB487", "bill-SB488", "bill-SB582", "bill-SB643", "bill-SB644"],
  },
  {
    id: "narrative-kh0b-county-administration-burden",
    title: "County Administration Burden",
    links: ["bill-SB487", "county-burden-precinct-sites", "county-pulaski"],
  },
  {
    id: "narrative-kh0b-legislative-chronology",
    title: "Legislative Chronology Arc",
    links: ["narrative-kh0b-2021-integrity-foundation"],
  },
  {
    id: "narrative-debate-frame-election-integrity",
    title: "Debate Frame — Election Integrity",
    links: ["claim-pdeb-001", "export-dry-run-20260527"],
  },
  {
    id: "narrative-debate-frame-management-readiness",
    title: "Debate Frame — Management Readiness",
    links: ["claim-pdeb-002"],
  },
  {
    id: "narrative-debate-frame-debate-questions",
    title: "Debate Frame — Question Patterns",
    links: ["claim-pdeb-003", "export-dry-run-20260527"],
  },
];

for (const narrative of registryNarratives) {
  entities.push({
    entityId: narrative.id,
    entityType: "NARRATIVE",
    title: narrative.title,
    linkedEntities: narrative.links,
    doctrineLinks: ["doctrine-steve-strategy"],
    countyLinks: narrative.id.includes("county") ? ["county-pulaski"] : ["county-statewide"],
    citationLinks: [],
    exportLinks: narrative.links.filter((link) => link.startsWith("export-")),
    strategicThemes: ["governed_narrative"],
    civicImpactThemes: ["civic_trust"],
    governingPrinciples: ["balls_and_strikes_sos"],
    operationalImpacts: [],
    debateUsage: ["debate_prep"],
    messagingFrames: [],
    publicRisk: "MEDIUM",
    reviewStatus: "NEEDS_REVIEW",
    graphConfidence: "HIGH",
    synchronizationPriority: "P1_LIVE",
    sourceArtifact: "data/opposition/kim-hammer-profile/kim-hammer-narrative-registry.json",
  });
}

for (const countyId of ["statewide", "pulaski", "washington", "benton", "sebastian", "craighead"]) {
  entities.push({
    entityId: `county-${countyId}`,
    entityType: "COUNTY",
    title: countyId === "statewide" ? "Statewide" : `${countyId.charAt(0).toUpperCase()}${countyId.slice(1)} County`,
    linkedEntities: [`geo-overlay-${countyId}`],
    doctrineLinks: ["doctrine-grassroots-principles"],
    countyLinks: [],
    citationLinks: [],
    exportLinks: [],
    strategicThemes: ["geographic_readiness"],
    civicImpactThemes: ["local_trust"],
    governingPrinciples: ["county_differences_are_real"],
    operationalImpacts: [],
    debateUsage: [],
    messagingFrames: [],
    publicRisk: "LOW",
    reviewStatus: "APPROVED_FOR_INTERNAL_USE",
    graphConfidence: "HIGH",
    synchronizationPriority: "P1_LIVE",
    sourceArtifact: "data/opposition/kim-hammer-profile/kim-hammer-geographic-narrative-overlays.json",
  });

  entities.push({
    entityId: `geo-overlay-${countyId}`,
    entityType: "GEOGRAPHIC_OVERLAY",
    title: `NSI-2 overlay — ${countyId}`,
    linkedEntities: [`county-${countyId}`],
    doctrineLinks: [],
    countyLinks: [`county-${countyId}`],
    citationLinks: [],
    exportLinks: [],
    strategicThemes: [],
    civicImpactThemes: [],
    governingPrinciples: [],
    operationalImpacts: [],
    debateUsage: [],
    messagingFrames: [],
    publicRisk: "LOW",
    reviewStatus: "APPROVED_FOR_INTERNAL_USE",
    graphConfidence: "HIGH",
    synchronizationPriority: "P1_LIVE",
  });
}

for (const doctrineId of [
  "doctrine-steve-strategy",
  "doctrine-sos-keeper-records",
  "doctrine-grassroots-principles",
  "doctrine-opponent-contrast-matrix",
  "doctrine-kim-contrast-debate",
  "doctrine-segmented-targeting",
]) {
  entities.push({
    entityId: doctrineId,
    entityType: "DOCTRINE",
    title: doctrineId,
    linkedEntities: [],
    doctrineLinks: [],
    countyLinks: [],
    citationLinks: [],
    exportLinks: [],
    strategicThemes: ["campaign_doctrine"],
    civicImpactThemes: [],
    governingPrinciples: [],
    operationalImpacts: [],
    debateUsage: [],
    messagingFrames: [],
    publicRisk: "LOW",
    reviewStatus: "NEEDS_REVIEW",
    graphConfidence: "HIGH",
    synchronizationPriority: "P1_LIVE",
    sourceArtifact: "data/strategy-doctrine/campaign-strategic-doctrine-registry.json",
  });
}

entities.push({
  entityId: "export-dry-run-20260527",
  entityType: "EXPORT_PACKET",
  title: "Internal debate packet dry run",
  linkedEntities: [
    "narrative-debate-frame-election-integrity",
    "narrative-debate-frame-debate-questions",
    "claim-pdeb-001",
    "claim-pdeb-003",
  ],
  doctrineLinks: ["doctrine-opponent-contrast-matrix"],
  countyLinks: ["county-statewide"],
  citationLinks: ["cite-campaign-election-integrity-2025", "cite-pbs-debate-2022"],
  exportLinks: [],
  strategicThemes: ["export_lineage"],
  civicImpactThemes: [],
  governingPrinciples: [],
  operationalImpacts: [],
  debateUsage: ["debate_prep"],
  messagingFrames: [],
  publicRisk: "LOW",
  reviewStatus: "APPROVED_FOR_INTERNAL_USE",
  graphConfidence: "HIGH",
  synchronizationPriority: "P1_LIVE",
  sourceArtifact: "data/opposition/kim-hammer-profile/kim-hammer-export-history.json",
});

for (const claimId of ["pdeb-001", "pdeb-002", "pdeb-003"]) {
  entities.push({
    entityId: `claim-${claimId}`,
    entityType: "CLAIM",
    title: claimId,
    linkedEntities: [],
    doctrineLinks: ["doctrine-opponent-contrast-matrix"],
    countyLinks: [],
    citationLinks: [],
    exportLinks: [],
    strategicThemes: [],
    civicImpactThemes: [],
    governingPrinciples: [],
    operationalImpacts: [],
    debateUsage: [],
    messagingFrames: [],
    publicRisk: "MEDIUM",
    reviewStatus: "NEEDS_REVIEW",
    graphConfidence: "HIGH",
    synchronizationPriority: "P1_LIVE",
  });
}

entities.push({
  entityId: "county-burden-precinct-sites",
  entityType: "COUNTY_BURDEN_THEME",
  title: "Precinct site control burden",
  linkedEntities: ["bill-SB487", "narrative-kh0b-county-administration-burden"],
  doctrineLinks: ["doctrine-grassroots-principles"],
  countyLinks: ["county-pulaski"],
  citationLinks: ["cite-sb487-2021"],
  exportLinks: [],
  strategicThemes: ["county_burden"],
  civicImpactThemes: ["access", "operations"],
  governingPrinciples: ["county_partnership"],
  operationalImpacts: ["clerk workload"],
  debateUsage: ["county forums"],
  messagingFrames: ["fund implementation"],
  publicRisk: "MEDIUM",
  reviewStatus: "NEEDS_REVIEW",
  graphConfidence: "HIGH",
  synchronizationPriority: "P1_LIVE",
});

entities.push({
  entityId: "governance-balls-and-strikes",
  entityType: "GOVERNANCE_CONCEPT",
  title: "Balls-and-strikes SOS administration",
  linkedEntities: ["doctrine-steve-strategy", "philosophy-civic-trust"],
  doctrineLinks: ["doctrine-steve-strategy"],
  countyLinks: [],
  citationLinks: [],
  exportLinks: [],
  strategicThemes: ["neutral_administration"],
  civicImpactThemes: ["trust"],
  governingPrinciples: ["unity_over_division"],
  operationalImpacts: [],
  debateUsage: ["SOS philosophy questions"],
  messagingFrames: ["process not culture war"],
  publicRisk: "LOW",
  reviewStatus: "NEEDS_REVIEW",
  graphConfidence: "HIGH",
  synchronizationPriority: "P1_LIVE",
});

for (const philosophyId of [
  "philosophy-civic-trust",
  "philosophy-transparency",
  "philosophy-participation",
  "philosophy-county-partnership",
  "philosophy-modernization",
  "philosophy-citizen-empowerment",
  "philosophy-anti-centralization",
  "philosophy-direct-democracy",
]) {
  entities.push({
    entityId: philosophyId,
    entityType: "PHILOSOPHY",
    title: philosophyId,
    linkedEntities: [],
    doctrineLinks: [],
    countyLinks: [],
    citationLinks: [],
    exportLinks: [],
    strategicThemes: [],
    civicImpactThemes: [],
    governingPrinciples: [],
    operationalImpacts: [],
    debateUsage: [],
    messagingFrames: [],
    publicRisk: "LOW",
    reviewStatus: "NEEDS_REVIEW",
    graphConfidence: "HIGH",
    synchronizationPriority: "P1_LIVE",
    sourceArtifact: "data/intelligence/campaign-philosophy-graph.json",
  });
}

const outDir = path.join(process.cwd(), "data/intelligence");
fs.mkdirSync(outDir, { recursive: true });
const file = {
  generatedAt: new Date().toISOString(),
  graphVersion: "1.0",
  purpose:
    "NSI-4 unified campaign intelligence graph — governed entity relationships across bills, narratives, doctrines, counties, exports, and civic philosophy.",
  entityCount: entities.length,
  entities,
};

fs.writeFileSync(path.join(outDir, "campaign-intelligence-graph.json"), JSON.stringify(file, null, 2));
console.log(`Wrote ${entities.length} graph entities.`);
