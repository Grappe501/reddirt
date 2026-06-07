/**
 * Phase 16 P6 — Session memory (continue last drill + history on command home).
 */
import { DRILL_QUEUE_HUB_HREF, getDrillQueue, getDrillQueueCards, type DrillQueueId } from "@/lib/intelligence/v4/phase16P3DrillQueue";
import {
  ENCOUNTERS_HUB_HREF,
  getEncounterScenario,
  getEncounterScenarioSteps,
  type EncounterScenarioId,
} from "@/lib/intelligence/v4/phase16P2EncounterScenarios";
import { buildIpadDrillPlayerHref } from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";
import {
  getRehearsalActiveSession,
  listRehearsalSessionHistory,
  persistRehearsalActiveSession,
  type RehearsalActiveSession,
  type RehearsalSessionHistoryEntry,
} from "@/lib/intelligence/v4/phase16P6SessionMemoryState";

export const REHEARSAL_HISTORY_HUB_HREF = "/admin/intelligence/rehearsal-history";

export const PHASE16_P6_ACTIVE_SESSION_FIELD_TOTAL = 5;

export type SessionMemorySummary = {
  hubHref: string;
  hasActiveSession: boolean;
  continueLabel: string | null;
  continueHref: string | null;
  stepLabel: string | null;
  historyCount: number;
  tonightReminder: string;
};

export function recordDrillQueueProgress(
  queueId: DrillQueueId,
  cardNumber: number,
  surface: "drill-queue" | "ipad-drill" = "drill-queue",
  root?: string,
): RehearsalActiveSession {
  const cards = getDrillQueueCards(queueId);
  const queue = getDrillQueue(queueId);
  const totalSteps = cards.length;
  const card = Math.min(Math.max(1, cardNumber), Math.max(1, totalSteps));
  const continueHref =
    surface === "ipad-drill"
      ? buildIpadDrillPlayerHref(queueId, card)
      : `${DRILL_QUEUE_HUB_HREF}?queue=${queueId}&card=${card}`;

  const state = persistRehearsalActiveSession(
    {
      sessionKind: surface,
      queueId,
      cardNumber: card,
      totalSteps,
      label: queue?.title ?? "Drill queue",
      continueHref,
    },
    root,
  );
  return state.active!;
}

export function recordEncounterProgress(
  encounterId: EncounterScenarioId,
  stepNumber = 1,
  root?: string,
): RehearsalActiveSession {
  const scenario = getEncounterScenario(encounterId)!;
  const steps = getEncounterScenarioSteps(encounterId);
  const totalSteps = encounterId === "purchase-walkthrough" ? 7 : steps.length;
  const card = Math.min(Math.max(1, stepNumber), Math.max(1, totalSteps));

  const state = persistRehearsalActiveSession(
    {
      sessionKind: "encounter",
      encounterId,
      cardNumber: card,
      totalSteps,
      label: scenario.title,
      continueHref: `${ENCOUNTERS_HUB_HREF}?scenario=${encounterId}`,
    },
    root,
  );
  return state.active!;
}

export function buildSessionMemorySummary(root?: string): SessionMemorySummary {
  const active = getRehearsalActiveSession(root);
  const history = listRehearsalSessionHistory(root);

  let continueLabel: string | null = null;
  let stepLabel: string | null = null;
  if (active) {
    continueLabel = `Continue ${active.label}`;
    stepLabel = `step ${active.cardNumber}/${active.totalSteps}`;
  }

  return {
    hubHref: REHEARSAL_HISTORY_HUB_HREF,
    hasActiveSession: Boolean(active),
    continueLabel,
    continueHref: active?.continueHref ?? null,
    stepLabel,
    historyCount: history.length,
    tonightReminder: active
      ? `Continue where you left off — ${active.label}, step ${active.cardNumber}/${active.totalSteps}. Staff can reset history on the rehearsal history hub.`
      : "Session memory tracks your last drill — start a queue or encounter and pick up on command home next time.",
  };
}

export function listSessionMemoryHistory(root?: string): RehearsalSessionHistoryEntry[] {
  return listRehearsalSessionHistory(root);
}

export function getActiveSessionForDisplay(root?: string): RehearsalActiveSession | null {
  return getRehearsalActiveSession(root);
}
