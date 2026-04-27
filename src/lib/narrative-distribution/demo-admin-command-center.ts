/**
 * Demo-only aggregates for the narrative distribution admin prototype.
 * No DB, no publishing, no external I/O.
 */

import { ARKANSAS_CAMPAIGN_REGIONS } from "@/lib/campaign-engine/regions/arkansas-campaign-regions";
import { DEMO_NARRATIVE_PACKETS } from "./assets";
import type {
  AmplificationQueueItem,
  CountyNarrativePlan,
  EditorialStatus,
  NarrativeChannel,
  NarrativePacket,
  NarrativePlanGapKind,
  RegionNarrativePlan,
  StoryIntake,
} from "./types";
import { NARRATIVE_CHANNELS } from "./types";

export type ChannelReadinessDemo = {
  channel: NarrativeChannel;
  displayLabel: string;
  readiness: "ready" | "needs_asset" | "blocked_compliance" | "scheduled";
  notes: string;
};

export type FeedbackNeedDemo = {
  id: string;
  title: string;
  detail: string;
  ownerRoleLabel: string;
  dueAt?: string;
  linkedPacketId?: string;
};

export type NarrativeAdminKpi = {
  label: string;
  value: string;
  hint: string;
};

export type NarrativeAdminCommandCenterModel = {
  kpis: NarrativeAdminKpi[];
  amplificationQueue: AmplificationQueueItem[];
  storyPipeline: StoryIntake[];
  countyPackets: CountyNarrativePlan[];
  regionPackets: RegionNarrativePlan[];
  channelReadiness: ChannelReadinessDemo[];
  packetsWithEditorialView: Array<NarrativePacket & { editorialStatusView: EditorialStatus }>;
  feedbackNeeds: FeedbackNeedDemo[];
};

/** Display-only editorial column mapping (demo board); does not change registry packets on disk. */
const EDITORIAL_VIEW_BY_PACKET_ID: Partial<Record<string, EditorialStatus>> = {
  "nde.demo.packet.power_of_5_launch": "distributing",
  "nde.demo.packet.pope_county_organizing": "measuring",
  "nde.demo.packet.nwa_listening": "in_review",
  "nde.demo.packet.volunteer_recruitment": "assigned",
  "nde.demo.packet.county_captain_recruitment": "draft",
  "nde.demo.packet.petition_action": "approved",
  "nde.demo.packet.gotv_reminder": "closed",
};

const CHANNEL_LABELS: Record<NarrativeChannel, string> = {
  power_of_5_network: "Power of 5 network",
  blog: "Blog",
  email: "Email",
  sms: "SMS",
  social: "Social",
  local_events: "Local events",
  community_leaders: "Community leaders",
  earned_media: "Earned media",
  county_pages: "County pages",
  region_dashboards: "Region dashboards",
};

function channelReadinessSeed(): ChannelReadinessDemo[] {
  const cycle: ChannelReadinessDemo["readiness"][] = [
    "ready",
    "ready",
    "needs_asset",
    "scheduled",
    "ready",
    "blocked_compliance",
    "needs_asset",
    "ready",
    "scheduled",
  ];
  return NARRATIVE_CHANNELS.map((channel, i) => ({
    channel,
    displayLabel: CHANNEL_LABELS[channel],
    readiness: cycle[i % cycle.length]!,
    notes:
      cycle[i % cycle.length] === "ready"
        ? "Staff checklist complete for demo wave."
        : cycle[i % cycle.length] === "blocked_compliance"
          ? "Hold until counsel sign-off on timing."
          : cycle[i % cycle.length] === "needs_asset"
            ? "Waiting on approved copy variants."
            : "Queued after dependency window.",
  }));
}

