/**
 * Phase 11 P2 — Staff strategy command surface depth overlays.
 */
import type { StaffStrategySurfaceId } from "@/lib/intelligence/v4/staffStrategyCommandInventory";
import { STAFF_STRATEGY_COMMAND_HUB_HREF } from "@/lib/intelligence/v4/staffStrategyCommandInventory";

export type StaffStrategySurfaceOverlay = {
  surfaceId: StaffStrategySurfaceId;
  strategicRole: string;
  operatorUse: string[];
  debateApplication: string[];
  intelligenceLinks: Array<{ href: string; label: string }>;
  linkedPhilosophyDocKeys: string[];
};

const HUB = "/admin/intelligence/strategy-philosophy-hub";
const MOVEMENT = "/admin/intelligence/movement-philosophy";
const CSM = "/admin/intelligence/campaign-system-manual";
const KELLY = "/admin/intelligence/kelly-strategic-plan";
const DEBATE = "/admin/intelligence/debate-command";

function surface(
  surfaceId: StaffStrategySurfaceId,
  role: string,
  operator: string[],
  debate: string[],
  links: Array<{ href: string; label: string }>,
  philKeys: string[] = [],
): StaffStrategySurfaceOverlay {
  return {
    surfaceId,
    strategicRole: role,
    operatorUse: operator,
    debateApplication: debate,
    intelligenceLinks: [
      { href: STAFF_STRATEGY_COMMAND_HUB_HREF, label: "Staff strategy command" },
      { href: HUB, label: "Strategy & philosophy hub" },
      { href: MOVEMENT, label: "Movement philosophy" },
      { href: DEBATE, label: "Debate command" },
      ...links,
    ],
    linkedPhilosophyDocKeys: philKeys,
  };
}

