import type { DebateIntelligenceV4Profile } from "@/lib/intelligence/v4/debateIntelligenceV4";
import type { DebateIntelligenceV3Packet } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
export type KimHammerV4MarkdownLayer = keyof DebateIntelligenceV3Packet["researchLayers"];

export type KimHammerV4RenderSpec =
  | { type: "markdown"; layer: KimHammerV4MarkdownLayer; sectionLimit?: number }
  | { type: "rebuttal-playbook" }
  | { type: "likely-arguments" }
  | { type: "argument-map" }
  | { type: "strengths-weaknesses" }
  | { type: "retrieval-gaps" }
  | { type: "integrity-2021" }
  | { type: "theme-matrix" }
  | { type: "timeline" }
  | { type: "rapid-response" }
  | { type: "hub-claims-summary" }
  | { type: "staff-stub"; primaryHref?: string; primaryLabel?: string };

export type KimHammerV4ModuleEntry = {
  moduleId: string;
  title: string;
  eyebrow: string;
  guideKey?: string;
  profile: DebateIntelligenceV4Profile;
  render: KimHammerV4RenderSpec;
  /** Use v4 body outside launch mode (KH-2 / KH-0 debate modules). */
  preferV4?: boolean;
  /** Routes with a real page.tsx (evidence command, etc.) — never replace with launch stub. */
  preserveCustomPageInLaunchMode?: boolean;
};

const STAFF_STUB: KimHammerV4RenderSpec = {
  type: "staff-stub",
  primaryHref: "/admin/intelligence",
  primaryLabel: "Debate hub",
};

function entry(
  moduleId: string,
  title: string,
  eyebrow: string,
  render: KimHammerV4RenderSpec,
  opts?: Partial<Pick<KimHammerV4ModuleEntry, "guideKey" | "profile" | "preferV4" | "preserveCustomPageInLaunchMode">>,
): KimHammerV4ModuleEntry {
  return {
    moduleId,
    title,
    eyebrow,
    profile: opts?.profile ?? "hub",
    render,
    guideKey: opts?.guideKey,
    preferV4: opts?.preferV4,
    preserveCustomPageInLaunchMode: opts?.preserveCustomPageInLaunchMode,
  };
}

