import Link from "next/link";
import {
  loadAiCopilotToolRegistry,
  recommendCopilotRuns,
} from "@/lib/intelligence/aiCopilotOrchestrator";
import { summarizeWatchlistCoverage } from "@/lib/intelligence/publicMeetingWatchlist";
import { listWritingToolboxCapabilities } from "@/lib/intelligence/aiWritingToolbox";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "opposition_research",
  "debate_prep",
  "briefing_papers",
  "writing_tools",
  "intelligence_gathering",
] as const;

export default async function AiToolsDashboardPage() {
  const registry = loadAiCopilotToolRegistry();
  const recommended = recommendCopilotRuns();
  const watchlist = summarizeWatchlistCoverage();
  const writingCaps = listWritingToolboxCapabilities();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">NSI-11 / NSI-12 · AI Tools Dashboard</p>
        <h1 className="font-heading text-2xl font-bold">Governed AI Copilot Suite</h1>
        <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
          {registry.tools.length} registered tools · NSI-12 LLM-gated drafting routes to review queue ·
          INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/llm-review-queue" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            LLM review queue (NSI-12)
          </Link>
          <Link href="/admin/intelligence/kim-hammer/ai-opposition-copilot" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Opposition copilot
          </Link>
          <Link href="/admin/intelligence/kim-hammer/debate-ai-workbench" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Debate workbench
          </Link>
          <Link href="/admin/intelligence/briefing-papers" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Briefing papers
          </Link>
          <Link href="/admin/intelligence/writing-toolbox" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Writing toolbox
          </Link>
        </div>
      </header>

      <section className="mb-6 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-xs text-amber-950">
        <p className="font-bold uppercase">Safety rules</p>
        <ul className="mt-2 list-inside list-disc">
          <li>No autonomous claim, citation, task, or export creation</li>
          <li>No paywall bypass or private social scraping</li>
          <li>No individual voter targeting</li>
          <li>All outputs require human review before any public use</li>
        </ul>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
            <p className="font-semibold text-kelly-navy">{cat.replaceAll("_", " ")}</p>
            <p className="mt-1 text-xl font-bold">{registry.tools.filter((t) => t.category === cat).length}</p>
          </div>
        ))}
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Recommended next runs</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {recommended.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Tool registry</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[10px]">
            <thead>
              <tr className="border-b text-kelly-muted">
                <th className="py-1 pr-2">Name</th>
                <th className="py-1 pr-2">Category</th>
                <th className="py-1 pr-2">Safety</th>
                <th className="py-1">Next action</th>
              </tr>
            </thead>
            <tbody>
              {registry.tools.map((tool) => (
                <tr key={tool.toolId} className="border-b border-kelly-text/5">
                  <td className="py-1 pr-2 font-semibold">{tool.name}</td>
                  <td className="py-1 pr-2">{tool.category}</td>
                  <td className="py-1 pr-2">{tool.publicationSafety}</td>
                  <td className="py-1">{tool.operatorNextAction.slice(0, 80)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="font-bold uppercase text-kelly-navy">Writing capabilities</h2>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {writingCaps.map((cap) => (
              <li key={cap}>{cap}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="font-bold uppercase text-kelly-navy">Public meeting watchlist</h2>
          <p className="mt-1">{watchlist.totalTargets} targets · {watchlist.manualReviewCount} manual review</p>
        </div>
      </section>
    </div>
  );
}
