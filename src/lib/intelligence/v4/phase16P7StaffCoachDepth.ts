/**
 * Phase 16 P7 — Staff coach overlay depth overlays.
 */
import { getRehearsalEncounterOption } from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import {
  getAssignedRehearsalEncounterId,
  listPinnedRehearsalDrills,
  PHASE16_P7_MAX_PINNED_DRILLS,
} from "@/lib/intelligence/v4/phase16P7RehearsalCoachState";
import { REHEARSAL_COACH_HUB_HREF } from "@/lib/intelligence/v4/phase16P7StaffCoach";
import { isStaffBackstageHref } from "@/lib/intelligence/v4/staffBackstageRouteGuard";

export { REHEARSAL_COACH_HUB_HREF };

export type CoachOverlayFieldId =
  | "assigned-scenario"
  | "pin-slot-1"
  | "pin-slot-2"
  | "pin-slot-3"
  | "staff-route-guard";

export const COACH_OVERLAY_FIELD_IDS: CoachOverlayFieldId[] = [
  "assigned-scenario",
  "pin-slot-1",
  "pin-slot-2",
  "pin-slot-3",
  "staff-route-guard",
];

export type CoachOverlayField = {
  fieldId: CoachOverlayFieldId;
  operatorSteps: string[];
  populated: boolean;
};

export function getCoachOverlayField(fieldId: CoachOverlayFieldId): CoachOverlayField {
  const assignedId = getAssignedRehearsalEncounterId();
  const assigned = assignedId ? getRehearsalEncounterOption(assignedId) : undefined;
  const pins = listPinnedRehearsalDrills();

  switch (fieldId) {
    case "assigned-scenario":
      return {
        fieldId,
        operatorSteps: [
          assigned?.title ?? "No assignment — pick encounter on coach hub",
          assigned?.launchHref ?? REHEARSAL_COACH_HUB_HREF,
          "Surfaces on command home staff coach strip for candidate profile",
        ],
        populated: Boolean(assigned?.title),
      };
    case "pin-slot-1":
    case "pin-slot-2":
    case "pin-slot-3": {
      const slot = fieldId === "pin-slot-1" ? 0 : fieldId === "pin-slot-2" ? 1 : 2;
      const pin = pins[slot];
      return {
        fieldId,
        operatorSteps: [
          pin?.label ?? `Slot ${slot + 1} open — pin from standard queue cards`,
          pin?.href ?? `${REHEARSAL_COACH_HUB_HREF} · max ${PHASE16_P7_MAX_PINNED_DRILLS} pins`,
          "Kelly must run these tonight on command home",
        ],
        populated: Boolean(pin?.href),
      };
    }
    case "staff-route-guard":
      return {
        fieldId,
        operatorSteps: [
          REHEARSAL_COACH_HUB_HREF,
          `Guard wired: ${isStaffBackstageHref(REHEARSAL_COACH_HUB_HREF) ? "yes" : "no"}`,
          "Candidate profile redirects to command home with staff-backstage-blocked query",
        ],
        populated: isStaffBackstageHref(REHEARSAL_COACH_HUB_HREF),
      };
  }
}

export function coachOverlayFieldMeetsPhase16P7Bar(field: CoachOverlayField): boolean {
  if (field.fieldId === "staff-route-guard") return field.populated && field.operatorSteps.length >= 3;
  return field.operatorSteps.length >= 3;
}

export function countCoachOverlayFieldsAtBar(): { atBar: number; total: number } {
  const atBar = COACH_OVERLAY_FIELD_IDS.filter((id) => {
    const field = getCoachOverlayField(id);
    return coachOverlayFieldMeetsPhase16P7Bar(field);
  }).length;
  return { atBar, total: COACH_OVERLAY_FIELD_IDS.length };
}