const DEMO_STORY_INTAKES: StoryIntake[] = [
  {
    id: "nde.demo.story.1",
    recordedAt: "2026-04-22T15:00:00.000Z",
    themeSummary: "Voters asking how petition signatures reach the Secretary of State — need plain-language FAQ.",
    geography: { scope: "state", stateCode: "AR" },
    suggestedCategories: ["petition_ask"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.story.2",
    recordedAt: "2026-04-23T18:30:00.000Z",
    themeSummary: "County captains want a shorter shift-ask script for weeknight calls.",
    geography: { scope: "county", stateCode: "AR", countySlug: "pope" },
    suggestedCategories: ["volunteer_recruitment"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.story.3",
    recordedAt: "2026-04-24T12:00:00.000Z",
    themeSummary: "NWA leaders requested more two-way listening prompts before candidate travel days.",
    geography: { scope: "region", stateCode: "AR", regionKey: "northwest-arkansas" },
    suggestedCategories: ["listening_conversation"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.story.4",
    recordedAt: "2026-04-25T09:15:00.000Z",
    themeSummary: "Field notes: GOTV reminders should emphasize vote plan, not candidate name repetition.",
    geography: { scope: "state", stateCode: "AR" },
    suggestedCategories: ["gotv_ask"],
    isDemoPlaceholder: true,
  },
];

const DEMO_AMPLIFICATION: AmplificationQueueItem[] = [
  {
    id: "nde.demo.amp.1",
    narrativePacketId: "nde.demo.packet.power_of_5_launch",
    sortOrder: 1,
    title: "Circle invite — weekly push",
    scriptTemplateId: "mce.p5_onboarding.circle_invite.v1",
    dueAt: "2026-05-02",
    channelHints: ["power_of_5_network", "social"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.amp.2",
    narrativePacketId: "nde.demo.packet.nwa_listening",
    sortOrder: 2,
    title: "Listening prompts — leader elevation",
    scriptAssetId: "nde.demo.asset.nwa_listening.story_card",
    dueAt: "2026-05-04",
    channelHints: ["community_leaders", "social"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.amp.3",
    narrativePacketId: "nde.demo.packet.volunteer_recruitment",
    sortOrder: 3,
    title: "Shift ask — email + SMS (consented)",
    scriptTemplateId: "mce.volunteer.shift_ask.v1",
    dueAt: "2026-05-06",
    channelHints: ["email", "sms"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.amp.4",
    narrativePacketId: "nde.demo.packet.petition_action",
    sortOrder: 4,
    title: "Signature drive — short post pack",
    scriptTemplateId: "mce.petition.signature_ask.v1",
    dueAt: "2026-05-08",
    channelHints: ["social", "county_pages"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.amp.5",
    narrativePacketId: "nde.demo.packet.county_captain_recruitment",
    sortOrder: 5,
    title: "Captain recruitment — event talking track",
    scriptTemplateId: "mce.candidate_recruit.respectful_ask.v1",
    dueAt: "2026-05-10",
    channelHints: ["local_events", "power_of_5_network"],
    isDemoPlaceholder: true,
  },
];

const DEMO_COUNTY_PLANS: CountyNarrativePlan[] = [
  {
    id: "nde.demo.plan.county.pope",
    countySlug: "pope",
    countyDisplayName: "Pope",
    activeNarrativePacketId: "nde.demo.packet.pope_county_organizing",
    headline: "River Valley organizing shell",
    bodySummary: "Gold-sample county packet; use for layout review only.",
    gaps: ["pending_review"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.plan.county.benton",
    countySlug: "benton",
    countyDisplayName: "Benton",
    activeNarrativePacketId: "nde.demo.packet.nwa_listening",
    headline: "Align with NWA listening wave",
    bodySummary: "Local proof points still being collected.",
    gaps: ["missing_local_proof", "pending_review"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.plan.county.washington",
    countySlug: "washington",
    countyDisplayName: "Washington",
    activeNarrativePacketId: "nde.demo.packet.nwa_listening",
    headline: "NWA peer narrative",
    bodySummary: "Shared regional packet; county-specific intro TBD.",
    gaps: ["missing_language"],
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.plan.county.pulaski",
    countySlug: "pulaski",
    countyDisplayName: "Pulaski",
    activeNarrativePacketId: "nde.demo.packet.volunteer_recruitment",
    headline: "Metro volunteer density",
    bodySummary: "Demo assignment only — no live roster linkage.",
    gaps: ["missing_distribution"],
    isDemoPlaceholder: true,
  },
];

const DEMO_FEEDBACK: FeedbackNeedDemo[] = [
  {
    id: "nde.demo.fb.1",
    title: "Compliance review on GOTV stub",
    detail: "Confirm send windows and disclosure lines before any execution rail hooks this packet.",
    ownerRoleLabel: "Compliance coordinator",
    dueAt: "2026-05-01",
    linkedPacketId: "nde.demo.packet.gotv_reminder",
  },
  {
    id: "nde.demo.fb.2",
    title: "Localized quotes for NWA listening",
    detail: "Need two vetted local lines (no unsourced opponent claims).",
    ownerRoleLabel: "Regional lead",
    dueAt: "2026-05-03",
    linkedPacketId: "nde.demo.packet.nwa_listening",
  },
  {
    id: "nde.demo.fb.3",
    title: "Captain recruitment — event handoff",
    detail: "Staff to confirm which counties get in-person script vs digital-only.",
    ownerRoleLabel: "Field director",
    dueAt: "2026-05-05",
    linkedPacketId: "nde.demo.packet.county_captain_recruitment",
  },
];

export function buildNarrativeAdminCommandCenterModel(): NarrativeAdminCommandCenterModel {
  const packetsWithEditorialView = DEMO_NARRATIVE_PACKETS.map((p) => ({
    ...p,
    editorialStatusView: EDITORIAL_VIEW_BY_PACKET_ID[p.id] ?? p.editorialStatus,
  }));

  const kpis: NarrativeAdminKpi[] = [
    { label: "Demo packets", value: String(DEMO_NARRATIVE_PACKETS.length), hint: "Static registry" },
    { label: "Amplification rows", value: String(DEMO_AMPLIFICATION.length), hint: "Ordered queue" },
    { label: "Story intakes", value: String(DEMO_STORY_INTAKES.length), hint: "Theme summaries only" },
    { label: "County plans", value: String(DEMO_COUNTY_PLANS.length), hint: "Seed rows" },
    { label: "Regions", value: String(ARKANSAS_CAMPAIGN_REGIONS.length), hint: "Campaign geography" },
  ];

  const regionPackets: RegionNarrativePlan[] = ARKANSAS_CAMPAIGN_REGIONS.map((r, i) => {
    const packetRotation = [
      "nde.demo.packet.nwa_listening",
      "nde.demo.packet.volunteer_recruitment",
      "nde.demo.packet.power_of_5_launch",
      undefined,
    ] as const;
    const active = packetRotation[i % packetRotation.length];
    return {
      id: `nde.demo.plan.region.${r.slug}`,
      regionKey: r.slug,
      regionDisplayName: r.displayName,
      activeNarrativePacketId: active,
      headline: active ? `Demo focus: packet ${(i % 3) + 1}` : "No active packet (demo)",
      bodySummary: r.notes ?? "Stakeholder region — gaps are illustrative.",
      gaps: (i % 2 === 0 ? ["pending_review"] : ["other"]) as NarrativePlanGapKind[],
      isDemoPlaceholder: true,
    };
  });

  return {
    kpis,
    amplificationQueue: DEMO_AMPLIFICATION,
    storyPipeline: DEMO_STORY_INTAKES,
    countyPackets: DEMO_COUNTY_PLANS,
    regionPackets,
    channelReadiness: channelReadinessSeed(),
    packetsWithEditorialView,
    feedbackNeeds: DEMO_FEEDBACK,
  };
}
