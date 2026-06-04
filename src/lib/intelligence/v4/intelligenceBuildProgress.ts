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
import { KELLY_ATTACK_VECTORS } from "@/lib/intelligence/v4/kellyCandidateResearchDepth";
import { KELLY_OFFENSIVE_MOVES } from "@/lib/intelligence/v4/kellyOffensiveApproachDepth";

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

  // Claims ledger
  let claimsSupported = 0;
  try {
    const ledger = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data/intelligence/claims/claim-ledger.json"), "utf8"),
    ) as { entries?: Array<{ classification?: string }> };
    claimsSupported = ledger.entries?.filter((e) => e.classification === "VERIFIED").length ?? 0;
  } catch {
    /* optional */
  }
  items.push({
    id: "claims-ledger",
    label: "Claims ledger verification",
    category: "Governance",
    completionPct: claimsSupported > 50 ? 85 : 60,
    status: "partial",
    built: claimsSupported,
    total: claimsSupported + 20,
    flags: ["Retrieval queue tasks may remain open — verify before broadcast"],
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

  // Debate command hardcoded scores
  items.push({
    id: "debate-command-scores",
    label: "Debate command live readiness scores",
    category: "Readiness",
    completionPct: 45,
    status: "partial",
    built: 1,
    total: 2,
    flags: ["Readiness scores partially hardcoded — wire to live packet"],
    href: "/admin/intelligence/debate-command",
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
    "/admin/intelligence/kim-hammer/debate-prep",
    "/admin/intelligence/trap-lanes",
    "/admin/intelligence/sos-debate-questions",
    "/admin/intelligence/debate-depth",
    "/admin/intelligence/kelly-debate-coaching",
    "/admin/intelligence/debate-command",
    "/admin/intelligence/claims",
    "/admin/intelligence/election-funding",
    "/admin/intelligence/build-progress",
    ...trapIds.map((id) => `/admin/intelligence/trap-lanes/${id}`),
    ...qIds.map((id) => `/admin/intelligence/sos-debate-questions/${id}`),
    ...prepIds.map((id) => `/admin/intelligence/kim-hammer/debate-prep/${id}`),
    ...billNumbers.slice(0, 29).map((b) => `/admin/intelligence/kim-hammer/bills/${b}`),
    ...billNumbers.slice(0, 29).map((b) => `/admin/intelligence/kim-hammer/bills/${b}/act-proof`),
  ];

  const flaggedForMasterBuild = items.flatMap((i) => (i.flags.length ? i.flags.map((f) => `[${i.label}] ${f}`) : []));

  const phases: BuildPhase[] = [
    {
      phase: 1,
      name: "v5.0 — Drill-down depth (COMPLETE THIS PASS)",
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
      name: "v5.3 — Live readiness wiring",
      targetVersion: "0.14.0",
      goal: "Replace hardcoded debate command scores; close retrieval queue.",
      items: ["Wire debate-command to v4 packet scores", "NSI-16 unified command center", "LLM inference when configured"],
      exitCriteria: ["Debate command scores live from packet", "Retrieval tasks closed or deferred with owner"],
    },
    {
      phase: 5,
      name: "v6.0 — Staff module completion",
      targetVersion: "0.15.0",
      goal: "Promote launch stubs to live modules where debate week needs them.",
      items: ["Citation locker integration", "Narrative drift monitor", "County briefing automation"],
      exitCriteria: ["Staff modules >80% on progress chart"],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    version: "v5.0-hardening",
    overallCompletionPct,
    items,
    phases,
    linkAuditRoutes,
    flaggedForMasterBuild,
  };
}
