import { loadIntelligenceMemoryRegistry } from "@/lib/intelligence/intelligenceMemoryRegistry";
import { loadPublicMediaIntakeQueue } from "@/lib/intelligence/publicMediaIntake";
import { generateKimHammerLiveSuggestionCandidates } from "@/lib/opposition/kimHammerSuggestionSandbox";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import type { MemorySignal } from "@/lib/intelligence/types/intelligenceMemory";

function mem(signal: string, entityId: string, entityLabel: string, reason: string): MemorySignal {
  return { signal, entityId, entityLabel, reason, publicationSafety: "NON_PUBLISHABLE", humanReviewRequired: true };
}

export function computeMessagingDrift(repoRoot?: string): MemorySignal[] {
  const registry = loadIntelligenceMemoryRegistry(repoRoot);
  const media = loadPublicMediaIntakeQueue(repoRoot);
  const suggestions = generateKimHammerLiveSuggestionCandidates(repoRoot);
  const workbench = loadKimHammerWorkbench();
  const signals: MemorySignal[] = [];

  for (const entry of registry.opponentMessagingMemory) {
    if (entry.recurrenceCount >= 5) {
      signals.push(
        mem(
          "MESSAGE_RECURRENCE",
          entry.messageId,
          entry.messageId,
          `Recurring ${entry.recurrenceCount} times — ${entry.framingChanges[0]?.note ?? "monitor for repositioning"}.`,
        ),
      );
    }
    if (entry.contradictionHistory.length > 0) {
      signals.push(
        mem(
          "CONTRADICTION_GROWTH",
          entry.messageId,
          entry.messageId,
          entry.contradictionHistory[0] ?? "Contradiction detected in registry.",
        ),
      );
    }
    if (entry.framingChanges.length > 0) {
      signals.push(
        mem("MESSAGING_DRIFT", entry.messageId, entry.messageId, entry.framingChanges[entry.framingChanges.length - 1]!.note),
      );
    }
  }

  const opponentFindings = media.findings.filter(
    (f) => f.title.toLowerCase().includes("hammer") || f.summary.toLowerCase().includes("secretary of state"),
  );
  if (opponentFindings.length >= 2) {
    signals.push(
      mem(
        "MEDIA_ESCALATION",
        "opponent-media-cluster",
        "Opponent media cluster",
        `${opponentFindings.length} recent findings mention opponent — possible message amplification.`,
      ),
    );
  }

  for (const bill of workbench.strongestDebateAnchors.slice(0, 3)) {
    signals.push(
      mem(
        "DEBATE_FRAMING_SHIFT",
        bill.billNumber,
        bill.billNumber,
        `Recurring debate anchor — ${bill.billNumber} (${bill.sessionYear ?? "session"}) recurs in prep.`,
      ),
    );
  }

  const contradictions = suggestions.filter((s) => s.suggestionType === "CONTRADICTION_FLAG");
  if (contradictions.length > 0) {
    signals.push(
      mem(
        "CONTRADICTION_EMERGENCE",
        contradictions[0]!.id,
        "Live contradiction candidate",
        contradictions[0]!.body.slice(0, 120),
      ),
    );
  }

  return signals;
}

export function summarizeOpponentMessagingDrift(repoRoot?: string): string[] {
  return computeMessagingDrift(repoRoot).map((row) => `${row.signal}: ${row.reason}`);
}