/** P3 — v4-backed Kim Hammer modules (launch mode always; preferV4 also in full mode). */
export const KIM_HAMMER_V4_MODULES: Record<string, KimHammerV4ModuleEntry> = {
  "debate-profile": entry(
    "debate-profile",
    "Debate profile (KH-2)",
    "Argument lanes · response architecture",
    { type: "markdown", layer: "debateProfile", sectionLimit: 12 },
    { guideKey: "debateProfile", preferV4: true, profile: "hub" },
  ),
  "contrast-vs-kelly": entry(
    "contrast-vs-kelly",
    "Contrast vs Kelly",
    "Values-forward contrast frames",
    { type: "markdown", layer: "contrastVsKelly", sectionLimit: 10 },
    { guideKey: "contrastVsKelly", preferV4: true, profile: "hub" },
  ),
  "rebuttal-prep": entry(
    "rebuttal-prep",
    "Rebuttal prep",
    "Agree · contrast · bridge cards",
    { type: "rebuttal-playbook" },
    { guideKey: "rebuttalPrep", preferV4: true, profile: "hub" },
  ),
  "strengths-weaknesses": entry(
    "strengths-weaknesses",
    "Strengths & vulnerabilities",
    "Source-backed matrices",
    { type: "strengths-weaknesses" },
    { guideKey: "strengthsWeaknesses", preferV4: true, profile: "hub" },
  ),
  "intelligence-gaps": entry(
    "intelligence-gaps",
    "Intelligence gaps",
    "Retrieval queue · verification before export",
    { type: "retrieval-gaps" },
    { guideKey: "intelligenceGaps", preferV4: true, profile: "hub" },
  ),
  "research-gaps": entry(
    "research-gaps",
    "Research gaps",
    "Same retrieval queue as intelligence gaps",
    { type: "retrieval-gaps" },
    { guideKey: "intelligenceGaps", preferV4: true, profile: "hub" },
  ),
  "background-deep": entry(
    "background-deep",
    "KH-3 deep research",
    "Writings · capacity · archives (markdown excerpt)",
    { type: "markdown", layer: "kh3DeepResearch", sectionLimit: 10 },
    { guideKey: "backgroundDeep", preferV4: true, profile: "full" },
  ),
  themes: entry(
    "themes",
    "Election record themes",
    "v4 theme matrix",
    { type: "theme-matrix" },
    { guideKey: "themeMatrix", preferV4: true, profile: "surface" },
  ),
  timeline: entry(
    "timeline",
    "Legislative timeline",
    "Continuity proof by year",
    { type: "timeline" },
    { guideKey: "timeline", preferV4: true, profile: "surface" },
  ),
  "integrity-foundation-2021": entry(
    "integrity-foundation-2021",
    "2021 integrity foundation",
    "Six-bill package · architecture anchor",
    { type: "integrity-2021" },
    { guideKey: "integrity2021", preferV4: true, profile: "hub" },
  ),
  "legislative-chronology": entry(
    "legislative-chronology",
    "Legislative chronology",
    "Timeline highlights for debate",
    { type: "timeline" },
    { guideKey: "timeline", preferV4: true, profile: "surface" },
  ),
  website: entry(
    "website",
    "Website message analysis",
    "Opponent public messaging patterns",
    { type: "markdown", layer: "websiteAnalysis", sectionLimit: 8 },
    { guideKey: "websiteAnalysis", preferV4: true, profile: "hub" },
  ),
  "message-analysis": entry(
    "message-analysis",
    "Message analysis",
    "Election record messaging guidance",
    { type: "markdown", layer: "messageGuidance", sectionLimit: 10 },
    { guideKey: "messageAnalysis", preferV4: true, profile: "hub" },
  ),
  "rapid-response": entry(
    "rapid-response",
    "Rapid response locker",
    "KH-3 evidence appendix",
    { type: "rapid-response" },
    { guideKey: "rapidResponse", preferV4: true, profile: "hub" },
  ),
  "claims-review": entry(
    "claims-review",
    "Claims review",
    "Supported vs needs research",
    { type: "hub-claims-summary" },
    { guideKey: "claims", preferV4: true, profile: "hub" },
  ),
  "likely-args": entry(
    "likely-args",
    "Likely Hammer arguments",
    "Structured argument map",
    { type: "argument-map" },
    { guideKey: "argumentMap", preferV4: true, profile: "hub" },
  ),
  "county-administration-burden": entry(
    "county-administration-burden",
    "County administration burden",
    "County official concerns from message guidance",
    { type: "markdown", layer: "messageGuidance", sectionLimit: 6 },
    { guideKey: "themeMatrix", preferV4: true, profile: "hub" },
  ),
  "direct-democracy": entry(
    "direct-democracy",
    "Direct democracy cluster",
    "Petition / initiative framing",
    { type: "markdown", layer: "messageGuidance", sectionLimit: 6 },
    { guideKey: "themeMatrix", preferV4: true, profile: "hub" },
  ),
  "public-debate-evidence": entry(
    "public-debate-evidence",
    "Public debate evidence",
    "Export-ready anchors — staff only",
    { type: "rapid-response" },
    { guideKey: "evidenceCommand", preferV4: true, profile: "hub" },
  ),
  archive: entry("archive", "Opposition archive", "Source records rollup", STAFF_STUB, {
    guideKey: "opponentRecord",
    profile: "hub",
  }),
  writings: entry(
    "writings",
    "Authored writings",
    "KH-3 writings index (staff)",
    { type: "markdown", layer: "kh3DeepResearch", sectionLimit: 4 },
    { guideKey: "backgroundDeep", preferV4: true, profile: "full" },
  ),
  "evidence-command": entry(
    "evidence-command",
    "Evidence command",
    "Citation locker · export gate",
    STAFF_STUB,
    { guideKey: "evidenceCommand", profile: "hub", preserveCustomPageInLaunchMode: true },
  ),
};

