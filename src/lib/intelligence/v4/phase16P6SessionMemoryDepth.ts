/**
 * Phase 16 P6 — Session memory depth overlays.
 */
import {
  getRehearsalActiveSession,
  type RehearsalActiveSession,
} from "@/lib/intelligence/v4/phase16P6SessionMemoryState";
import { REHEARSAL_HISTORY_HUB_HREF } from "@/lib/intelligence/v4/phase16P6SessionMemory";

export { REHEARSAL_HISTORY_HUB_HREF };

export type ActiveSessionFieldId =
  | "session-kind"
  | "step-position"
  | "continue-href"
  | "label"
  | "updated-at";

export const ACTIVE_SESSION_FIELD_IDS: ActiveSessionFieldId[] = [
  "session-kind",
  "step-position",
  "continue-href",
  "label",
  "updated-at",
];

export type ActiveSessionFieldOverlay = {
  fieldId: ActiveSessionFieldId;
  operatorSteps: string[];
  populated: boolean;
};

function sampleActiveSession(): RehearsalActiveSession {
  return (
    getRehearsalActiveSession() ?? {
      sessionKind: "drill-queue",
      queueId: "standard-tonight",
      cardNumber: 4,
      totalSteps: 6,
      label: "Standard tonight queue",
      continueHref: "/admin/intelligence/drill-queue?queue=standard-tonight&card=4",
      updatedAt: new Date().toISOString(),
    }
  );
}

export function getActiveSessionFieldOverlay(fieldId: ActiveSessionFieldId): ActiveSessionFieldOverlay {
  const active = sampleActiveSession();
  switch (fieldId) {
    case "session-kind":
      return {
        fieldId,
        operatorSteps: [`Kind: ${active.sessionKind}`, `Queue: ${active.queueId ?? "—"}`, `Encounter: ${active.encounterId ?? "—"}`],
        populated: Boolean(active.sessionKind),
      };
    case "step-position":
      return {
        fieldId,
        operatorSteps: [
          `Step ${active.cardNumber}/${active.totalSteps}`,
          "Continue CTA on command home",
          "Recorded on drill queue and iPad player navigation",
        ],
        populated: active.cardNumber > 0 && active.totalSteps > 0,
      };
    case "continue-href":
      return {
        fieldId,
        operatorSteps: [active.continueHref, "Deep-links existing prep surfaces", "No new content silos"],
        populated: active.continueHref.startsWith("/admin/intelligence"),
      };
    case "label":
      return {
        fieldId,
        operatorSteps: [active.label, "Human-readable session title", "Shown on command home strip"],
        populated: active.label.length > 0,
      };
    case "updated-at":
      return {
        fieldId,
        operatorSteps: [active.updatedAt, "ISO timestamp", "Staff reset clears active + history"],
        populated: active.updatedAt.length > 0,
      };
  }
}

export function activeSessionFieldMeetsPhase16P6Bar(overlay: ActiveSessionFieldOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.populated;
}

export function countActiveSessionFieldsAtBar(): { atBar: number; total: number } {
  const atBar = ACTIVE_SESSION_FIELD_IDS.filter((id) => {
    const o = getActiveSessionFieldOverlay(id);
    return activeSessionFieldMeetsPhase16P6Bar(o);
  }).length;
  return { atBar, total: ACTIVE_SESSION_FIELD_IDS.length };
}
