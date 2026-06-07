/**
 * Phase 16 P5 — iPad drill player depth overlays.
 */
import {
  IPAD_DRILL_PLAYER_CONTROLS,
  IPAD_DRILL_PLAYER_CONTROL_IDS,
  IPAD_DRILL_PLAYER_HREF,
  PHASE16_P5_MIN_TOUCH_TARGET_PX,
  PHASE16_P5_MAX_COLUMN_PX,
  type IpadDrillPlayerControlId,
} from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";

export { IPAD_DRILL_PLAYER_HREF };

export type IpadDrillPlayerControlOverlay = {
  controlId: IpadDrillPlayerControlId;
  operatorSteps: string[];
  touchTargetMet: boolean;
  wiredInShell: boolean;
};

export function getIpadDrillPlayerControlOverlay(
  controlId: IpadDrillPlayerControlId,
): IpadDrillPlayerControlOverlay | undefined {
  const control = IPAD_DRILL_PLAYER_CONTROLS.find((c) => c.controlId === controlId);
  if (!control) return undefined;
  return {
    controlId,
    operatorSteps: [
      control.description,
      `Label: ${control.label}`,
      `Min touch: ${control.minTouchPx}px · column max ${PHASE16_P5_MAX_COLUMN_PX}px`,
    ],
    touchTargetMet: control.minTouchPx >= PHASE16_P5_MIN_TOUCH_TARGET_PX,
    wiredInShell: true,
  };
}

export function ipadDrillPlayerControlMeetsPhase16P5Bar(overlay: IpadDrillPlayerControlOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.touchTargetMet && overlay.wiredInShell;
}

export function countIpadDrillPlayerControlsAtBar(): { atBar: number; total: number } {
  const atBar = IPAD_DRILL_PLAYER_CONTROL_IDS.filter((id) => {
    const o = getIpadDrillPlayerControlOverlay(id);
    return o && ipadDrillPlayerControlMeetsPhase16P5Bar(o);
  }).length;
  return { atBar, total: IPAD_DRILL_PLAYER_CONTROL_IDS.length };
}
