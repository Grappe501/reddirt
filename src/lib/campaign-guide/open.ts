/** Dispatched on `window` to open the sitewide Ask Kelly / campaign guide panel from any public CTA. */
export const OPEN_CAMPAIGN_GUIDE_EVENT = "kelly-open-campaign-guide";

export function requestOpenCampaignGuide() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_CAMPAIGN_GUIDE_EVENT));
}
