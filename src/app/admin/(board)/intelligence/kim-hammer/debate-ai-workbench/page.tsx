import Link from "next/link";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { CopilotToolOutputPanel } from "../../CopilotToolOutputPanel";
import { runCopilotWithLlmDraftQueue } from "@/lib/intelligence/aiCopilotOrchestrator";

export const dynamic = "force-dynamic";

const ROUTE = "/admin/intelligence/kim-hammer/debate-ai-workbench";

export default async function DebateAiWorkbenchPage() {
  const outputs = [
    runCopilotWithLlmDraftQueue("debate-question-generator", { generatedForRoute: ROUTE }),
    runCopilotWithLlmDraftQueue("answer-builder-30-60-90", { topic: "election integrity", generatedForRoute: ROUTE }),
    runCopilotWithLlmDraftQueue("what-not-to-say-detector", { generatedForRoute: ROUTE }),
    runCopilotWithLlmDraftQueue("rebuttal-builder", { generatedForRoute: ROUTE }),
  ].filter((row): row is NonNullable<typeof row> => Boolean(row));

  return (
    <KimHammerBriefingPageShell moduleId="debate-ai-workbench">
      <header className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">NSI-11 / NSI-12 · Debate AI Workbench</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Debate Intelligence Tools</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Internal debate prep only — not export-ready debate scripts. Every output shows evidence dependencies,
          doctrine alignment, and risk warnings.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/kim-hammer/debate-prep" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Debate prep (NSI-4)
          </Link>
          <Link href="/admin/intelligence/llm-review-queue" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            LLM review queue
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-xl border border-rose-200/50 bg-rose-50/40 p-4 text-xs text-rose-950">
        No export-ready debate script without human review. Trap questions and blocked narratives flagged automatically.
      </section>

      {outputs.map((output) => (
        <div key={output.deterministic.toolId}>
          <CopilotToolOutputPanel output={output.deterministic} />
          {output.llmDraftId ? (
            <p className="mb-4 text-[10px] text-violet-900">
              LLM queue draft: {output.llmDraftId} · {output.generationMode}
            </p>
          ) : null}
        </div>
      ))}
    </KimHammerBriefingPageShell>
  );
}
