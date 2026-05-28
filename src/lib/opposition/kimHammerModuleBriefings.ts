import { loadKimHammerEvidenceIndex, resolveRetrievalTaskStatus } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerUnifiedAuditTimeline } from "@/lib/opposition/kimHammerAuditBrowser";
import { summarizeKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { summarizeKimHammerExportControl } from "@/lib/opposition/kimHammerExportControl";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";
import { loadGeographicNarrativeIndex } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { computeNarrativeUsageAnalytics } from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";
import { summarizeKimHammerSuggestionSandbox } from "@/lib/opposition/kimHammerSuggestionSandbox";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";
import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { loadKimHammerWorkbench, type HammerBillRow } from "@/lib/opposition/kimHammerWorkbench";
import {
  loadKimHammerCountyAdministrationBurden,
  loadKimHammerIntegrityFoundation2021,
  loadKimHammerLegislativeChronology,
  resolveKimHammerBillNarrative,
  toBriefingStrategicSections,
  normalizeStrategicBriefing,
} from "@/lib/opposition/kimHammerLegislativeNarratives";
import {
  getKimHammerDomainForModule,
  getKimHammerModuleHref,
  KIM_HAMMER_BRIEFING_DOMAINS,
  KIM_HAMMER_COMMAND_CENTER_HREF,
} from "@/lib/opposition/kimHammerBriefingRegistry";
import type {
  KimHammerBriefingHub,
  KimHammerBriefingLink,
  KimHammerModuleBriefing,
} from "@/lib/opposition/kimHammerBriefingTypes";

type BriefingDraft = Omit<KimHammerModuleBriefing, "id" | "domainId" | "layer" | "href"> & { id: string };

function link(href: string, label: string, description?: string): KimHammerBriefingLink {
  return { href, label, description };
}

function finalize(draft: BriefingDraft): KimHammerModuleBriefing {
  const domain = getKimHammerDomainForModule(draft.id);
  return {
    ...draft,
    domainId: domain?.id ?? "domain-root",
    layer: domain?.layer ?? "ROOT",
    href: getKimHammerModuleHref(draft.id),
    parentHref: KIM_HAMMER_COMMAND_CENTER_HREF,
    parentTitle: "Kim Hammer Command Center",
  };
}

function exportReadyClaimsParagraph(index: ReturnType<typeof loadKimHammerEvidenceIndex>): string {
  const ready = index.exportReadyClaims;
  if (ready.length === 0) return "No claims currently pass export filter.";
  return `Export-ready IDs: ${ready.map((c) => `${c.id} (${c.topic ?? "claim"})`).join("; ")}.`;
}

function buildAllModuleBriefings(): Record<string, KimHammerModuleBriefing> {
  const election = loadKimHammerWorkbench();
  const profile = loadKimHammerProfileWorkbench();
  const kh2 = loadKimHammerKh2Workbench();
  const kh3 = loadKimHammerKh3Workbench();
  const kh4 = loadKimHammerKh4Workbench();
  const index = loadKimHammerEvidenceIndex();
  const foundation2021 = loadKimHammerIntegrityFoundation2021();
  const countyBurden = loadKimHammerCountyAdministrationBurden();
  const chronology = loadKimHammerLegislativeChronology();
  const auditTimeline = loadKimHammerUnifiedAuditTimeline();
  const citationSummary = summarizeKimHammerCitationLocker();
  const suggestionSummary = summarizeKimHammerSuggestionSandbox();
  const exportSummary = summarizeKimHammerExportControl();
  const narrativeStateIndex = loadKimHammerNarrativeStateIndex();
  const geographicIndex = loadGeographicNarrativeIndex();
  const countyBriefingIndex = loadCountyBriefingIntelligenceIndex();
  const usageAnalyticsIndex = computeNarrativeUsageAnalytics();

  const topRisk = [...kh4.riskRegister.risks].sort(
    (a, b) => b.overallThreatIndex - a.overallThreatIndex,
  )[0];

  const drafts: BriefingDraft[] = [
    {
      id: "narrative-state",
      eyebrow: "NSI-1 · Composition intelligence",
      title: "Narrative State Intelligence",
      paragraphs: [
        `${narrativeStateIndex.narrativeCount} governed narratives tracked — ${narrativeStateIndex.bandCounts.STRONG} strong, ${narrativeStateIndex.bandCounts.MODERATE} moderate, ${narrativeStateIndex.bandCounts.WEAK} weak, ${narrativeStateIndex.bandCounts.BLOCKED} blocked.`,
        "Read-only synthesis across claims, citations, retrieval tasks, export usage, and AI suggestion pressure. No mutations on this surface.",
        "Use before county messaging, debate prep expansion, or narrative promotion — answers whether a frame is operationally safe, not merely whether sources exist.",
      ],
      operatorTakeaway: "Narratives are living governed entities with dependency-aware readiness scores.",
      drillDownLinks: [
        link("#detail", "State dashboard"),
        link(getKimHammerModuleHref("citation-locker"), "Citation locker"),
        link(getKimHammerModuleHref("export-control-center"), "Export control"),
        link(getKimHammerModuleHref("ai-suggestion-sandbox"), "AI sandbox"),
      ],
      evidenceNote: "kim-hammer-narrative-registry.json + runtime composition",
    },
    {
      id: "geographic-narrative-intelligence",
      eyebrow: "NSI-2 · Geographic composition",
      title: "Geographic Narrative Intelligence",
      paragraphs: [
        `${geographicIndex.countyCount} county overlays tracking ${geographicIndex.narrativeCellCount} narrative cells — ${geographicIndex.signalCounts.COUNTY_STRONG} strong, ${geographicIndex.signalCounts.COUNTY_BLOCKED} blocked, ${geographicIndex.signalCounts.COUNTY_UNDERDEVELOPED} underdeveloped.`,
        "Read-only county-aware overlays compose NSI-1 narrative state with KH-0B burden signals, export scopes, and local media/debate relevance. No autonomous targeting or mutation.",
        "Answers where narratives are strongest, weakest, overexposed, or unsupported geographically — for county strategy, debate prep, and resource prioritization.",
      ],
      operatorTakeaway: "Narrative readiness is now geographically aware — county exposure and local dependency gaps surface before local deployment.",
      drillDownLinks: [
        link("#detail", "County overlay dashboard"),
        link(getKimHammerModuleHref("narrative-state"), "Narrative state"),
        link(getKimHammerModuleHref("county-administration-burden"), "County burden"),
        link(getKimHammerModuleHref("export-control-center"), "Export control"),
      ],
      evidenceNote: "kim-hammer-geographic-narrative-overlays.json + NSI-1 composition",
    },
    {
      id: "county-briefings",
      eyebrow: "NSI-5 · County briefing intelligence",
      title: "County Briefing Intelligence",
      paragraphs: [
        `${countyBriefingIndex.countyCount} county/regional briefings composing NSI-2 geographic overlays, NSI-4 bill civic intelligence, SDI-1 doctrine alignment, export history, and citation health.`,
        "Answers how to message locally, which opponent bills matter, what volunteers should say, and what research remains — aggregate read-only intelligence only.",
        "No voter-level scoring, no autonomous targeting, no auto-messaging.",
      ],
      operatorTakeaway: "County strategy is now doctrine-aware and evidence-governed — local deployment decisions route through county briefing intelligence before field use.",
      drillDownLinks: [
        link(getKimHammerModuleHref("county-briefings"), "County briefing index"),
        link(getKimHammerModuleHref("geographic-narrative-intelligence"), "Geographic narrative"),
        link(getKimHammerModuleHref("evidence-command"), "Evidence Command"),
        link("/admin/intelligence/campaign-intelligence-graph", "Intelligence graph"),
      ],
      evidenceNote: "countyBriefingIntelligence.ts + NSI-2/NSI-4/SDI-1 composition",
    },
    {
      id: "narrative-usage-analytics",
      eyebrow: "NSI-3 · Deployment intelligence",
      title: "Narrative Usage Analytics & Export Fatigue",
      paragraphs: [
        `${usageAnalyticsIndex.narrativeCount} narratives tracked across ${usageAnalyticsIndex.totalDeployments} export event(s) — ${usageAnalyticsIndex.signalCounts.USAGE_FRAGILE} fragile, ${usageAnalyticsIndex.signalCounts.USAGE_UNDERUTILIZED} underutilized, ${usageAnalyticsIndex.signalCounts.USAGE_STALE + usageAnalyticsIndex.signalCounts.USAGE_OVEREXPOSED} saturation/stale signals.`,
        "Read-only deployment history, citation freshness, county heat, and export lineage composition. Campaign intelligence source map and synchronization plan document cross-system readiness.",
        "Answers how heavily narratives have been used, where evidence freshness is weakening, and which strong frames remain under-deployed — without autonomous targeting or export mutation.",
      ],
      operatorTakeaway: "Narrative deployment is now auditable operational memory — fatigue signals surface before reuse degrades strategic viability.",
      drillDownLinks: [
        link("#detail", "Usage dashboard"),
        link(getKimHammerModuleHref("export-control-center"), "Export control"),
        link(getKimHammerModuleHref("geographic-narrative-intelligence"), "Geographic narrative"),
        link(getKimHammerModuleHref("narrative-state"), "Narrative state"),
      ],
      evidenceNote: "export history + NSI-1/NSI-2 composition + docs/intelligence/*",
    },
    {
      id: "export-control-center",
      eyebrow: "V3-E · Publication traceability",
      title: "Export Control Center",
      paragraphs: [
        `${exportSummary.totalExports} governed export event(s) on record. Latest: v${exportSummary.latestPacketVersion ?? "none"} at ${exportSummary.latestExportAt ?? "never"}.`,
        `${exportSummary.exportReadyClaimCount} claim(s) currently export-ready. Each recorded export captures claim → citation → narrative lineage and content checksum.`,
        "Download packets from debate packet export, then record the event here for external-output traceability and narrative usage feedback.",
      ],
      operatorTakeaway: "Exports are governed outputs — history is operational memory, not just download logs.",
      drillDownLinks: [
        link("#detail", "Export history & lineage"),
        link(getKimHammerModuleHref("debate-packet-export"), "Debate packet download"),
        link(getKimHammerModuleHref("citation-locker"), "Citation locker"),
        link(getKimHammerModuleHref("audit-log"), "Audit log"),
      ],
      evidenceNote: "kim-hammer-export-history.json",
    },
    {
      id: "ai-suggestion-sandbox",
      eyebrow: "V3-D · Sandboxed AI orchestration",
      title: "AI Suggestion Sandbox",
      paragraphs: [
        `${suggestionSummary.totalSuggestions} sandbox suggestions (${suggestionSummary.pendingCount} pending disposition). All outputs are NON_PUBLISHABLE until operator review.`,
        "Suggestions route to governed systems — retrieval tasks, citation locker, claim review, narrative modules — without autonomous publish, export, or review mutation.",
        "Accepting a suggestion records operator intent only; humans execute work in V2-A/V3-A/V3-C workflows.",
      ],
      operatorTakeaway: "AI is analyst and prioritizer — never publisher or claim authority.",
      drillDownLinks: [
        link("#detail", "Suggestion browser"),
        link(getKimHammerModuleHref("kh4-agent-tools"), "KH-4 agent registry"),
        link(getKimHammerModuleHref("citation-locker"), "Citation locker"),
        link(getKimHammerModuleHref("audit-log"), "Audit log"),
      ],
      evidenceNote: "kim-hammer-ai-suggestion-sandbox.json",
    },
    {
      id: "citation-locker",
      eyebrow: "V3-C · Durable evidence primitives",
      title: "Citation Locker + Source Health",
      paragraphs: [
        `${citationSummary.totalCitations} citation cards, ${citationSummary.totalClaimLinks} claim links, ${citationSummary.totalSources} registered sources.`,
        `Source health — healthy: ${citationSummary.sourceHealthCounts.HEALTHY}, needs revalidation: ${citationSummary.sourceHealthCounts.NEEDS_REVALIDATION}, archive missing: ${citationSummary.sourceHealthCounts.ARCHIVE_MISSING}, stale: ${citationSummary.sourceHealthCounts.STALE}.`,
        "Promote retrieval output into reusable citation cards before claim or narrative promotion. Every mutation creates backup + audit entry (V3-C).",
      ],
      operatorTakeaway: "Evidence quality is governable — stale citations block narrative confidence.",
      drillDownLinks: [
        link("#detail", "Citation browser"),
        link(getKimHammerModuleHref("intelligence-gaps"), "Retrieval tasks"),
        link(getKimHammerModuleHref("audit-log"), "Audit log"),
        link(getKimHammerModuleHref("legislative-chronology"), "KH-0B chronology"),
      ],
      evidenceNote: "kim-hammer-citation-locker.json",
    },
    {
      id: "audit-log",
      eyebrow: "V3-B · Governance visibility",
      title: "Audit Log Browser",
      paragraphs: [
        `Operational memory for live workflows: ${auditTimeline.totalEntries} total events (${auditTimeline.claimReviewCount} claim review, ${auditTimeline.retrievalTaskCount} retrieval task, ${auditTimeline.citationMutationCount} citation mutation, ${auditTimeline.aiSuggestionCount} AI suggestion, ${auditTimeline.exportEventCount} export).`,
        "Every governed mutation across V2-A through V3-E creates a backup + append-only audit entry before JSON write-back.",
        "Use this page before adding AI suggestions — operators need visibility into who changed what, when, and from which route.",
      ],
      operatorTakeaway: "Governance visibility is prerequisite to safe automation.",
      drillDownLinks: [
        link("#detail", "Timeline browser"),
        link(getKimHammerModuleHref("evidence-command"), "Evidence Command"),
        link(getKimHammerModuleHref("intelligence-gaps"), "Retrieval tasks"),
      ],
      evidenceNote: "Claim + task audit JSON logs",
    },
    {
      id: "evidence-command",
      eyebrow: "KH-4 · Operator command",
      title: "Evidence Command Center",
      paragraphs: [
        `Single operational home for Kim Hammer evidence governance. Unified index: ${index.metrics.totalClaims} claims, ${index.metrics.exportReadyClaims} export-ready, ${index.metrics.blockedClaims} blocked, ${index.metrics.reviewNeededClaims} review-needed, ${index.retrievalTasks.length} retrieval tasks.`,
        `Safety blockers: ${index.metrics.safetyBlockers.join(", ") || "none"}. Tier mix — T1: ${index.metrics.tierDistribution.TIER_1_PUBLIC_DEPLOYABLE}, T2: ${index.metrics.tierDistribution.TIER_2_NEEDS_CORROBORATION}, T4: ${index.metrics.tierDistribution.TIER_4_HIGH_CAUTION}.`,
        `Start every session here: confirm export count, scan NEEDS_REVIEW (${index.metrics.reviewStatusCounts.NEEDS_REVIEW}), then route to retrieval or export.`,
      ],
      operatorTakeaway: "System state in 60 seconds; export spine only for external use.",
      drillDownLinks: [
        link("#detail", "Metrics & filters"),
        link(getKimHammerModuleHref("public-debate-evidence"), "Debate evidence"),
        link(getKimHammerModuleHref("intelligence-gaps"), "Retrieval queue"),
      ],
      evidenceNote: "Unified index + publication-safety gate",
    },
    {
      id: "public-debate-evidence",
      eyebrow: "KH-4 · Debate evidence board",
      title: "Public Debate Evidence Board",
      paragraphs: [
        `${index.publicDebateEvidenceBoard.purpose} ${index.publicDebateEvidenceBoard.items.length} governed claims with tier, citation, legal risk, and review fields.`,
        ...index.publicDebateEvidenceBoard.items.map(
          (item) =>
            `${item.topic}: "${item.claim}" — ${item.externalUseStatus}, ${item.confidenceTier}, review ${item.reviewStatus ?? "unset"}.`,
        ),
      ],
      operatorTakeaway: "Claims are governed objects until review clears export.",
      drillDownLinks: [link("#detail", "Claim records"), link(getKimHammerModuleHref("debate-packet-export"), "Export")],
      evidenceNote: "Debate board JSON",
    },
    {
      id: "debate-packet-export",
      eyebrow: "KH-4 · Comms output",
      title: "Debate Packet Export",
      paragraphs: [
        `Filters to Tier 1, cited, low-risk, externally approved claims. Export-ready: ${index.metrics.exportReadyClaims}. JSON/Markdown API + admin download/copy.`,
        exportReadyClaimsParagraph(index),
      ],
      operatorTakeaway: "Treat every download as a publication event.",
      drillDownLinks: [link("#detail", "Export actions")],
      evidenceNote: "kimHammerPublicationSafety gate",
    },
    {
      id: "kh4-agent-tools",
      eyebrow: "KH-4 · Copilot registry",
      title: "KH-4 Agent Tools",
      paragraphs: [
        `${kh4.agentTools.agents.length} read-only agents: ${kh4.agentTools.agents.map((a) => a.name).join("; ")}.`,
        `Suggestion-only — no auto-publish. Guardrails: ${kh4.agentTools.guardrails.join(" ")}`,
      ],
      drillDownLinks: [link("#detail", "Registry")],
      evidenceNote: "Non-publishable until reviewed",
    },
    {
      id: "attack-surface",
      eyebrow: "KH-4 · Risk",
      title: "Attack Surface",
      paragraphs: [
        `${kh4.riskRegister.risks.length} risk rows. Top threat: ${topRisk?.claimId ?? "n/a"} at ${Math.round((topRisk?.overallThreatIndex ?? 0) * 100)}%.`,
        kh4.riskRegister.risks
          .map((r) => `${r.claimId}: counterattack ${Math.round(r.counterattackRisk * 100)}% — ${r.notes}`)
          .join(" "),
      ],
      drillDownLinks: [link("#detail", "Risk table")],
      evidenceNote: "Risk register 0–1",
    },
    {
      id: "intel-heat-map",
      eyebrow: "KH-4 · Density",
      title: "Intel Heat Map",
      paragraphs: [
        `Claim graph: ${kh4.claimGraph.claims.length} nodes. ${kh4.summary.retrievalSuggestions} retrieval suggestions, ${kh4.summary.contradictionFlags} contradiction flags.`,
        "Shows thick vs thin research areas before debate prep.",
      ],
      drillDownLinks: [link("#detail", "Heat map")],
      evidenceNote: "Scaffold density view",
    },
    {
      id: "narrative-drift-monitor",
      eyebrow: "KH-4 · Drift",
      title: "Narrative Drift Monitor",
      paragraphs: [
        `Tracks message drift and contradiction candidates. Media archive: ${kh3.summary.mediaArchiveEntries} entries. Contradiction flags: ${kh4.summary.contradictionFlags}.`,
        "Candidates require verification before any external use.",
      ],
      drillDownLinks: [link("#detail", "Drift panel")],
      evidenceNote: "Verify before publish",
    },
    {
      id: "intelligence-gaps",
      eyebrow: "KH-3B · Task board",
      title: "Intelligence Gaps",
      paragraphs: [
        `${index.intelligenceGaps.objective} ${index.retrievalTasks.length} ranked tasks.`,
        ...index.retrievalTasks.slice(0, 4).map(
          (t) =>
            `#${t.rank ?? "?"} [${resolveRetrievalTaskStatus(t)}]: ${t.description.slice(0, 140)}… Owner: ${t.owner ?? "—"}.`,
        ),
      ],
      operatorTakeaway: "Execute HIGH ranks before expanding export set.",
      drillDownLinks: [link("#detail", "Task table")],
      evidenceNote: "KH-3B JSON queue",
    },
    {
      id: "research-gaps",
      eyebrow: "KH-2 · Gaps",
      title: "Research Gaps",
      paragraphs: [
        `${kh2.intelligenceGaps.gaps.length} KH-2 gaps; ${kh2.intelligenceGaps.gaps.filter((g) => g.priority === "HIGH").length} HIGH priority.`,
        "Legacy list — KH-3B intelligence-gaps is operational queue of record.",
      ],
      drillDownLinks: [link("#detail", "Gap list"), link(getKimHammerModuleHref("intelligence-gaps"), "KH-3B")],
      evidenceNote: "KH-2 gaps file",
    },
    {
      id: "writings",
      eyebrow: "KH-3 · Writings",
      title: "Authored Writings Archive",
      paragraphs: [
        `${kh3.authoredWritings.items.length} items indexed. Gaps: ${kh3.authoredWritings.openGaps.join("; ")}`,
        "Longitudinal writing reveals consistency or drift — pre-legislative archive incomplete (KH-3B rank #1).",
      ],
      drillDownLinks: [link("#detail", "Inventory")],
      evidenceNote: "Mixed evidence status",
    },
    {
      id: "background-deep",
      eyebrow: "KH-3 · Background",
      title: "Background Deep Dive",
      paragraphs: [
        `Education, ${kh3.deepProfile.communityAndCivicWork.length} civic rows, ${kh3.deepProfile.businessBackground.length} business items.`,
        "Qualification context only — no unsourced personal attacks.",
      ],
      drillDownLinks: [link("#detail", "Sections"), link(getKimHammerModuleHref("profile"), "Profile")],
      evidenceNote: "Per-row evidence status",
    },
    {
      id: "management-capacity",
      eyebrow: "KH-3 · Readiness",
      title: "Management Capacity",
      paragraphs: [
        `${kh3.managementCapacity.capacitySignals.length} signals; ${kh3.managementCapacity.questionsForFurtherValidation.length} open validation questions for ${kh3.managementCapacity.targetRole}.`,
        "Central qualification fault line — pdeb-002 Tier 2 partial citation.",
      ],
      operatorTakeaway: "Press agency-scale outcomes, not titles alone.",
      drillDownLinks: [link("#detail", "Signals"), link(getKimHammerModuleHref("response-model"), "Scenarios")],
      evidenceNote: "PARTIAL export posture",
    },
    {
      id: "debate-archive",
      eyebrow: "KH-3 · Archive",
      title: "Debate Archive",
      paragraphs: [
        `${kh3.summary.debateAssets} debate/forum assets. Gaps: ${kh3.debateArchive.openGaps.slice(0, 2).join("; ")}`,
        "SOS reference archive informs question domains; opponent lines need direct Hammer quotes.",
      ],
      drillDownLinks: [link("#detail", "Archive"), link(getKimHammerModuleHref("debate-profile"), "Profile")],
      evidenceNote: "Source confidence per asset",
    },
    {
      id: "response-model",
      eyebrow: "KH-3 · Response",
      title: "Response Model",
      paragraphs: kh3.responseModel.scenarios.map(
        (s) =>
          `${s.theme}: Expect "${s.expectedHammerResponse}" Kelly: ${s.kellyResponsePath} Bridge: "${s.bridgeLine}"`,
      ),
      drillDownLinks: [link("#detail", "Scenarios"), link(getKimHammerModuleHref("rebuttal-prep"), "Rebuttal")],
      evidenceNote: kh3.responseModel.evidenceStatus,
    },
    {
      id: "kh3-operational",
      eyebrow: "KH-3 · Ops",
      title: "KH-3 Operational Layer",
      paragraphs: [
        `Network ${kh3.summary.networkClusters}, patterns ${kh3.summary.legislationPatterns}, vulnerabilities ${kh3.summary.vulnerabilityRows}, rapid response ${kh3.summary.rapidResponseAssets}.`,
        "Orientation hub linking pattern, county, and contrast modules.",
      ],
      drillDownLinks: [link(getKimHammerModuleHref("pattern-analysis"), "Patterns")],
      evidenceNote: "KH-3 composite",
    },
    {
      id: "network-influence",
      eyebrow: "KH-3 · Network",
      title: "Network & Influence",
      paragraphs: [
        `${kh3.networkInfluence.clusters.length} clusters. Gaps: ${kh3.networkInfluence.openGaps.slice(0, 2).join("; ")}`,
        "Document relationships — unverified affiliation claims carry high counterattack risk.",
      ],
      drillDownLinks: [link("#detail", "Clusters")],
      evidenceNote: "Verify affiliations",
    },
    {
      id: "pattern-analysis",
      eyebrow: "KH-3 · Patterns",
      title: "Legislation Pattern Analysis",
      paragraphs: [
        ...kh3.legislationPatterns.patternLanes.map((l) => `${l.label}: ${l.description}`),
        kh3.legislationPatterns.narrativeUseGuidance.join(" "),
      ],
      operatorTakeaway: "Decade direction story, not single-bill trivia.",
      drillDownLinks: [link("#detail", "Lanes"), link(getKimHammerModuleHref("bill-relationship-graph"), "Graph")],
      evidenceNote: "INTERPRETATION lanes",
    },
    {
      id: "vulnerability-matrix-kh3",
      eyebrow: "KH-3 · Vulnerabilities",
      title: "Vulnerability Matrix",
      paragraphs: [
        `${kh3.kh3Vulnerabilities.matrix.length} scored rows with safer wording.`,
        "Use safer wording column for any external deployment.",
      ],
      drillDownLinks: [link("#detail", "Matrix")],
      evidenceNote: "Debate-safe wording",
    },
    {
      id: "narrative-testing",
      eyebrow: "KH-3 · Frames",
      title: "Narrative Testing",
      paragraphs: kh3.narrativeTesting.frames.map(
        (f) =>
          `"${f.label}": rebuttal "${f.likelyRebuttal}" → counter "${f.defensiveCounter}"`,
      ),
      drillDownLinks: [link("#detail", "Frames")],
      evidenceNote: "Internal testing only",
    },
    {
      id: "county-exposure",
      eyebrow: "KH-3 · Counties",
      title: "County Exposure",
      paragraphs: [
        `${kh3.countyExposureMap.countyExposure.length} segments. ${kh3.countyExposureMap.note}`,
        `Still needed: ${kh3.countyExposureMap.requiredDataToComplete.slice(0, 2).join("; ")}`,
      ],
      drillDownLinks: [link("#detail", "Segments")],
      evidenceNote: "Hypotheses until sourced",
    },
    {
      id: "modern-sos-contrast",
      eyebrow: "KH-3 · Contrast",
      title: "Modern SOS Contrast",
      paragraphs: [
        ...kh3.modernSosContrast.contrastRows.map((r) => `"${r.hammerLane}" vs "${r.kellyLane}" (${r.useCase.join(", ")})`),
        kh3.modernSosContrast.guardrails.join(" "),
      ],
      drillDownLinks: [link("#detail", "Rows")],
      evidenceNote: "Policy-anchored contrast",
    },
    {
      id: "rapid-response",
      eyebrow: "KH-3 · Rapid response",
      title: "Rapid Response Appendix",
      paragraphs: [
        `${kh3.rapidResponseAppendix.evidenceLocker.length} locker assets.`,
        kh3.rapidResponseAppendix.quoteVerificationRules.join(" "),
      ],
      drillDownLinks: [link("#detail", "Locker")],
      evidenceNote: "Verified quotes only",
    },
    {
      id: "bill-relationship-graph",
      eyebrow: "KH-3 · Graph",
      title: "Bill Relationship Graph",
      paragraphs: [
        `${kh3.billRelationshipGraph.nodes.length} nodes, ${kh3.billRelationshipGraph.edges.length} edges.`,
        "Shows bill clusters for pattern-level debate answers.",
      ],
      drillDownLinks: [link("#detail", "Graph")],
      evidenceNote: "Graph JSON",
    },
    {
      id: "timeline-heatmap",
      eyebrow: "KH-3 · Heatmap",
      title: "Timeline Heatmap",
      paragraphs: kh3.timelineHeatmap.periods.map((p) => `${p.window} (${p.activityLevel}): ${p.notes}`),
      drillDownLinks: [link("#detail", "Periods")],
      evidenceNote: "Activity INTERPRETATION",
    },
    {
      id: "direct-democracy",
      eyebrow: "KH-3 · Initiatives",
      title: "Direct Democracy File",
      paragraphs: [
        kh3.directDemocracyFile.summary,
        ...kh3.directDemocracyFile.lanes.map((l) => `${l.lane}: ${l.status}`),
      ],
      drillDownLinks: [link("#detail", "Lanes")],
      evidenceNote: "Initiative pattern file",
    },
    {
      id: "message-analysis",
      eyebrow: "KH-2 · Message",
      title: "Message Analysis",
      paragraphs: [
        `Frame: ${kh2.messageAnalysis.candidateFrame.primary} / ${kh2.messageAnalysis.candidateFrame.secondary}`,
        `Themes: ${kh2.messageAnalysis.messageThemes.map((t) => t.theme).join("; ")}`,
      ],
      drillDownLinks: [link("#detail", "Analysis"), link(getKimHammerModuleHref("website"), "Website")],
      evidenceNote: kh2.messageAnalysis.candidateFrame.evidenceStatus,
    },
    {
      id: "strengths-weaknesses",
      eyebrow: "KH-2 · SWOT",
      title: "Strengths & Weaknesses",
      paragraphs: [
        `Strengths: ${kh2.strengths.strengths.slice(0, 2).map((s) => s.strength).join("; ")}`,
        `Use safer wording for weaknesses externally.`,
      ],
      drillDownLinks: [link("#detail", "Matrices")],
      evidenceNote: "Safer wording required",
    },
    {
      id: "contrast-vs-kelly",
      eyebrow: "KH-2 · Contrast",
      title: "Contrast vs Kelly",
      paragraphs: kh2.contrast.contrastFrames.map(
        (r) => `${r.frame}: "${r.kellyContrast}" vs "${r.hammerPositionSummary}"`,
      ),
      drillDownLinks: [link("#detail", "Frames")],
      evidenceNote: "INTERPRETATION",
    },
    {
      id: "debate-profile",
      eyebrow: "KH-2 · Debate",
      title: "Debate Profile",
      paragraphs: kh2.debateProfile.entries.map(
        (e) => `${e.topic}: "${e.practiceQuestion}" — ${e.kellyResponseFrame}`,
      ),
      drillDownLinks: [link("#detail", "Entries"), link(getKimHammerModuleHref("debate-prep"), "Prep")],
      evidenceNote: "30s/60s scripts in detail",
    },
    {
      id: "debate-prep",
      eyebrow: "KH-2 · Prep",
      title: "Debate Prep",
      paragraphs: [
        `Priority drills: ${kh2.dashboardSummary.debatePrepPriority.join("; ")}`,
        "Tie external language to export-ready claims only.",
      ],
      drillDownLinks: [link("/admin/intelligence/debate-command", "Debate command")],
      evidenceNote: "Prep scaffolds",
    },
    {
      id: "rebuttal-prep",
      eyebrow: "KH-2 · Rebuttal",
      title: "Rebuttal Prep",
      paragraphs: [
        `${kh2.rebuttalPrep.rebuttals.length} agree → contrast → bridge structures.`,
      ],
      drillDownLinks: [link("#detail", "Cards")],
      evidenceNote: "INTERPRETATION",
    },
    {
      id: "claims-review",
      eyebrow: "KH-2 · QA",
      title: "Claims Review",
      paragraphs: [
        `${kh2.publicClaims.claims.length} public claims; ${election.claimBuckets.needsResearch.length} need research.`,
        `Risk lines flagged: ${election.riskClaims.slice(0, 2).join("; ")}`,
      ],
      drillDownLinks: [link("#detail", "Tables")],
      evidenceNote: "Mixed tiers",
    },
    {
      id: "website",
      eyebrow: "KH-2 · Website",
      title: "Website Intelligence",
      paragraphs: [
        `${kh2.dashboardSummary.websitePagesCaptured} pages. Frame: "${kh2.websiteMessageIndex.campaignFrameSummary.label}".`,
        `Repeated: ${kh2.websiteMessageIndex.repeatedPhrases.slice(0, 3).map((p) => p.phrase).join(", ")}`,
      ],
      drillDownLinks: [link("#detail", "Corpus")],
      evidenceNote: "Captured site corpus",
    },
    {
      id: "profile",
      eyebrow: "KH-1 · Profile",
      title: "Public Profile",
      paragraphs: [profile.profileHighlights.join(" ")],
      drillDownLinks: [link("#detail", "Bio"), link(getKimHammerModuleHref("background-deep"), "Deep dive")],
      evidenceNote: "KH-1 profile",
    },
    {
      id: "electoral-history",
      eyebrow: "KH-1 · Electoral",
      title: "Electoral History",
      paragraphs: [
        `Open gaps: ${profile.electoralHistory.openGaps.slice(0, 3).join("; ") || "see detail"}`,
      ],
      drillDownLinks: [link("#detail", "Results")],
      evidenceNote: "Public results",
    },
    {
      id: "media-footprint",
      eyebrow: "KH-1 · Media",
      title: "Media Footprint",
      paragraphs: [
        `Gaps: ${profile.mediaFootprint.openGaps.slice(0, 2).join("; ") || "see detail"}`,
      ],
      drillDownLinks: [link("#detail", "Archive")],
      evidenceNote: "Media index",
    },
    {
      id: "public-timeline",
      eyebrow: "KH-1 · Timeline",
      title: "Public Timeline",
      paragraphs: [
        "Chronological public record for verification and drift detection.",
        "Cross-link timeline heatmap for legislative intensity.",
      ],
      drillDownLinks: [link("#detail", "Events")],
      evidenceNote: "Chronology",
    },
    {
      id: "public-controversies",
      eyebrow: "KH-1 · Controversies",
      title: "Public Controversies",
      paragraphs: [
        "Sourced controversy log only — high counterattack risk if extrapolated.",
      ],
      drillDownLinks: [link("#detail", "Log")],
      evidenceNote: "Source required",
    },
    {
      id: "integrity-foundation-2021",
      eyebrow: "KH-0B · 2021 foundation",
      title: "2021 Integrity Foundation Package",
      paragraphs: [
        foundation2021.plainEnglishSummary,
        ...foundation2021.narrativeArc.slice(0, 4),
      ],
      narrativeArc: foundation2021.narrativeArc,
      operatorTakeaway:
        "Use this package to fix chronology bias — Hammer's architecture did not start in 2025.",
      strategicBriefing: toBriefingStrategicSections(foundation2021.strategicBriefing),
      governanceStatus: "INTERPRETATION",
      drillDownLinks: [
        link("#detail", "Package dossier"),
        link(getKimHammerModuleHref("county-administration-burden"), "County burden"),
        link(getKimHammerModuleHref("legislative-chronology"), "Full chronology"),
      ],
      evidenceNote: "Acts 727–729, 973–974, 1051 — VERIFIED_FACT on Arkleg",
    },
    {
      id: "county-administration-burden",
      eyebrow: "KH-0B · County doctrine",
      title: "County Administration Burden Layer",
      paragraphs: [
        countyBurden.plainEnglishSummary ??
          "County clerk / quorum court burden contrast layer for modern SOS doctrine.",
        `Burden themes tracked: ${countyBurden.burdenThemes.length}. SOS vs county vs quorum court authority split.`,
      ],
      operatorTakeaway:
        "Elite contrast lane: support clerks, fund implementation, avoid election-denial framing.",
      strategicBriefing: toBriefingStrategicSections(countyBurden.strategicBriefing),
      governanceStatus: "INTERPRETATION",
      drillDownLinks: [
        link("#detail", "Burden themes"),
        link(getKimHammerModuleHref("integrity-foundation-2021"), "2021 foundation"),
        link(getKimHammerModuleHref("county-exposure"), "County exposure map"),
      ],
      evidenceNote: "Actor roles VERIFIED_FACT; burden frames INTERPRETATION",
    },
    {
      id: "legislative-chronology",
      eyebrow: "KH-0B · Tenure arc",
      title: "Legislative Chronology & Authorship",
      paragraphs: [
        chronology.arcHeadline,
        ...chronology.arcParagraphs,
        ...chronology.years.map(
          (year) =>
            `${year.year} (${year.office}): ${year.primarySponsorCount} primary / ${year.coSponsorCount} co-sponsored; ${year.electionRelatedSponsorCount} election-related — ${year.narrativeSummary}`,
        ),
      ],
      narrativeArc: chronology.arcParagraphs,
      operatorTakeaway: chronology.tenureNote,
      strategicBriefing: toBriefingStrategicSections(
        normalizeStrategicBriefing({
          howToMessage: [
            chronology.arcHeadline,
            "Never let Hammer's record sound like it began in 2025 — anchor every petition-process question in 2021 county/enforcement architecture.",
          ],
          debateImpact: chronology.arcParagraphs,
          whenToUse: [
            "When opponent compresses history into a single-session integrity slogan.",
            "Editorial boards and county forums where tenure and evolution matter.",
          ],
          whenNotToUse: ["Before verifying a specific bill's enrolled text for a legal claim."],
          oppositionSetup: [
            "Invite Hammer to explain continuity: 2021 foundation → 2023 enforcement → 2025 petitions.",
          ],
          kellyMessageHelp: [
            "Kelly as SOS implements what legislators mandate — contrast unfunded mandates with modernization support.",
          ],
          campaignAlignment: chronology.governanceNotes.join(" "),
        }),
      ),
      governanceStatus: "INTERPRETATION",
      drillDownLinks: [
        link("#detail", "Year-by-year"),
        link(getKimHammerModuleHref("integrity-foundation-2021"), "2021 package"),
        link(getKimHammerModuleHref("timeline"), "Election timeline"),
      ],
      evidenceNote: "Arkleg dryrun authorship metadata",
    },
    {
      id: "themes",
      eyebrow: "KH-0 · Themes",
      title: "Theme Matrix",
      paragraphs: [
        `${election.highConfidenceThemes.length} high-confidence themes; ${election.totalBills} bills indexed (KH-0B adds 2021 foundation + 2023 co-sponsor gaps).`,
        `Arc: ${chronology.arcHeadline}.`,
      ],
      drillDownLinks: [link("#detail", "Matrix"), link(getKimHammerModuleHref("pattern-analysis"), "Patterns")],
      evidenceNote: "Bill-derived",
    },
    {
      id: "timeline",
      eyebrow: "KH-0 · Timeline",
      title: "Legislative Timeline",
      paragraphs: [
        "Session change log with roles and impacts — now includes 2021 foundation rows and 2023 co-sponsor election bills.",
        `${election.timeline.length} timeline entries spanning ${[...new Set(election.timeline.map((row) => row.year))].sort().join(", ")}.`,
      ],
      drillDownLinks: [link("#detail", "Timeline")],
      evidenceNote: "Election record",
    },
  ];

  const map: Record<string, KimHammerModuleBriefing> = {};
  for (const draft of drafts) {
    map[draft.id] = finalize(draft);
  }
  return map;
}

function buildDomainRollups(
  modules: Record<string, KimHammerModuleBriefing>,
): KimHammerBriefingHub["domainRollups"] {
  const rollups: KimHammerBriefingHub["domainRollups"] = {};
  for (const domain of KIM_HAMMER_BRIEFING_DOMAINS) {
    const childBriefs = domain.moduleIds.map((id) => modules[id]).filter(Boolean);
    rollups[domain.id] = {
      paragraphs: [
        domain.description,
        ...childBriefs.map((b) => `${b.title}: ${b.paragraphs[0]}`),
      ],
      evidenceNote: `${domain.layer} domain rollup`,
    };
  }
  return rollups;
}

let cachedHub: KimHammerBriefingHub | null = null;

export function loadKimHammerBriefingHub(): KimHammerBriefingHub {
  if (cachedHub) return cachedHub;
  const moduleBriefings = buildAllModuleBriefings();
  cachedHub = {
    generatedAt: new Date().toISOString(),
    rootHref: KIM_HAMMER_COMMAND_CENTER_HREF,
    domains: KIM_HAMMER_BRIEFING_DOMAINS,
    moduleBriefings,
    domainRollups: buildDomainRollups(moduleBriefings),
  };
  return cachedHub;
}

export function loadKimHammerModuleBriefing(moduleId: string): KimHammerModuleBriefing {
  const briefing = loadKimHammerBriefingHub().moduleBriefings[moduleId];
  if (!briefing) throw new Error(`Unknown Kim Hammer briefing module: ${moduleId}`);
  return briefing;
}

export function buildKimHammerBillBriefing(bill: HammerBillRow): KimHammerModuleBriefing {
  const domain = getKimHammerDomainForModule("themes");
  const narrative = resolveKimHammerBillNarrative(bill);
  return {
    id: `bill-${bill.billNumber}`,
    domainId: domain?.id ?? "domain-kh0-record",
    layer: "KH-0B",
    title: `${bill.billNumber}${bill.actNumber ? ` / Act ${bill.actNumber}` : ""}`,
    eyebrow: narrative.packageId ? "KH-0B · 2021 foundation bill" : "KH-0B · Bill narrative intelligence",
    href: `${KIM_HAMMER_COMMAND_CENTER_HREF}/bills/${encodeURIComponent(bill.billNumber)}`,
    parentHref: KIM_HAMMER_COMMAND_CENTER_HREF,
    parentTitle: "Kim Hammer Command Center",
    paragraphs: [
      narrative.plainEnglishSummary,
      narrative.billNarrative,
      `County: ${narrative.countyImpactNarrative} Burden: ${narrative.operationalBurdenNarrative}`,
    ],
    operatorTakeaway: narrative.strategicBriefing.howToMessage[0] ?? "Cite act; deploy inside chronology arc.",
    strategicBriefing: toBriefingStrategicSections(narrative.strategicBriefing),
    governanceStatus: narrative.evidenceTier === "NEEDS_REVIEW" ? "NEEDS_REVIEW" : "INTERPRETATION",
    drillDownLinks: [
      link("#detail", "Full dossier"),
      ...(narrative.packageId
        ? [link(getKimHammerModuleHref("integrity-foundation-2021"), "2021 package")]
        : []),
      link(getKimHammerModuleHref("county-administration-burden"), "County burden"),
    ],
    evidenceNote: `${narrative.publicationRisk} publication risk · ${narrative.evidenceTier}`,
  };
}

export function getKimHammerSiblingBriefings(moduleId: string, limit = 4): KimHammerModuleBriefing[] {
  const domain = getKimHammerDomainForModule(moduleId);
  if (!domain) return [];
  const hub = loadKimHammerBriefingHub();
  return domain.moduleIds
    .filter((id) => id !== moduleId)
    .slice(0, limit)
    .map((id) => hub.moduleBriefings[id])
    .filter(Boolean);
}
