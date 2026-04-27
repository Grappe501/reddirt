/**
 * Demo-only narrative asset and packet registry — safe placeholders for layouts and tests.
 * No publishing, no Prisma, no webhooks.
 *
 * @see docs/NARRATIVE_DISTRIBUTION_TYPES_REPORT.md
 */

import type {
  MessageToNarrativeBridge,
  NarrativeAsset,
  NarrativePacket,
} from "./types";

const DEMO_COMPLIANCE_NOTE =
  "Demo registry only. Production packets require counsel and compliance review before distribution.";

export const DEMO_NARRATIVE_ASSETS: NarrativeAsset[] = [
  {
    id: "nde.demo.asset.p5_launch.story_card",
    kind: "story_card",
    title: "Power of 5 — launch story card",
    summary: "Listening-first invite; small trusted circle; human-scale organizing.",
    linkedMessageTemplateIds: ["mce.p5_onboarding.circle_invite.v1"],
    messageCategories: ["power_of_5_onboarding"],
    geography: { scope: "state", stateCode: "AR" },
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.asset.pope_organizing.county_packet",
    kind: "county_message_packet",
    title: "Pope County — organizing packet shell",
    summary: "Place-based county narrative plus volunteer-safe talking points (gold-sample county).",
    linkedMessageTemplateIds: ["mce.county_organizing.local_stake.v1"],
    messageCategories: ["county_organizing"],
    geography: { scope: "county", stateCode: "AR", countySlug: "pope" },
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.asset.nwa_listening.story_card",
    kind: "story_card",
    title: "NWA — listening conversation card",
    summary: "Two-way listening prompts for Northwest Arkansas turf; elevate local color with review.",
    linkedMessageTemplateIds: ["mce.listening.two_way_open.v1"],
    messageCategories: ["listening_conversation"],
    geography: { scope: "region", stateCode: "AR", regionKey: "northwest-arkansas" },
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.asset.volunteer_recruit.talking_points",
    kind: "talking_points",
    title: "Volunteer recruitment — shift ask",
    summary: "Finite-time shift ask; clear role; easy yes or no.",
    linkedMessageTemplateIds: ["mce.volunteer.shift_ask.v1"],
    messageCategories: ["volunteer_recruitment"],
    geography: { scope: "county", stateCode: "AR" },
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.asset.county_captain.talking_points",
    kind: "talking_points",
    title: "County captain recruitment",
    summary: "Respectful leadership ask for county-scale ownership (staff-reviewed scripts only).",
    linkedMessageTemplateIds: ["mce.candidate_recruit.respectful_ask.v1"],
    messageCategories: ["candidate_recruitment_ask"],
    geography: { scope: "county", stateCode: "AR" },
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.asset.petition.short_post",
    kind: "short_post",
    title: "Petition action — short post",
    summary: "Signature drive CTA; platform variants handled in execution rails, not here.",
    linkedMessageTemplateIds: ["mce.petition.signature_ask.v1"],
    messageCategories: ["petition_ask"],
    geography: { scope: "state", stateCode: "AR" },
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.asset.gotv.reminder_email_stub",
    kind: "email_copy",
    title: "GOTV — reminder packet stub",
    summary: "Vote plan reminder; subject/body live in approved drafts only after compliance sign-off.",
    linkedMessageTemplateIds: ["mce.gotv.vote_plan.v1"],
    messageCategories: ["gotv_ask"],
    geography: { scope: "state", stateCode: "AR" },
    isDemoPlaceholder: true,
  },
];

export const DEMO_NARRATIVE_PACKETS: NarrativePacket[] = [
  {
    id: "nde.demo.packet.power_of_5_launch",
    title: "Power of 5 launch packet",
    summary: "Peer-appropriate invite and follow-up assets for circle growth (demo bundle).",
    waveLabel: "demo-wave-p5-launch",
    geography: { scope: "state", stateCode: "AR" },
    channels: ["power_of_5_network", "region_dashboards", "county_pages", "social"],
    assetIds: ["nde.demo.asset.p5_launch.story_card"],
    editorialStatus: "approved",
    complianceNotes: DEMO_COMPLIANCE_NOTE,
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.packet.pope_county_organizing",
    title: "Pope County organizing packet",
    summary: "County command narrative shell and organizing beats for Pope (demo).",
    waveLabel: "demo-wave-pope-organizing",
    geography: { scope: "county", stateCode: "AR", countySlug: "pope" },
    channels: ["county_pages", "power_of_5_network", "blog", "region_dashboards"],
    assetIds: ["nde.demo.asset.pope_organizing.county_packet"],
    editorialStatus: "approved",
    complianceNotes: DEMO_COMPLIANCE_NOTE,
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.packet.nwa_listening",
    title: "NWA listening packet",
    summary: "Northwest Arkansas listening wave — social and leader elevation (demo).",
    waveLabel: "demo-wave-nwa-listening",
    geography: { scope: "region", stateCode: "AR", regionKey: "northwest-arkansas" },
    channels: ["social", "power_of_5_network", "community_leaders", "region_dashboards"],
    assetIds: ["nde.demo.asset.nwa_listening.story_card"],
    editorialStatus: "approved",
    complianceNotes: DEMO_COMPLIANCE_NOTE,
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.packet.volunteer_recruitment",
    title: "Volunteer recruitment packet",
    summary: "Shift-based asks across email, SMS where consented, and relational channels (demo).",
    waveLabel: "demo-wave-volunteer",
    geography: { scope: "state", stateCode: "AR" },
    channels: ["email", "sms", "social", "power_of_5_network"],
    assetIds: ["nde.demo.asset.volunteer_recruit.talking_points"],
    editorialStatus: "approved",
    complianceNotes: DEMO_COMPLIANCE_NOTE,
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.packet.county_captain_recruitment",
    title: "County captain recruitment packet",
    summary: "Leadership pipeline for county-scale roles; events and P5 missions (demo).",
    waveLabel: "demo-wave-county-captain",
    geography: { scope: "state", stateCode: "AR" },
    channels: ["power_of_5_network", "email", "local_events"],
    assetIds: ["nde.demo.asset.county_captain.talking_points"],
    editorialStatus: "approved",
    complianceNotes: DEMO_COMPLIANCE_NOTE,
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.packet.petition_action",
    title: "Petition action packet",
    summary: "Signature drive narrative and short-post variants (demo).",
    waveLabel: "demo-wave-petition",
    geography: { scope: "state", stateCode: "AR" },
    channels: ["email", "sms", "social", "county_pages"],
    assetIds: ["nde.demo.asset.petition.short_post"],
    editorialStatus: "approved",
    complianceNotes: DEMO_COMPLIANCE_NOTE,
    isDemoPlaceholder: true,
  },
  {
    id: "nde.demo.packet.gotv_reminder",
    title: "GOTV reminder packet",
    summary: "Vote-plan reminders; counsel-sensitive timing and copy in production (demo stub).",
    waveLabel: "demo-wave-gotv",
    geography: { scope: "state", stateCode: "AR" },
    channels: ["sms", "email", "social", "local_events"],
    assetIds: ["nde.demo.asset.gotv.reminder_email_stub"],
    editorialStatus: "approved",
    complianceNotes: DEMO_COMPLIANCE_NOTE,
    isDemoPlaceholder: true,
  },
];

