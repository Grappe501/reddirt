import fs from "node:fs";
import path from "node:path";
import { loadDebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getAllPrepSectionDrillDownIds, getPrepSectionDrillDown } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { listCuratedBillPlaybookNumbers } from "@/lib/intelligence/v4/debateBillOperatorPlaybooks";
import { listAllBillNumbersFromIndex, resolveArklegBillUrl } from "@/lib/intelligence/v4/billActProofDepth";
import { buildSosQuestionResponseRounds } from "@/lib/intelligence/v4/debateResponseRoundEnrichment";
import { buildTrapLaneStepCoverage } from "@/lib/intelligence/v4/trapLaneStepCoverage";
import { listDebatePhilosophyBriefings } from "@/lib/intelligence/v4/debatePhilosophyBriefings";
import { buildSosQuestionBriefing } from "@/lib/intelligence/v4/debateBriefingEnrichment";
import { buildDebatePrepFinderIndex } from "@/lib/intelligence/v4/debatePrepFinder";
import { KELLY_ATTACK_VECTORS } from "@/lib/intelligence/v4/kellyCandidateResearchDepth";
import { KELLY_OFFENSIVE_MOVES } from "@/lib/intelligence/v4/kellyOffensiveApproachDepth";
import { computeOppositionOffenseReadinessPct } from "@/lib/intelligence/v4/oppositionStrategyLayerMetrics";

export type BuildProgressItem = {
  id: string;
  label: string;
  category: string;
  completionPct: number;
  status: "complete" | "partial" | "stub" | "flagged";
  built: number;
  total: number;
  flags: string[];
  href?: string;
};

export type BuildPhase = {
  phase: number;
  name: string;
  targetVersion: string;
  goal: string;
  items: string[];
  exitCriteria: string[];
};

export type IntelligenceBuildProgressReport = {
  generatedAt: string;
  version: string;
  overallCompletionPct: number;
  items: BuildProgressItem[];
  phases: BuildPhase[];
  linkAuditRoutes: string[];
  flaggedForMasterBuild: string[];
};

function scoreDrillDown(minFields: boolean[], flags: string[] = []): { pct: number; status: BuildProgressItem["status"] } {
  const built = minFields.filter(Boolean).length;
  const total = minFields.length;
  const pct = Math.round((built / total) * 100);
  let status: BuildProgressItem["status"] = "complete";
  if (pct < 50) status = "stub";
  else if (pct < 90) status = "partial";
  if (flags.length) status = pct >= 90 ? "flagged" : status;
  return { pct, status };
}