KIM_HAMMER_V4_MODULES["debate-prep"] = {
  moduleId: "debate-prep",
  title: "Debate prep",
  eyebrow: "28-section rehearsal packet",
  profile: "hub",
  preferV4: false,
  preserveCustomPageInLaunchMode: true,
  render: {
    type: "staff-stub",
    primaryHref: "/admin/intelligence/kim-hammer/debate-prep",
    primaryLabel: "Open debate prep",
  },
};

// Register remaining shell modules as launch-safe stubs
const STUB_MODULES: Array<[string, string, string]> = [
  ["audit-log", "Audit log", "KH-4 governance"],
  ["citation-locker", "Citation locker", "KH-4"],
  ["ai-suggestion-sandbox", "AI suggestion sandbox", "NON_PUBLISHABLE drafts"],
  ["export-control-center", "Export control", "KH-4"],
  ["narrative-state", "Narrative state", "KH-4"],
  ["geographic-narrative-intelligence", "Geographic narrative intel", "KH-4"],
  ["county-briefings", "County briefings", "KH-4"],
  ["narrative-usage-analytics", "Narrative usage analytics", "KH-4"],
  ["debate-packet-export", "Debate packet export", "KH-4"],
  ["kh4-agent-tools", "KH-4 agent tools", "KH-4"],
  ["ai-opposition-copilot", "AI opposition copilot", "Staff only"],
  ["attack-surface", "Attack surface", "KH-4"],
  ["intel-heat-map", "Intel heat map", "KH-4"],
  ["narrative-drift-monitor", "Narrative drift monitor", "KH-4"],
  ["management-capacity", "Management capacity", "KH-3"],
  ["debate-archive", "Debate archive", "KH-3"],
  ["response-model", "Response model", "KH-3"],
  ["kh3-operational", "KH-3 operational", "KH-3"],
  ["network-influence", "Network influence", "KH-3"],
  ["pattern-analysis", "Pattern analysis", "KH-3"],
  ["vulnerability-matrix-kh3", "Vulnerability matrix", "KH-3"],
  ["narrative-testing", "Narrative testing", "KH-3"],
  ["county-exposure", "County exposure", "KH-3"],
  ["modern-sos-contrast", "Modern SOS contrast", "KH-3"],
  ["bill-relationship-graph", "Bill relationship graph", "KH-3"],
  ["timeline-heatmap", "Timeline heatmap", "KH-3"],
  ["profile", "Public profile", "KH-1"],
  ["electoral-history", "Electoral history", "KH-1"],
  ["media-footprint", "Media footprint", "KH-1"],
  ["public-timeline", "Public timeline", "KH-1"],
  ["public-controversies", "Public controversies", "KH-1"],
  ["debate-ai-workbench", "Debate AI workbench", "Governed AI prep"],
];

for (const [moduleId, title, eyebrow] of STUB_MODULES) {
  if (!KIM_HAMMER_V4_MODULES[moduleId]) {
    const preservePage = moduleId === "debate-archive";
    KIM_HAMMER_V4_MODULES[moduleId] = entry(moduleId, title, eyebrow, STAFF_STUB, {
      guideKey: "opponentRecord",
      profile: "hub",
      ...(preservePage ? { preserveCustomPageInLaunchMode: true } : {}),
    });
  }
}

export function getKimHammerV4ModuleEntry(moduleId: string): KimHammerV4ModuleEntry | undefined {
  return KIM_HAMMER_V4_MODULES[moduleId];
}

export function shouldRenderKimHammerV4Module(moduleId: string, launchMode: boolean): boolean {
  const entry = getKimHammerV4ModuleEntry(moduleId);
  if (!entry) return launchMode;
  if (launchMode && entry.preserveCustomPageInLaunchMode) return false;
  if (launchMode) return true;
  return Boolean(entry.preferV4);
}

export function listKimHammerV4MigratedModuleIds(): string[] {
  return Object.keys(KIM_HAMMER_V4_MODULES);
}
