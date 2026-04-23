import { prisma } from "@/lib/db";
import { composeEmailWorkflowSummaries } from "./composer";
import { buildEmailWorkflowContextFragments, collectFragmentSourceKinds } from "./fragments";
import { loadEmailWorkflowInterpretationContext } from "./context";
import { runEmailWorkflowHeuristics } from "./heuristics";
import { runForwardPacketPlaceholderHooks } from "./extension-points";
import { writeEmailWorkflowInterpretation } from "./writeback";
import type {
  EmailWorkflowInterpretationProvenanceV1,
  EmailWorkflowInterpreterOutcome,
} from "./types";

const ENGINE_ID = "heuristic-e2a-v1";

export type RunEmailWorkflowInterpretationOptions = {
  itemId: string;
  /** Default false. */
  forceOverwriteSummaries?: boolean;
  /** Default false. When true, refresh intent/tone/esc/spam from heuristics even if already set. */
  forceOverwriteSignals?: boolean;
};

/**
 * End-to-end interpretation: load context → fragments → heuristics → compose → writeback.
 * No network calls, no OpenAI. Queue-first: may move NEW → ENRICHED; never approves or sends.
 */
export async function runEmailWorkflowInterpretation(
  opts: RunEmailWorkflowInterpretationOptions
): Promise<EmailWorkflowInterpreterOutcome> {
  const { itemId, forceOverwriteSummaries = false, forceOverwriteSignals = false } = opts;
  const ctx = await loadEmailWorkflowInterpretationContext(itemId);
  if (!ctx) {
    return { ok: false, error: "Email workflow item not found.", itemId };
  }

  const fragments = buildEmailWorkflowContextFragments(ctx);
  const signals = runEmailWorkflowHeuristics(fragments, ctx);
  const composed = composeEmailWorkflowSummaries(fragments, ctx, signals);

  const baseRow = await prisma.emailWorkflowItem.findUnique({
    where: { id: itemId },
    select: { metadataJson: true },
  });
  const baseMetadata =
    baseRow?.metadataJson && typeof baseRow.metadataJson === "object" && !Array.isArray(baseRow.metadataJson)
      ? (baseRow.metadataJson as Record<string, unknown>)
      : {};

  const sourceKinds = collectFragmentSourceKinds(fragments);
  const extension = runForwardPacketPlaceholderHooks(ctx, fragments, signals);
  const provenance: EmailWorkflowInterpretationProvenanceV1 = {
    version: 1,
    interpretedAt: new Date().toISOString(),
    sourceKinds,
    engineId: ENGINE_ID,
    notes: "Deterministic E-2A scaffolding; no LLM.",
    forwardHooks: extension,
  };

  const writeback = await writeEmailWorkflowInterpretation({
    itemId,
    forceOverwriteSummaries,
    forceOverwriteSignals,
    signals,
    composed,
    provenance,
    baseMetadata,
  });

  return {
    ok: true,
    itemId,
    fragments,
    signals,
    composed,
    writeback,
    extension,
  };
}
