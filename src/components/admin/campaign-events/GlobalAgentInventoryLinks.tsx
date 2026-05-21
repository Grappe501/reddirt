import Link from "next/link";

export function GlobalAgentInventoryLinks() {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-wash/40 p-4 font-body text-sm">
      <h2 className="font-heading text-sm font-bold text-kelly-navy">All-knowing agent layer</h2>
      <p className="mt-1 text-xs text-kelly-text/65">
        Full-repo inventory and consolidation plan — not limited to Campaign Event OS catalog entries below.
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold">
        <li>
          <Link href="/admin/ai-command-center" className="text-kelly-navy underline">
            AI command center hub
          </Link>
        </li>
        <li>
          <span className="text-kelly-text/45">Docs:</span> GLOBAL_AI_AGENT_TOOL_INVENTORY.md
        </li>
        <li>ALL_KNOWING_CAMPAIGN_AGENT_ARCHITECTURE.md</li>
        <li>AI_AGENT_OBSERVATION_AND_LEARNING_ROADMAP.md</li>
      </ul>
      <p className="mt-3 text-xs text-kelly-text/55">
        <strong>Outside RedDirt:</strong> countyWorkbench builder agents (manifest), AJAX ward/admin personas, kelly-travel-reimbursement
        LLM assist — see inventory § Sibling lanes.
      </p>
      <p className="mt-2 text-xs text-amber-900">
        <strong>Consolidate next:</strong> Kelly Agent tool bundle → master registry; Ask Kelly OpenAI tools → shared router; duplicate GCal
        push paths → single human-gated promote.
      </p>
    </section>
  );
}