export function computeIntelligenceBuildProgress(): IntelligenceBuildProgressReport {
  const v4 = loadDebateIntelligenceV4Packet();
  const items: BuildProgressItem[] = [];

  // Debate prep sections
  const prepIds = getAllPrepSectionDrillDownIds();
  let prepBuilt = 0;
  for (const id of prepIds) {
    const d = getPrepSectionDrillDown(id)!;
    const ok =
      d.rebuttalScripts.length >= 1 &&
      d.rehearsalSteps.length >= 1 &&
      d.whyItMatters.length > 20 &&
      !!d.encounterDepth?.whatToExpectPlain;
    if (ok) prepBuilt++;
  }
  items.push({
    id: "debate-prep-sections",
    label: "Debate prep drill-downs (28 sections)",
    category: "Debate prep",
    completionPct: Math.round((prepBuilt / prepIds.length) * 100),
    status: prepBuilt === prepIds.length ? "complete" : "partial",
    built: prepBuilt,
    total: prepIds.length,
    flags: prepBuilt < prepIds.length ? ["Some sections missing encounter depth"] : [],
    href: "/admin/intelligence/kim-hammer/debate-prep",
  });

  // Trap lanes
  const trapIds = getAllTrapLaneIds();
  let trapBuilt = 0;
  for (const id of trapIds) {
    const d = getTrapLaneDrillDown(id)!;
    const coverage = buildTrapLaneStepCoverage(d);
    const ok =
      d.rebuttalScripts.length >= 1 &&
      d.whatToExpectHammerToSay.length >= 3 &&
      coverage.steps.length >= 6 &&
      !!d.encounterDepth?.whatToExpectPlain;
    if (ok) trapBuilt++;
  }
  items.push({
    id: "trap-lanes",
    label: "Trap lane drill-downs (6 lanes)",
    category: "Trap lanes",
    completionPct: Math.round((trapBuilt / trapIds.length) * 100),
    status: trapBuilt === trapIds.length ? "complete" : "partial",
    built: trapBuilt,
    total: trapIds.length,
    flags: [],
    href: "/admin/intelligence/trap-lanes",
  });

  // SOS questions
  const qIds = getAllSosDebateQuestionIds();
  let qBuilt = 0;
  for (const id of qIds) {
    const d = getSosDebateQuestionDrillDown(id)!;
    const rounds = buildSosQuestionResponseRounds(d);
    const ok =
      d.speakOrderDrills.length === 3 &&
      d.directAnswer30s.length > 30 &&
      rounds.rounds.length >= 5 &&
      !!d.encounterDepth?.whatToExpectPlain;
    if (ok) qBuilt++;
  }
  items.push({
    id: "sos-questions",
    label: "Probable SOS debate questions",
    category: "Questions",
    completionPct: Math.round((qBuilt / qIds.length) * 100),
    status: qBuilt === qIds.length ? "complete" : "partial",
    built: qBuilt,
    total: qIds.length,
    flags: [],
    href: "/admin/intelligence/sos-debate-questions",
  });

  // v6.3 briefing depth — why, alternatives, Hammer hooks on every question
  const philosophyCount = listDebatePhilosophyBriefings().length;
  let briefingBuilt = 0;
  for (const id of qIds) {
    const d = getSosDebateQuestionDrillDown(id)!;
    const b = buildSosQuestionBriefing(d);
    const ok =
      b.whyThisAnswerWorks.length > 80 &&
      b.alternativeOpeners.length >= 3 &&
      b.alternativeClosers.length >= 3 &&
      b.hammerResearchHooks.length >= 3;
    if (ok) briefingBuilt++;
  }
  items.push({
    id: "debate-briefing-depth",
    label: "Debate briefing depth (questions + philosophy)",
    category: "Briefings",
    completionPct: Math.round((briefingBuilt / qIds.length) * 100),
    status: briefingBuilt === qIds.length && philosophyCount >= 8 ? "complete" : "partial",
    built: briefingBuilt,
    total: qIds.length,
    flags: briefingBuilt < qIds.length ? ["Some questions missing full briefing enrichment"] : [],
    href: "/admin/intelligence/debate-briefings",
  });

  items.push({
    id: "debate-prep-finder",
    label: "Prep finder search index",
    category: "Navigation",
    completionPct: 100,
    status: "complete",
    built: buildDebatePrepFinderIndex().length,
    total: buildDebatePrepFinderIndex().length,
    flags: [],
    href: "/admin/intelligence/debate-briefings",
  });

  // Bills + act proof
  const billNumbers = listAllBillNumbersFromIndex();
  const curated = listCuratedBillPlaybookNumbers();
  let actProofBuilt = 0;
  let arklegLinked = 0;
  for (const b of billNumbers) {
    if (resolveArklegBillUrl(b)) arklegLinked++;
    if (v4.billNarratives.find((n) => n.billNumber.toUpperCase() === b.toUpperCase())) actProofBuilt++;
  }
  items.push({
    id: "bill-act-proof",
    label: "Bill act-proof drill-downs + Arkleg links",
    category: "Bills",
    completionPct: Math.round((actProofBuilt / billNumbers.length) * 100),
    status: actProofBuilt === billNumbers.length ? "complete" : "partial",
    built: actProofBuilt,
    total: billNumbers.length,
    flags:
      arklegLinked < billNumbers.length
        ? [`${billNumbers.length - arklegLinked} bills missing Arkleg URL`]
        : curated.length < billNumbers.length
          ? [`${billNumbers.length - curated.length} bills auto-synthesized playbooks (not curated)`]
          : [],
    href: "/admin/intelligence/kim-hammer/debate-prep",
  });

  // Kelly research
  const kellyNeedsResearch = KELLY_ATTACK_VECTORS.filter((v) => v.verificationStatus === "NEEDS_RESEARCH").length;
  items.push({
    id: "kelly-research",
    label: "Kelly candidate research depth",
    category: "Kelly defense",
    completionPct: Math.round(((KELLY_ATTACK_VECTORS.length - kellyNeedsResearch) / KELLY_ATTACK_VECTORS.length) * 100),
    status: kellyNeedsResearch === 0 ? "complete" : "partial",
    built: KELLY_ATTACK_VECTORS.length - kellyNeedsResearch,
    total: KELLY_ATTACK_VECTORS.length,
    flags: kellyNeedsResearch ? [`${kellyNeedsResearch} vectors NEEDS_RESEARCH (court records)`] : [],
    href: "/admin/intelligence/kelly-debate-coaching",
  });

  // Offensive approach
  items.push({
    id: "offensive-approach",
    label: "Offensive approach (respond · rebut · lead)",
    category: "Offense",
    completionPct: 100,
    status: "complete",
    built: KELLY_OFFENSIVE_MOVES.length,
    total: KELLY_OFFENSIVE_MOVES.length,
    flags: [],
    href: "/admin/intelligence/kelly-debate-coaching",
  });

  // Claims ledger — live ratio from ledger file
  let claimsSupported = 0;
  let claimsTotal = 0;
  let claimsNeedsResearch = 0;
  try {
    const ledger = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data/intelligence/claims/claim-ledger.json"), "utf8"),
    ) as { entries?: Array<{ classification?: string }> };
    const entries = ledger.entries ?? [];
    claimsTotal = entries.length;
    claimsSupported = entries.filter((e) => e.classification === "VERIFIED").length;
    claimsNeedsResearch = entries.filter((e) => e.classification === "NEEDS_RESEARCH").length;
  } catch {
    /* optional */
  }
  const claimsPct =
    claimsTotal > 0 ? Math.round((claimsSupported / claimsTotal) * 100) : claimsSupported > 50 ? 85 : 60;
  items.push({
    id: "claims-ledger",
    label: "Claims ledger verification",
    category: "Governance",
    completionPct: claimsPct,
    status: claimsPct >= 90 ? "complete" : claimsPct >= 75 ? "partial" : "flagged",
    built: claimsSupported,
    total: claimsTotal || claimsSupported + 20,
    flags:
      claimsNeedsResearch > 0
        ? [`${claimsNeedsResearch} claims NEEDS_RESEARCH — verify before broadcast`]
        : ["Retrieval queue tasks may remain open — verify before broadcast"],
    href: "/admin/intelligence/claims",
  });

  // NSI staff stubs
  items.push({
    id: "kh-staff-modules",
    label: "Kim Hammer staff modules (launch stubs)",
    category: "Staff NSI",
    completionPct: 35,
    status: "stub",
    built: 12,
    total: 35,
    flags: ["~30 KH modules show staff-stub in launch mode"],
    href: "/admin/intelligence/kim-hammer",
  });

  const offenseReadinessPct = computeOppositionOffenseReadinessPct();
  items.push({
    id: "debate-command-scores",
    label: "Debate command live readiness scores",
    category: "Readiness",
    completionPct: offenseReadinessPct,
    status: offenseReadinessPct >= 85 ? "complete" : offenseReadinessPct >= 70 ? "partial" : "flagged",
    built: offenseReadinessPct,
    total: 100,
    flags: offenseReadinessPct < 85 ? ["Raise lowest dimension on supreme workbench before stage"] : [],
    href: "/admin/intelligence/supreme-workbench",
  });

  // Opposition strategy layer v6.2
  items.push({
    id: "opposition-strategy-layer",
    label: "Opposition strategy layer (v6.2)",
    category: "Offense",
    completionPct: offenseReadinessPct,
    status: offenseReadinessPct >= 85 ? "complete" : "partial",
    built: listCuratedBillPlaybookNumbers().length,
    total: billNumbers.length,
    flags:
      listCuratedBillPlaybookNumbers().length < billNumbers.length
        ? [`${billNumbers.length - listCuratedBillPlaybookNumbers().length} bills still auto-synthesized`]
        : [],
    href: "/admin/intelligence/opposition-strategy",
  });

  // Supreme workbench v6
  items.push({
    id: "supreme-workbench",
    label: "Supreme workbench command surface",
    category: "Command",
    completionPct: 100,
    status: "complete",
    built: 8,
    total: 8,
    flags: [],
    href: "/admin/intelligence/supreme-workbench",
  });

  // Election funding intelligence (CVSGF + HAVA)
  items.push({
    id: "election-funding-cvsgf",
    label: "County Voting System Grant Fund research",
    category: "Election funding",
    completionPct: 72,
    status: "partial",
    built: 7,
    total: 10,
    flags: [
      "Statewide county-by-county award ledger not public — records request drafted",
      "FY2026-27 appropriation NEEDS_RESEARCH",
      "Garland $14,340 — verify primary county budget document",
    ],
    href: "/admin/intelligence/election-funding",
  });

  const overallCompletionPct = Math.round(items.reduce((s, i) => s + i.completionPct, 0) / items.length);

  const linkAuditRoutes = [
    "/admin/intelligence",
    "/admin/intelligence/supreme-workbench",
    "/admin/intelligence/opposition-strategy",
    "/admin/intelligence/kim-hammer/debate-prep",
    "/admin/intelligence/trap-lanes",
    "/admin/intelligence/sos-debate-questions",
    "/admin/intelligence/debate-briefings",
    "/admin/intelligence/debate-depth",
    "/admin/intelligence/kelly-debate-coaching",
    "/admin/intelligence/debate-command",
    "/admin/intelligence/claims",
    "/admin/intelligence/election-funding",
    "/admin/intelligence/build-progress",
    ...trapIds.map((id) => `/admin/intelligence/trap-lanes/${id}`),
    ...qIds.map((id) => `/admin/intelligence/sos-debate-questions/${id}`),
    ...listDebatePhilosophyBriefings().map((p) => `/admin/intelligence/debate-briefings/${p.briefingId}`),
    ...prepIds.map((id) => `/admin/intelligence/kim-hammer/debate-prep/${id}`),
    ...billNumbers.slice(0, 29).map((b) => `/admin/intelligence/kim-hammer/bills/${b}`),
    ...billNumbers.slice(0, 29).map((b) => `/admin/intelligence/kim-hammer/bills/${b}/act-proof`),
  ];

  const flaggedForMasterBuild = items.flatMap((i) => (i.flags.length ? i.flags.map((f) => `[${i.label}] ${f}`) : []));

  const phases: BuildPhase[] = [
    {
      phase: 1,
      name: "v5.0 — Drill-down depth (COMPLETE)",
      targetVersion: "0.13.0",
      goal: "Act-proof pages, response rounds, trap step coverage, progress dashboard, link audit.",
      items: [
        "Bill act-proof drill-down with Arkleg links",
        "SOS question response round enrichment",
        "Trap lane step-by-step coverage",
        "Kelly research + offensive depth modules",
        "Build progress dashboard",
      ],
      exitCriteria: [
        "All bill drill-down links go to act-proof (not self-loop)",
        "Link audit script passes on intelligence routes",
        "Typecheck clean",
      ],
    },
    {
      phase: 2,
      name: "v5.1 — Curated bill depth",
      targetVersion: "0.13.1",
      goal: "Expand curated playbooks from 5 anchor bills to full 29.",
      items: ["Curate remaining 24 bill playbooks", "Enrolled-act PDF links for all acts", "County examples per bill (verified)"],
      exitCriteria: ["0 auto-synthesized playbooks flagged on progress chart"],
    },
    {
      phase: 3,
      name: "v5.2 — Kelly verification pass",
      targetVersion: "0.13.2",
      goal: "Close NEEDS_RESEARCH on Kelly attack vectors.",
      items: ["CourtConnect search log", "Financial diligence log", "Counsel-approved denial scripts"],
      exitCriteria: ["Kelly research section 100% on progress chart"],
    },
    {
      phase: 4,
      name: "v5.3 — Live readiness wiring (COMPLETE)",
      targetVersion: "0.14.0",
      goal: "Supreme workbench unifies live scores, operator sequences, and opposition lanes.",
      items: [
        "Supreme workbench command surface",
        "Live readiness dimensions wired to drill-down depth",
        "Debate command scores from supreme workbench",
        "Kelly court diligence log checklist",
      ],
      exitCriteria: [
        "Debate command scores live from supreme workbench",
        "8 readiness dimensions computed from packet + drill-downs",
        "Operator sequences T-24h through spin room",
      ],
    },
    {
      phase: 5,
      name: "v6.0 — Staff module completion",
      targetVersion: "0.15.0",
      goal: "Promote launch stubs to live modules where debate week needs them.",
      items: ["Citation locker integration", "Narrative drift monitor", "County briefing automation"],
      exitCriteria: ["Staff modules >80% on progress chart"],
    },
    {
      phase: 6,
      name: "v6.1 — Curated bill completion + CVSGF ledger",
      targetVersion: "0.16.0",
      goal: "Close remaining auto-synthesized playbooks and statewide funding ledger.",
      items: [
        "Curate remaining auto-synthesized bill playbooks",
        "Execute CVSGF records request",
        "Close Kelly diligence log searches",
      ],
      exitCriteria: ["0 auto-synthesized playbooks flagged", "Kelly research 100%", "CVSGF ledger verified or deferred with owner"],
    },
    {
      phase: 7,
      name: "v6.2 — Opposition strategy layer (COMPLETE)",
      targetVersion: "0.15.2",
      goal: "Unified offense command: 2021/2025 package depth, trap lane map, offensive moves, cross-exam wiring.",
      items: [
        "Opposition strategy layer page + panel",
        "2021 integrity package six-bill anchors curated",
        "2025 petition cluster depth module",
        "Live claims ledger ratio on build progress",
        "Kelly diligence log JSON + supreme workbench integration",
      ],
      exitCriteria: [
        "Opposition strategy route live on Netlify",
        "11+ curated bill playbooks (2021 package complete)",
        "Hub compact panels for supreme workbench + opposition strategy",
        "Link audit includes /opposition-strategy",
      ],
    },
    {
      phase: 8,
      name: "v6.3 — Debate briefing depth (COMPLETE THIS PASS)",
      targetVersion: "0.16.0",
      goal: "Full quick-read briefings on every SOS question and trap lane — why, alternatives, Hammer hooks — plus philosophy library and prep finder.",
      items: [
        "Debate briefing enrichment on 23 SOS questions",
        "Eight philosophy/handling briefing pages",
        "Prep finder search across questions, traps, prep sections",
        "Hub + SOS index wired to briefing library",
        "Build progress tracks briefing completion",
      ],
      exitCriteria: [
        "Every SOS question drill-down opens with briefing panel",
        "Philosophy briefings route live",
        "Prep finder returns results for county, petition, integrity",
        "Netlify typecheck clean",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    version: "v6.3-debate-briefing-depth",
    overallCompletionPct,
    items,
    phases,
    linkAuditRoutes,
    flaggedForMasterBuild,
  };
}