const SURFACE_OVERLAYS: Record<StaffStrategySurfaceId, StaffStrategySurfaceOverlay> = {
  "morning-brief": surface(
    "morning-brief",
    "Daily leadership intelligence composition — rollup of brain state, registration, and human action queue before field day.",
    [
      "Run each morning during debate week after claims gate review.",
      "Cross-check lowest readiness dimension from debate command before candidate briefings.",
      "Pair WORKBENCH_MORNING_BRIEF manual tome with live brain coordinator output.",
    ],
    [
      "Morning brief flags thin research areas — fix before afternoon press or debate prep blocks.",
      "NON_PUBLISHABLE until human review — never auto-forward to external channels.",
    ],
    [
      { href: CSM, label: "Campaign system manual" },
      { href: "/admin/intelligence/claims", label: "Claims ledger" },
      { href: KELLY, label: "Kelly framework" },
    ],
    ["vision-and-goals", "core-principles"],
  ),
  "briefing-papers": surface(
    "briefing-papers",
    "Staff-authored strategic depth — briefing paper engine for media hits, donor meetings, and debate-adjacent prep.",
    [
      "Draft briefing papers after philosophy alignment check — strategy-alignment dashboard first.",
      "Link each paper to claim ledger citations before distribution outside admin.",
      "Use MESSAGE_CREATION_TO_DISTRIBUTION manual chapter for distribution discipline.",
    ],
    [
      "Briefing papers feed debate command message lanes when claims VERIFIED.",
      "Cut INTERPRETATION lines from papers destined for stage rehearsal.",
    ],
    [
      { href: "/admin/intelligence/writing-toolbox", label: "Writing toolbox" },
      { href: "/admin/intelligence/strategy-alignment", label: "Strategy alignment" },
      { href: CSM, label: "Campaign system manual" },
    ],
    ["core-principles", "positioning-and-coalition"],
  ),
  "writing-toolbox": surface(
    "writing-toolbox",
    "Governed writing surfaces — tone consistency, claims firewall, and staff comms discipline.",
    [
      "All external-bound prose passes claims gate and movement philosophy tone check.",
      "Volunteer-facing copy must trace to VOL-CORE-1 and core-principles before publish.",
      "Crisis comms templates inherit calm-steady-leadership cadence from positioning doc.",
    ],
    [
      "Debate scripts and rapid-response drafts originate here or briefing-papers — same claims rules.",
      "Calm steady leadership tone from positioning doc applies to crisis comms templates.",
    ],
    [
      { href: "/admin/intelligence/briefing-papers", label: "Briefing papers" },
      { href: MOVEMENT, label: "Movement philosophy" },
      { href: "/admin/intelligence/claims", label: "Claims ledger" },
    ],
    ["volunteer-philosophy-foundation", "positioning-and-coalition"],
  ),
  "strategic-target-pathway": surface(
    "strategic-target-pathway",
    "Victory math and registration pathway — NSI-7 field command connecting county briefings to statewide rollup.",
    [
      "Update county targets after registration rollup changes.",
      "Cross-read SIMULATION_AND_FORECASTING manual before changing victory math assumptions.",
      "Export county briefing one-pagers for debate-week field staff packets.",
    ],
    [
      "County fluency dimension in debate command ties to pathway data — know your registration story.",
      "Use pathway county briefings when Hammer attacks unfunded mandates or clerk burden.",
    ],
    [
      { href: "/admin/intelligence/scenario-simulation", label: "Scenario simulation" },
      { href: "/admin/intelligence/election-funding", label: "Election funding" },
      { href: KELLY, label: "Kelly LANE chapter" },
    ],
    ["vision-and-goals"],
  ),
  "campaign-intelligence-graph": surface(
    "campaign-intelligence-graph",
    "NSI-4 unified graph — bills, narratives, doctrines, philosophy nodes with NEEDS_REVIEW governance.",
    [
      "Review philosophy graph nodes before promoting doctrine to Field Book.",
      "Crosswalk graph entities to debate briefings and Kelly manual chapters.",
      "Flag NEEDS_REVIEW nodes in morning brief when graph summary changes.",
    ],
    [
      "Philosophy consistency panel on debate command reads from graph summary.",
      "Do not cite graph nodes on stage until claims VERIFIED.",
    ],
    [
      { href: HUB, label: "Strategy & philosophy hub" },
      { href: "/admin/intelligence/debate-briefings", label: "Debate briefings" },
      { href: CSM, label: "Campaign system manual" },
    ],
    ["core-principles", "vision-and-goals"],
  ),
  "scenario-simulation": surface(
    "scenario-simulation",
    "Strategic scenario modeling — debate-week decision support and field resource allocation what-ifs.",
    [
      "Run scenarios before major resource shifts or debate pivot decisions.",
      "Pair with SIMULATION_AND_FORECASTING_SYSTEM_PLAN manual tome.",
      "Document scenario assumptions in briefing papers when outputs drive messaging.",
    ],
    [
      "Scenario outputs inform debate command readiness weak areas — not stage lines directly.",
      "Document assumptions in briefing papers when scenarios drive messaging shifts.",
    ],
    [
      { href: "/admin/intelligence/strategic-target-pathway", label: "Strategic target pathway" },
      { href: "/admin/intelligence/morning-brief", label: "Morning brief" },
      { href: CSM, label: "Campaign system manual" },
    ],
    ["vision-and-goals"],
  ),
};

export function getStaffStrategySurfaceOverlay(surfaceId: StaffStrategySurfaceId): StaffStrategySurfaceOverlay {
  return SURFACE_OVERLAYS[surfaceId];
}

export function staffStrategySurfaceMeetsPhase11P2Bar(overlay: StaffStrategySurfaceOverlay): boolean {
  return (
    overlay.strategicRole.length >= 40 &&
    overlay.operatorUse.length >= 3 &&
    overlay.debateApplication.length >= 2 &&
    overlay.intelligenceLinks.length >= 6
  );
}

export function countStaffStrategySurfacesAtPhase11P2Bar(): { atBar: number; total: number } {
  let atBar = 0;
  for (const id of Object.keys(SURFACE_OVERLAYS) as StaffStrategySurfaceId[]) {
    if (staffStrategySurfaceMeetsPhase11P2Bar(getStaffStrategySurfaceOverlay(id))) atBar++;
  }
  return { atBar, total: Object.keys(SURFACE_OVERLAYS).length };
}

export const PHASE11_P2_STAFF_STRATEGY_SURFACE_TOTAL = 6;
