/**
 * Phase 16 P4 — Session debrief depth overlays.
 */
import {
  buildPreStageChecklist,
  PRE_STAGE_CHECKLIST_IDS,
  SESSION_DEBRIEF_HUB_HREF,
  type PreStageChecklistItemId,
} from "@/lib/intelligence/v4/phase16P4SessionDebrief";

export { SESSION_DEBRIEF_HUB_HREF };

export type PreStageChecklistOverlay = {
  itemId: PreStageChecklistItemId;
  operatorSteps: string[];
  wiredOnRoute: boolean;
  hasAutoStatus: boolean;
};

export function getPreStageChecklistOverlay(itemId: PreStageChecklistItemId): PreStageChecklistOverlay | undefined {
  const item = buildPreStageChecklist().find((i) => i.itemId === itemId);
  if (!item) return undefined;
  return {
    itemId,
    operatorSteps: [item.description, item.kellyBeat, `Status: ${item.statusLabel}`, `Route: ${item.href}`],
    wiredOnRoute: item.href.startsWith("/admin/intelligence"),
    hasAutoStatus: item.autoStatus !== "manual" || item.statusLabel.length > 0,
  };
}

export function preStageChecklistMeetsPhase16P4Bar(overlay: PreStageChecklistOverlay): boolean {
  return overlay.operatorSteps.length >= 4 && overlay.wiredOnRoute && overlay.hasAutoStatus;
}

export function countPreStageChecklistAtBar(): { atBar: number; total: number } {
  const atBar = PRE_STAGE_CHECKLIST_IDS.filter((id) => {
    const o = getPreStageChecklistOverlay(id);
    return o && preStageChecklistMeetsPhase16P4Bar(o);
  }).length;
  return { atBar, total: PRE_STAGE_CHECKLIST_IDS.length };
}
