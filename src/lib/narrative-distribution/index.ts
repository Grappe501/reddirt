/**
 * Narrative Distribution Engine — typed foundation (geography, channels, packets, demo registry).
 *
 * No runtime I/O: safe for fixtures, Storybook, and admin UI that only reads static data.
 *
 * @see docs/NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md
 * @see docs/NARRATIVE_DISTRIBUTION_TYPES_REPORT.md
 */

export type {
  AmplificationQueueItem,
  ChannelPerformance,
  CountyNarrativePlan,
  DistributionAssignment,
  EditorialStatus,
  MessageToNarrativeBridge,
  NarrativeAsset,
  NarrativeAssetKind,
  NarrativeCalendarItem,
  NarrativeChannel,
  NarrativeGeographyScope,
  NarrativePacket,
  NarrativePlanGapKind,
  RegionNarrativePlan,
  StoryIntake,
} from "./types";

export {
  EDITORIAL_STATUSES,
  NARRATIVE_ASSET_KINDS,
  NARRATIVE_CHANNELS,
} from "./types";

export {
  assertUniqueNarrativeDemoRegistryIds,
  DEMO_MESSAGE_TO_NARRATIVE_BRIDGES,
  DEMO_NARRATIVE_ASSETS,
  DEMO_NARRATIVE_PACKETS,
  getDemoNarrativeAssetById,
  getDemoNarrativePacketById,
} from "./assets";

export type { NarrativeDistributionPacket, NarrativePacketBuildContext } from "./packet-builder";

export {
  assertNarrativePacketBuilderInvariants,
  bridgeMessageTemplatesToNarrativeAssets,
  buildNarrativePacket,
  getAssetsForChannel,
  getCountyNarrativePacket,
  getPowerOf5LaunchPacket,
  getRegionNarrativePacket,
} from "./packet-builder";

export type {
  PublicMemberHubBringFiveCta,
  PublicMemberHubCountyCard,
  PublicMemberHubListeningPrompt,
  PublicMemberHubLocalStoryPrompt,
  PublicMemberHubMessageOfWeek,
  PublicMemberHubModel,
  PublicMemberHubNarrativePriority,
  PublicMemberHubP5Prompt,
  PublicMemberHubSharePacket,
  PublicMemberHubWhatToSayToFive,
  PublicMemberHubWhatToSayToFiveLine,
} from "./public-member-hub";

export { buildPublicMemberHubModel } from "./public-member-hub";

export type {
  ChannelReadinessDemo,
  FeedbackNeedDemo,
  NarrativeAdminCommandCenterModel,
  NarrativeAdminKpi,
} from "./demo-admin-command-center";

export { buildNarrativeAdminCommandCenterModel } from "./demo-admin-command-center";
