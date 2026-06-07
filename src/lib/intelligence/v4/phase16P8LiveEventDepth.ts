/**
 * Phase 16 P8 — Live event mode depth overlays.
 */
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import {
  ACCA_PANEL_EVENT_LABEL,
  buildLiveEventDayOfPlan,
  computeAccaPanelCountdown,
  isLiveEventModeActive,
  LIVE_EVENT_HUB_HREF,
  SRE_LIVE_EVENT_ENV_KEY,
} from "@/lib/intelligence/v4/phase16P8LiveEventMode";

export { LIVE_EVENT_HUB_HREF };

export type LiveEventFieldId =
  | "acca-countdown"
  | "day-of-card"
  | "shortest-safe-run"
  | "clerk-week-bind"
  | "stage-safe-gate";

export const LIVE_EVENT_FIELD_IDS: LiveEventFieldId[] = [
  "acca-countdown",
  "day-of-card",
  "shortest-safe-run",
  "clerk-week-bind",
  "stage-safe-gate",
];

export type LiveEventFieldOverlay = {
  fieldId: LiveEventFieldId;
  operatorSteps: string[];
  populated: boolean;
};

export function getLiveEventFieldOverlay(fieldId: LiveEventFieldId): LiveEventFieldOverlay {
  const countdown = computeAccaPanelCountdown();
  const plan = buildLiveEventDayOfPlan();

  switch (fieldId) {
    case "acca-countdown":
      return {
        fieldId,
        operatorSteps: [
          ACCA_PANEL_EVENT_LABEL,
          `${countdown.daysRemaining}d · ${countdown.hoursRemaining}h remaining`,
          `${SRE_LIVE_EVENT_ENV_KEY} or county_clerks audience activates mode`,
        ],
        populated: countdown.eventLabel.length > 0,
      };
    case "day-of-card":
      return {
        fieldId,
        operatorSteps: [
          countdown.isDayOf ? "Day-of card live on command home" : "Countdown card when mode active",
          plan.launchHref,
          "Clerk week profile surfaces live-event hub in Home nav",
        ],
        populated: true,
      };
    case "shortest-safe-run":
      return {
        fieldId,
        operatorSteps: [
          `${plan.title} · ${plan.totalMinutes} min · ${plan.stepCount} steps`,
          plan.steps.map((s) => s.title).join(" → "),
          `Stage-safe only: ${plan.stageSafeOnly ? "yes" : "partial"}`,
        ],
        populated: plan.stepCount > 0 && plan.stageSafeOnly,
      };
    case "clerk-week-bind":
      return {
        fieldId,
        operatorSteps: [
          "/admin/intelligence/county-clerk-week/acca-summer-conference",
          "/admin/intelligence/encounters?scenario=acca-panel",
          `Clerk audience: ${isCountyClerkPrimaryAudience() ? "active" : "env-driven"}`,
        ],
        populated: true,
      };
    case "stage-safe-gate":
      return {
        fieldId,
        operatorSteps: [
          "Every day-of step requires stageSafeRequired",
          "NEEDS_REVIEW lines stay research-question framing",
          `Live mode: ${isLiveEventModeActive() ? "on" : "off until env or clerk audience"}`,
        ],
        populated: plan.stageSafeOnly,
      };
  }
}

export function liveEventFieldMeetsPhase16P8Bar(overlay: LiveEventFieldOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.populated;
}

export function countLiveEventFieldsAtBar(): { atBar: number; total: number } {
  const atBar = LIVE_EVENT_FIELD_IDS.filter((id) => {
    const overlay = getLiveEventFieldOverlay(id);
    return liveEventFieldMeetsPhase16P8Bar(overlay);
  }).length;
  return { atBar, total: LIVE_EVENT_FIELD_IDS.length };
}