/** Example bridges from MCE template ids to NDE demo assets (for planners and UI mocks). */
export const DEMO_MESSAGE_TO_NARRATIVE_BRIDGES: MessageToNarrativeBridge[] = [
  {
    id: "nde.demo.bridge.p5_invite",
    messageTemplateId: "mce.p5_onboarding.circle_invite.v1",
    narrativeAssetId: "nde.demo.asset.p5_launch.story_card",
    narrativePacketId: "nde.demo.packet.power_of_5_launch",
    patternKind: "conversation_starter",
    notes: "Demo linkage only.",
  },
  {
    id: "nde.demo.bridge.pope_county",
    messageTemplateId: "mce.county_organizing.local_stake.v1",
    narrativeAssetId: "nde.demo.asset.pope_organizing.county_packet",
    narrativePacketId: "nde.demo.packet.pope_county_organizing",
    patternKind: "bridge_statement",
  },
  {
    id: "nde.demo.bridge.nwa_listen",
    messageTemplateId: "mce.listening.two_way_open.v1",
    narrativeAssetId: "nde.demo.asset.nwa_listening.story_card",
    narrativePacketId: "nde.demo.packet.nwa_listening",
    patternKind: "listening_prompt",
  },
  {
    id: "nde.demo.bridge.volunteer",
    messageTemplateId: "mce.volunteer.shift_ask.v1",
    narrativeAssetId: "nde.demo.asset.volunteer_recruit.talking_points",
    narrativePacketId: "nde.demo.packet.volunteer_recruitment",
    patternKind: "volunteer_ask",
  },
  {
    id: "nde.demo.bridge.captain",
    messageTemplateId: "mce.candidate_recruit.respectful_ask.v1",
    narrativeAssetId: "nde.demo.asset.county_captain.talking_points",
    narrativePacketId: "nde.demo.packet.county_captain_recruitment",
    patternKind: "candidate_recruitment_ask",
  },
  {
    id: "nde.demo.bridge.petition",
    messageTemplateId: "mce.petition.signature_ask.v1",
    narrativeAssetId: "nde.demo.asset.petition.short_post",
    narrativePacketId: "nde.demo.packet.petition_action",
    patternKind: "petition_ask",
  },
  {
    id: "nde.demo.bridge.gotv",
    messageTemplateId: "mce.gotv.vote_plan.v1",
    narrativeAssetId: "nde.demo.asset.gotv.reminder_email_stub",
    narrativePacketId: "nde.demo.packet.gotv_reminder",
    patternKind: "gotv_ask",
  },
];

export function getDemoNarrativeAssetById(id: string): NarrativeAsset | undefined {
  return DEMO_NARRATIVE_ASSETS.find((a) => a.id === id);
}

export function getDemoNarrativePacketById(id: string): NarrativePacket | undefined {
  return DEMO_NARRATIVE_PACKETS.find((p) => p.id === id);
}

/**
 * Dev guard: unique ids across demo assets and packets.
 */
export function assertUniqueNarrativeDemoRegistryIds(): void {
  const seen = new Set<string>();
  for (const a of DEMO_NARRATIVE_ASSETS) {
    if (seen.has(a.id)) throw new Error(`Duplicate narrative demo asset id: ${a.id}`);
    seen.add(a.id);
  }
  for (const p of DEMO_NARRATIVE_PACKETS) {
    if (seen.has(p.id)) throw new Error(`Duplicate narrative demo id (packet collides): ${p.id}`);
    seen.add(p.id);
  }
  for (const p of DEMO_NARRATIVE_PACKETS) {
    for (const aid of p.assetIds) {
      if (!DEMO_NARRATIVE_ASSETS.some((a) => a.id === aid)) {
        throw new Error(`Packet ${p.id} references missing asset ${aid}`);
      }
    }
  }
  for (const b of DEMO_MESSAGE_TO_NARRATIVE_BRIDGES) {
    if (seen.has(b.id)) throw new Error(`Duplicate narrative demo bridge id: ${b.id}`);
    seen.add(b.id);
  }
}
