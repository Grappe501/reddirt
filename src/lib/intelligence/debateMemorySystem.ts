import { loadIntelligenceMemoryRegistry } from "@/lib/intelligence/intelligenceMemoryRegistry";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { generateKimHammerLiveSuggestionCandidates } from "@/lib/opposition/kimHammerSuggestionSandbox";
import { buildStrategicBriefingPaper } from "@/lib/intelligence/strategicBriefingPaperEngine";
import type { MemorySignal } from "@/lib/intelligence/types/intelligenceMemory";

function mem(signal: string, entityId: string, entityLabel: string, reason: string): MemorySignal {
  return { signal, entityId, entityLabel, reason, publicationSafety: "NON_PUBLISHABLE", humanReviewRequired: true };
}

export function computeDebateThemeRecurrence(repoRoot?: string): MemorySignal[] {
  const registry = loadIntelligenceMemoryRegistry(repoRoot);
  const workbench = loadKimHammerWorkbench();
  const paper = buildStrategicBriefingPaper("debate-prep", repoRoot);
  const suggestions = generateKimHammerLiveSuggestionCandidates(repoRoot);
  const signals: MemorySignal[] = [];

  for (const theme of registry.debateMemory) {
    if (theme.recurringAttacks.length > 0) {
      signals.push(
        mem(
          "DEBATE_RECURRING_ATTACK",
          theme.themeId,
          theme.themeId,
          `Recurring attacks: ${theme.recurringAttacks.slice(0, 2).join("; ")}`,
        ),
      );
    }
    if (theme.fatigueSignals.length > 0) {
      signals.push(mem("DEBATE_STALE_REBUTTAL", theme.themeId, theme.themeId, theme.fatigueSignals[0]!));
    }
    for (const risky of theme.riskyResponses) {
      signals.push(mem("DEBATE_TRAP_WARNING", theme.themeId, theme.themeId, risky));
    }
  }

  for (const bill of workbench.strongestDebateAnchors) {
    signals.push(
      mem(
        "DEBATE_THEME_RECURRENCE",
        bill.billNumber,
        bill.billNumber,
        `Strongest debate anchor — ${bill.billNumber} recurs in prep.`,
      ),
    );
  }

  for (const line of paper.whatNotToSay.slice(0, 2)) {
    signals.push(mem("DEBATE_TRAP_WARNING", "what-not-to-say", "What not to say", line));
  }

  const debateSuggestions = suggestions.filter((s) => s.suggestionType === "DEBATE_PREP");
  if (debateSuggestions.length > 0) {
    signals.push(
      mem("DEBATE_PREP_BACKLOG", debateSuggestions[0]!.id, "Debate prep suggestion", debateSuggestions[0]!.title),
    );
  }

  return signals;
}

export function summarizeDebateMemoryTrends(repoRoot?: string): string[] {
  return computeDebateThemeRecurrence(repoRoot).map((row) => `${row.signal}: ${row.reason.slice(0, 100)}`);
}
