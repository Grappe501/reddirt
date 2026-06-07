/**
 * Phase 16 P7 — Staff coach overlay (assign scenario + pin drills for candidate).
 */
import {
  getRehearsalEncounterOption,
  listRehearsalEncounterOptions,
  REHEARSAL_HUB_HREF,
  type RehearsalEncounterId,
} from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import {
  DRILL_QUEUE_HUB_HREF,
  getDrillQueue,
  getDrillQueueCards,
  listDrillQueues,
  type DrillQueueId,
} from "@/lib/intelligence/v4/phase16P3DrillQueue";
import {
  getAssignedRehearsalEncounterId,
  listPinnedRehearsalDrills,
  loadRehearsalCoachState,
  PHASE16_P7_MAX_PINNED_DRILLS,
  type RehearsalCoachDrillPin,
  type RehearsalCoachStateFile,
} from "@/lib/intelligence/v4/phase16P7RehearsalCoachState";

export const REHEARSAL_COACH_HUB_HREF = "/admin/intelligence/rehearsal-coach";

export const PHASE16_P7_COACH_FIELD_TOTAL = 5;

export type StaffCoachPinOption = {
  queueId: DrillQueueId;
  cardNumber: number;
  label: string;
  href: string;
};

export type StaffCoachSummary = {
  hubHref: string;
  hasAssignment: boolean;
  assignedEncounterTitle: string | null;
  assignedLaunchHref: string | null;
  pinnedDrills: { pinId: string; label: string; href: string }[];
  pinCount: number;
  maxPins: number;
  tonightReminder: string;
};

export function buildDrillPinHref(queueId: DrillQueueId, cardNumber: number): string {
  return `${DRILL_QUEUE_HUB_HREF}?queue=${queueId}&card=${cardNumber}`;
}

export function buildDrillPinLabel(queueId: DrillQueueId, cardNumber: number): string {
  const queue = getDrillQueue(queueId);
  const cards = getDrillQueueCards(queueId);
  const card = cards[Math.min(Math.max(cardNumber, 1), cards.length) - 1];
  const queueTitle = queue?.title ?? "Drill queue";
  return card ? `${queueTitle} · ${card.title}` : `${queueTitle} · card ${cardNumber}`;
}

export function listStaffCoachPinOptions(): StaffCoachPinOption[] {
  const options: StaffCoachPinOption[] = [];
  for (const queue of listDrillQueues()) {
    const cards = getDrillQueueCards(queue.queueId);
    for (let i = 0; i < Math.min(2, cards.length); i++) {
      const cardNumber = i + 1;
      options.push({
        queueId: queue.queueId,
        cardNumber,
        label: buildDrillPinLabel(queue.queueId, cardNumber),
        href: buildDrillPinHref(queue.queueId, cardNumber),
      });
    }
  }
  return options.slice(0, 9);
}

export function buildStaffCoachSummary(root?: string): StaffCoachSummary {
  const assignedId = getAssignedRehearsalEncounterId(root);
  const pinned = listPinnedRehearsalDrills(root);
  const assignedOption = assignedId ? getRehearsalEncounterOption(assignedId) : undefined;

  let tonightReminder =
    "Staff coach overlay — assign tonight's encounter and pin up to three must-run drills for Kelly on command home.";
  if (assignedOption && pinned.length > 0) {
    tonightReminder = `Staff assigned ${assignedOption.title} — ${pinned.length} drill${pinned.length === 1 ? "" : "s"} pinned for tonight.`;
  } else if (assignedOption) {
    tonightReminder = `Staff assigned ${assignedOption.title} — start from the session launcher or encounters hub.`;
  } else if (pinned.length > 0) {
    tonightReminder = `${pinned.length} drill${pinned.length === 1 ? "" : "s"} pinned for tonight — run these before stage.`;
  }

  return {
    hubHref: REHEARSAL_COACH_HUB_HREF,
    hasAssignment: Boolean(assignedOption),
    assignedEncounterTitle: assignedOption?.title ?? null,
    assignedLaunchHref: assignedOption?.launchHref ?? null,
    pinnedDrills: pinned.map((p) => ({ pinId: p.pinId, label: p.label, href: p.href })),
    pinCount: pinned.length,
    maxPins: PHASE16_P7_MAX_PINNED_DRILLS,
    tonightReminder,
  };
}

export function getRehearsalCoachStateForDisplay(root?: string): RehearsalCoachStateFile {
  return (
    loadRehearsalCoachState(root) ?? {
      version: 1,
      updatedAt: new Date().toISOString(),
      assignedEncounterId: null,
      assignedAt: null,
      pinnedDrills: [],
    }
  );
}

export function listCoachAssignableEncounters() {
  return listRehearsalEncounterOptions();
}

export { REHEARSAL_HUB_HREF, type RehearsalCoachDrillPin, type RehearsalCoachStateFile };
export { PHASE16_P7_MAX_PINNED_DRILLS } from "@/lib/intelligence/v4/phase16P7RehearsalCoachState";
