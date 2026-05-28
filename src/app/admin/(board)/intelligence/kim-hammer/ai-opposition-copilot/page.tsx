import Link from "next/link";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { CopilotToolOutputPanel } from "../../CopilotToolOutputPanel";
import {
  loadAiCopilotToolRegistry,
  runCopilotWithLlmDraftQueue,
} from "@/lib/intelligence/aiCopilotOrchestrator";

export const dynamic = "force-dynamic";

export default async function AiOppositionCopilotPage() {
  const registry = loadAiCopilotToolRegistry();
  const oppositionTools = registry.tools.filter((row) => row.category === "opposition_research");

  const outputs = [
    runCopilotWithLlmDraftQueue("vulnerability-finder", { generatedForRoute: "/admin/intelligence/kim-hammer/ai-opposition-copilot" }),
    runCopilotWithLlmDraftQueue("contradiction-scout", { generatedForRoute: "/admin/intelligence/kim-hammer/ai-opposition-copilot" }),
    runCopilotWithLlmDraftQueue("source-gap-finder", { generatedForRoute: "/admin/intelligence/kim-hammer/ai-opposition-copilot" }),
    runCopilotWithLlmDraftQueue("bill-impact-analyzer", { billNumber: "SB487", generatedForRoute: "/admin/intelligence/kim-hammer/ai-opposition-copilot" }),
  ].filter((row): row is NonNullable<typeof row> => Boolean(row));

  return (
    <KimHammerBriefingPageShell moduleId="ai-opposition-copilot">
      <header className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">NSI-11 / NSI-12 · Opposition Research AI Copilot</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Opposition Research Workbench</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Deterministic synthesis + optional LLM-gated drafts (NSI-12). All outputs route to LLM review queue.
          INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/llm-review-queue" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            LLM review queue
          </Link>
          <Link href="/admin/intelligence/ai-tools" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            AI tools dashboard
          </Link>
          <Link href="/admin/intelligence/kim-hammer/evidence-command" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Evidence Command
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
        Registered opposition tools: {oppositionTools.length}. Outputs remain internal prep only.
      </section>

      {outputs.map((output) => (
        <div key={output.deterministic.toolId}>
          <CopilotToolOutputPanel output={output.deterministic} />
          {output.llmDraftId ? (
            <p className="mb-4 text-[10px] text-violet-900">
              LLM queue draft: {output.llmDraftId} · mode: {output.generationMode ?? "DETERMINISTIC_SYNTHESIS"}
            </p>
          ) : null}
        </div>
      ))}
    </KimHammerBriefingPageShell>
  );
}
