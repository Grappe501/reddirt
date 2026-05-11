/**
 * Set `CampaignEvent.campaignIntent` when creating ops events so EVENT_CREATED workflows
 * can spawn the right Action Queue tasks (in addition to generic appearance prep for applicable types).
 */

export const VOS_CAMPAIGN_INTENT = {
  houseParty: "vos_house_party",
  countyFundraiser: "vos_county_fundraiser",
  weekendImmersion: "vos_weekend_immersion",
  faithCommunityVisit: "vos_faith_community_visit",
} as const;

export type VosCampaignIntent = (typeof VOS_CAMPAIGN_INTENT)[keyof typeof VOS_CAMPAIGN_INTENT];
