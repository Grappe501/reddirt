import { loadKimHammerEvidenceIndex, resolveRetrievalTaskStatus } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";

export type KimHammerNarrativeSection = {
  id: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  pullQuotes?: Array<{ text: string; label?: string }>;
  crossLinks?: Array<{ href: string; label: string }>;
  evidenceNote?: string;
};

export type KimHammerNarrativeBriefings = {
  generatedAt: string;
  sections: KimHammerNarrativeSection[];
};

function pct(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function loadKimHammerNarrativeBriefings(): KimHammerNarrativeBriefings {
  const election = loadKimHammerWorkbench();
  const kh2 = loadKimHammerKh2Workbench();
  const kh3 = loadKimHammerKh3Workbench();
  const kh4 = loadKimHammerKh4Workbench();
  const index = loadKimHammerEvidenceIndex();

  const { messageAnalysis, contrast, debateProfile, vulnerabilities, websiteMessageIndex } = kh2;
  const {
    responseModel,
    narrativeTesting,
    legislationPatterns,
    modernSosContrast,
    directDemocracyFile,
    managementCapacity,
    publicDebateEvidenceBoard,
  } = kh3;

  const topPhrases = websiteMessageIndex.repeatedPhrases
    .slice(0, 3)
    .map((p) => `"${p.phrase}" (${p.occurrences} site hits)`)
    .join("; ");

  const exportReady = index.exportReadyClaims;
  const blocked = index.blockedClaims;
  const reviewNeeded = index.reviewNeededClaims;
  const highTasks = [...index.retrievalTasks]
    .filter((t) => t.priority === "HIGH" && resolveRetrievalTaskStatus(t) !== "COMPLETE")
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  const topRisk = kh4.riskRegister.risks.sort(
    (a, b) => b.overallThreatIndex - a.overallThreatIndex,
  )[0];

  const morningBrief: KimHammerNarrativeSection = {
    id: "morning-brief",
    title: "Operator morning brief",
    subtitle: "Synthesized from indexed opposition artifacts — not for external publication without review",
    paragraphs: [
      `Kim Hammer enters the SOS contest with a campaign frame built around ${messageAnalysis.candidateFrame.primary.toLowerCase()}, reinforced by ${messageAnalysis.candidateFrame.secondary.toLowerCase()}. The workbench currently indexes ${election.totalBills} bills across ${election.enactedActs} enacted acts, with ${election.highConfidenceThemes.length} high-confidence legislative themes already mapped for debate use. His public messaging repeats security-and-order language on the campaign site${topPhrases ? ` — including ${topPhrases}` : ""} — which sets the tone for how he will likely prosecute the qualification argument on stage.`,
      `The intelligence posture is asymmetric in a useful way: only ${exportReady.length} of ${index.metrics.totalClaims} unified claims are cleared for debate-packet export today, while ${reviewNeeded.length} remain in human-review or caution tiers and ${blocked.length} are publication-blocked. That is not a weakness in the research program — it is the safety architecture working. Kelly's team should treat the export-ready pair as the hard spine of external debate language and treat everything else as internal hypothesis until retrieval closes the gap.`,
      `${highTasks.length} high-priority retrieval missions remain active on the KH-3B board${highTasks.length > 0 ? `, led by rank #${highTasks[0]?.rank ?? "?"} (${highTasks[0]?.description.slice(0, 120)}…)` : ""}. Until those close, the campaign's strongest move is pattern-and-contrast discipline: lead with sourced legislative behavior and service philosophy, not speculative character claims.`,
    ],
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/evidence-command", label: "Evidence command center" },
      { href: "/admin/intelligence/kim-hammer/intelligence-gaps", label: "Retrieval task board" },
      { href: "/admin/intelligence/kim-hammer/debate-packet-export", label: "Debate packet export" },
    ],
    evidenceNote: "Composite INTERPRETATION from KH-1 through KH-4 artifacts; export counts from publication-safety gate.",
  };

  const opponentPosture: KimHammerNarrativeSection = {
    id: "opponent-posture",
    title: "Opponent posture narrative",
    subtitle: "How Hammer is likely to show up — and what the record actually supports",
    paragraphs: [
      `${kh2.profile.profileHighlights[0] ?? "Public profile data confirms long legislative tenure."} His likely SOS pitch compresses into three moves: cite election-security legislation, translate committee tenure into management readiness, and frame process tightening as fairness rather than restriction. The website message index labels his campaign frame as "${websiteMessageIndex.campaignFrameSummary.label}" with ${websiteMessageIndex.campaignFrameSummary.sourceConfidence} source confidence.`,
      `Management readiness is the fault line. The public debate board states plainly that "${publicDebateEvidenceBoard.items.find((i) => i.id === "pdeb-002-management-readiness")?.claim ?? "operational readiness evidence remains partial"}." That claim sits at Tier 2 with partial citations — usable internally to shape questions, not yet cleared for export. The management-capacity assessment surfaces ${managementCapacity.capacitySignals.length} capacity signals but also ${managementCapacity.questionsForFurtherValidation.length} open validation questions, meaning Hammer can sound prepared while the archive still lacks agency-scale proof.`,
      `On direct democracy, the dedicated file summarizes: ${directDemocracyFile.summary} This lane connects to the legislation-pattern work showing recurring petition-process mechanics — a debate topic where county administrators and initiative advocates may feel the impact first.`,
    ],
    pullQuotes: likelyArgumentsPull(kh2.likelyArguments.arguments.slice(0, 2)),
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/profile", label: "Candidate profile" },
      { href: "/admin/intelligence/kim-hammer/management-capacity", label: "Management capacity file" },
      { href: "/admin/intelligence/kim-hammer/direct-democracy", label: "Direct democracy file" },
    ],
    evidenceNote: messageAnalysis.candidateFrame.evidenceStatus,
  };

  const legislativePatternArc: KimHammerNarrativeSection = {
    id: "legislative-pattern-arc",
    title: "Legislative pattern arc",
    subtitle: "Longitudinal behavior story — not bill-by-bill trivia",
    paragraphs: [
      `Across ${election.totalBills} indexed bills and ${election.enactedActs} enacted acts, three pattern lanes emerge from the KH-3 legislation analysis. First, ${legislationPatterns.patternLanes[0]?.label ?? "centralization"}: ${legislationPatterns.patternLanes[0]?.description ?? ""} Second, ${legislationPatterns.patternLanes[1]?.label ?? "direct democracy"}: ${legislationPatterns.patternLanes[1]?.description ?? ""} Third, ${legislationPatterns.patternLanes[2]?.label ?? "procedural barriers"}: ${legislationPatterns.patternLanes[2]?.description ?? ""}`,
      `The pattern guidance is explicit: ${legislationPatterns.narrativeUseGuidance.join(" ")} In practice that means Kelly should narrate a decade of direction — how rules moved, who absorbed the burden, what counties had to implement — rather than debating a single act number in isolation. The bill relationship graph (${kh3.summary.graphNodeCount} nodes) and timeline heatmap (${kh3.summary.heatmapPeriods} activity windows) exist to support that story once operators drill into detail.`,
      `Open pattern work remains: ${legislationPatterns.openGaps.slice(0, 2).join("; ")}. Until sponsor/co-sponsor extraction and statutory deltas are complete, external messaging should stay at pattern level with bill citations attached, not at sweeping historical claims.`,
    ],
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/pattern-analysis", label: "Pattern analysis" },
      { href: "/admin/intelligence/kim-hammer/bill-relationship-graph", label: "Bill relationship graph" },
      { href: "/admin/intelligence/kim-hammer/timeline-heatmap", label: "Timeline heatmap" },
    ],
    evidenceNote: "INTERPRETATION — MEDIUM confidence pattern lanes",
  };

  const contrastDoctrine: KimHammerNarrativeSection = {
    id: "contrast-doctrine",
    title: "Kelly contrast doctrine",
    subtitle: "Service philosophy against Hammer's public record frame",
    paragraphs: [
      contrast.contrastFrames
        .map(
          (row, i) =>
            `${i + 1}. On ${row.frame.replaceAll("_", " ")}: Hammer's public positioning reads as "${row.hammerPositionSummary}" Kelly's contrast path is "${row.kellyContrast}"`,
        )
        .join(" "),
      `The modern SOS contrast matrix sharpens this for channel-specific use. Where Hammer leads with "${modernSosContrast.contrastRows[0]?.hammerLane ?? "restriction-first framing"}", Kelly leads with "${modernSosContrast.contrastRows[0]?.kellyLane ?? "access and integrity together"}" — suited for ${modernSosContrast.contrastRows[0]?.useCase.join(", ") ?? "debate"}. Where Hammer emphasizes "${modernSosContrast.contrastRows[1]?.hammerLane ?? "institutional control"}", Kelly emphasizes "${modernSosContrast.contrastRows[1]?.kellyLane ?? "citizen service"}" for ${modernSosContrast.contrastRows[1]?.useCase.join(", ") ?? "surrogate briefs"}.`,
      `Guardrails are non-negotiable: ${modernSosContrast.guardrails.join(" ")} The vulnerability matrix already translated ${vulnerabilities.weaknesses.length} weaknesses into debate-safe wording — use those safer formulations instead of raw attack lines.`,
    ],
    pullQuotes: contrast.contrastFrames.slice(0, 2).map((row) => ({
      text: row.kellyContrast,
      label: row.frame.replaceAll("_", " "),
    })),
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/contrast-vs-kelly", label: "Full contrast file" },
      { href: "/admin/intelligence/kim-hammer/modern-sos-contrast", label: "Modern SOS contrast" },
      { href: "/admin/intelligence/kim-hammer/strengths-weaknesses", label: "Strengths & weaknesses" },
    ],
    evidenceNote: "INTERPRETATION — sourced contrast frames",
  };

  const frameBriefs: KimHammerNarrativeSection[] = narrativeTesting.frames.map((frame) => ({
    id: `frame-${frame.id}`,
    title: `Narrative frame: ${frame.label}`,
    paragraphs: [
      `This frame tests whether "${frame.label}" persuades without overreach. Strongest evidence anchors include ${frame.strongestEvidence.join("; ")}. Weak points operators must respect: ${frame.weakPoints.join("; ")}.`,
      `Expect Hammer to rebut with: "${frame.likelyRebuttal}" Kelly's defensive counter — the line that keeps integrity language while holding the contrast — is: "${frame.defensiveCounter}"`,
    ],
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/narrative-testing", label: "Narrative testing lab" },
      { href: "/admin/intelligence/kim-hammer/narrative-drift-monitor", label: "Drift monitor" },
    ],
    evidenceNote: "INTERPRETATION — frame testing artifact",
  }));

  const responseScenarios: KimHammerNarrativeSection[] = responseModel.scenarios.map((scenario) => ({
    id: `scenario-${scenario.theme.replaceAll(/\s+/g, "-").toLowerCase()}`,
    title: scenario.theme,
    paragraphs: [
      `When Hammer is pressed on ${scenario.theme.toLowerCase()}, expect him to ${scenario.expectedHammerResponse.toLowerCase()} He will likely anchor on ${scenario.likelyEvidenceAnchor.join(", ")}.`,
      `Kelly's response path: ${scenario.kellyResponsePath} Bridge line for live use: "${scenario.bridgeLine}" Risk to avoid in the moment: ${scenario.riskToAvoid}`,
    ],
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/response-model", label: "Response model" },
      { href: "/admin/intelligence/kim-hammer/rebuttal-prep", label: "Rebuttal prep" },
    ],
    evidenceNote: responseModel.evidenceStatus,
  }));

  const debateTheater: KimHammerNarrativeSection = {
    id: "debate-theater",
    title: "Debate theater narrative",
    subtitle: "Stage dynamics, question domains, and answer architecture",
    paragraphs: [
      debateProfile.entries
        .map(
          (entry) =>
            `On ${entry.topic.replaceAll("_", " ")}: Hammer will likely argue "${entry.likelyHammerArgument}" Kelly's frame is to ${entry.kellyResponseFrame.toLowerCase()} Practice question already drafted: "${entry.practiceQuestion}"`,
        )
        .join(" "),
      `Arkansas SOS debate history — indexed in the debate archive (${kh3.summary.debateAssets} assets) — shows recurring domains: election confidence, voter access, and business-services operations. The export-ready claim on debate question patterns captures this: "${publicDebateEvidenceBoard.items.find((i) => i.id === "pdeb-003-debate-question-patterns")?.claim ?? "standard SOS debate domains recur."}" Operators should rehearse 30- and 60-second variants already written in the debate profile before adding new language.`,
      `Rebuttal prep emphasizes agreement-then-contrast mechanics. ${kh2.rebuttalPrep.rebuttals.slice(0, 2).map((r) => `On "${r.prompt.slice(0, 60)}…": agree where valid (${r.agreeWhereValid.slice(0, 80)}…), then contrast via ${r.contrastMethod.slice(0, 80)}…`).join(" ")}`,
    ],
    pullQuotes: debateProfile.entries.slice(0, 2).map((entry) => ({
      text: entry.bridgeLine,
      label: entry.topic.replaceAll("_", " "),
    })),
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/debate-prep", label: "Debate prep center" },
      { href: "/admin/intelligence/kim-hammer/debate-profile", label: "Debate profile" },
      { href: "/admin/intelligence/debate-command", label: "Debate command center" },
    ],
    evidenceNote: "INTERPRETATION + sourced debate archive",
  };

  const evidenceGovernanceStory: KimHammerNarrativeSection = {
    id: "evidence-governance",
    title: "Evidence governance story",
    subtitle: "What the archive proves, what it withholds, and why",
    paragraphs: [
      `The unified evidence index merges the public debate board and KH-4 claim graph into ${index.metrics.totalClaims} governed claims. Publication tier distribution tells the story: ${index.metrics.tierDistribution.TIER_1_PUBLIC_DEPLOYABLE} Tier 1 deployable, ${index.metrics.tierDistribution.TIER_2_NEEDS_CORROBORATION} needing corroboration, ${index.metrics.tierDistribution.TIER_4_HIGH_CAUTION} in high caution. This is deliberately conservative — the office of Secretary of State is not a place for speculative opposition research on the record.`,
      exportReady.length > 0
        ? `Export-ready claims today: ${exportReady.map((c) => `"${c.topic ?? c.id}" (${c.claim?.slice(0, 100) ?? c.text?.slice(0, 100)}…)`).join("; ")}. These pass Tier 1 safety, full citation, low legal risk, and human review for external use.`
        : "No claims currently pass the full export filter.",
      blocked.length > 0
        ? `Blocked material stays out of debate packets. Example: "${blocked[0]?.topic ?? blocked[0]?.id}" — ${blocked[0]?.claim?.slice(0, 120) ?? blocked[0]?.text?.slice(0, 120)}… Active safety blockers: ${index.metrics.safetyBlockers.join(", ")}.`
        : "No claims are currently hard-blocked.",
      `${reviewNeeded.length} claims sit in review-needed posture — including partial-citation and medium-risk items that could become deployable if retrieval closes sourcing gaps. The review bottleneck (${index.metrics.reviewStatusCounts.NEEDS_REVIEW} NEEDS_REVIEW) is the operational choke point before any expansion of the export packet.`,
    ],
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/public-debate-evidence", label: "Public debate evidence" },
      { href: "/admin/intelligence/kim-hammer/claims-review", label: "Claims review" },
      { href: "/admin/intelligence/kim-hammer/evidence-command", label: "Evidence command" },
    ],
    evidenceNote: "Governance metrics from publication-safety gate — export count frozen at operator baseline",
  };

  const retrievalMission: KimHammerNarrativeSection = {
    id: "retrieval-mission",
    title: "Retrieval mission narrative",
    subtitle: "The research war that unlocks the next debate chapter",
    paragraphs: [
      `The KH-3B queue exists because ${index.retrievalTasks.length} evidence gaps could materially change claim safety. ${index.metrics.taskStatusCounts.IN_PROGRESS} tasks are in progress; ${index.metrics.taskStatusCounts.NOT_STARTED + index.metrics.taskStatusCounts.ASSIGNED} are not yet complete. The objective written into the queue: "${index.intelligenceGaps.objective ?? "Fill unresolved evidence gaps that materially change external-facing claim safety."}"`,
      highTasks
        .slice(0, 4)
        .map(
          (task, i) =>
            `Mission ${i + 1} (rank #${task.rank ?? "?"}, ${task.taskStatus ?? "NOT_STARTED"}): ${task.description} Owner: ${task.owner ?? "unassigned"}. External readiness: ${task.externalMessageReadiness ?? "NOT_READY"}. Likely source path: ${(task.likelySourcePath ?? []).slice(0, 2).join("; ")}.`,
        )
        .join(" "),
      `Until these missions complete, the campaign lives in a split reality: strong internal pattern knowledge, narrow external export clearance. That is the correct posture for a SOS race where a single unsourced line can become a week of defensive media.`,
    ],
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/intelligence-gaps", label: "Intelligence gaps board" },
      { href: "/admin/intelligence/kim-hammer/research-gaps", label: "Research gaps" },
    ],
    evidenceNote: "KH-3B task board — NEEDS_REVIEW items",
  };

  const riskCounterattackBrief: KimHammerNarrativeSection = {
    id: "risk-counterattack",
    title: "Risk & counterattack brief",
    subtitle: "Where Hammer can flip the script — and how to stay disciplined",
    paragraphs: [
      topRisk
        ? `Highest overall threat index in the KH-4 risk register: ${topRisk.id} at ${pct(topRisk.overallThreatIndex)} (narrative risk ${pct(topRisk.narrativeRiskScore)}, counterattack risk ${pct(topRisk.counterattackRisk)}). Operator note: ${topRisk.notes}`
        : "Risk register populated; review attack-surface panel for row-level detail.",
      kh4.riskRegister.risks
        .filter((r) => r.counterattackRisk >= 0.7)
        .map(
          (r) =>
            `High counterattack risk on ${r.claimId}: ${pct(r.counterattackRisk)} — verify before any surrogate deployment.`,
        )
        .join(" ") || "No counterattack scores above 70% threshold.",
      `Campaign-side risky claims to avoid entirely: ${election.riskClaims.slice(0, 3).join("; ")}. Website and claims-review flags add: ${kh2.dashboardSummary.riskiestClaimsToAvoid.slice(0, 3).join("; ")}.`,
      `${kh4.summary.agentCount} KH-4 read-only agents can suggest retrieval and contradiction scans, but all copilot output remains non-publishable until human review. Use agents to accelerate desk work, not to bypass the safety gate.`,
    ],
    crossLinks: [
      { href: "/admin/intelligence/kim-hammer/attack-surface", label: "Attack surface" },
      { href: "/admin/intelligence/kim-hammer/kh4-agent-tools", label: "KH-4 agent tools" },
    ],
    evidenceNote: "Risk register 0.00–1.00 scale",
  };

  const doNotCrossLines: KimHammerNarrativeSection = {
    id: "do-not-cross",
    title: "Lines we do not cross",
    subtitle: "Publication ethics for a Secretary of State race",
    paragraphs: [
      modernSosContrast.guardrails.join(" "),
      `The export filter requires READY_WITH_CITATION status, Tier 1 deployability, cited sources, low legal risk, and APPROVED_FOR_EXTERNAL_USE or EXPORTED review status. Anything else is internal research — including AI suggestions, interpretation-tier pattern lanes, and partial-citation management-readiness material.`,
      `When in doubt, use the safer wording from the vulnerability matrix rather than the raw weakness label. Debate wins come from calm competence and sourced contrast, not from unsourced motive attribution.`,
    ],
    evidenceNote: "Publication-safety rules + modern SOS guardrails",
  };

  return {
    generatedAt: new Date().toISOString(),
    sections: [
      morningBrief,
      opponentPosture,
      legislativePatternArc,
      contrastDoctrine,
      debateTheater,
      evidenceGovernanceStory,
      retrievalMission,
      riskCounterattackBrief,
      doNotCrossLines,
      ...frameBriefs,
      ...responseScenarios,
    ],
  };
}

function likelyArgumentsPull(
  args: Array<{ argument: string; evidenceHeMayCite: string[] }>,
): Array<{ text: string; label?: string }> {
  return args.map((a) => ({
    text: a.argument,
    label: a.evidenceHeMayCite[0]?.slice(0, 40),
  }));
}
