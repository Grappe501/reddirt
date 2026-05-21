import Link from "next/link";
import { countMasterRegistryByStatus, listMasterRegistryTools, MASTER_TOOL_REGISTRY_VERSION } from "@/lib/agents/master-tool-registry";

export const dynamic = "force-dynamic";

const DOC_LINKS = [
  { href: "/admin/campaign-events/ai-tools", label: "Campaign Event OS — AI Tool Command Center (live)" },
  { label: "Global inventory", href: "docs", file: "docs/campaign-events/GLOBAL_AI_AGENT_TOOL_INVENTORY.md" },
  { label: "All-knowing architecture", href: "docs", file: "docs/campaign-events/ALL_KNOWING_CAMPAIGN_AGENT_ARCHITECTURE.md" },
  { label: "Observation & learning", href: "docs", file: "docs/campaign-events/AI_AGENT_OBSERVATION_AND_LEARNING_ROADMAP.md" },
  { label: "AI brain map (RedDirt)", href: "docs", file: "docs/ai-agent-brain-map.md" },
] as const;

export default async function AiCommandCenterHubPage() {
  const counts = countMasterRegistryByStatus();
  const globalTools = listMasterRegistryTools().filter((t) => t.domain === "global_orchestration");

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/20 bg-kelly-navy/[0.05] p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-kelly-slate">Campaign OS · agent layer</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-navy">AI command center (hub)</h1>
        <p className="mt-3 max-w-2xl text-sm text-kelly-text/75">
          Placeholder hub for the <strong>All-Knowing Campaign Agent</strong>. Operational tooling, catalogs, and sprint
          pipelines live on the Campaign Event OS AI page until cross-domain UI is built. Registry version:{" "}
          <code className="text-xs">{MASTER_TOOL_REGISTRY_VERSION}</code>.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/campaign-events/ai-tools"
            className="rounded-full bg-kelly-navy px-5 py-2 text-sm font-bold text-white"
          >
            Open live AI tool command center
          </Link>
          <Link href="/admin/ask-kelly" className="rounded-full border px-5 py-2 text-sm font-bold">
            Ask Kelly (admin)
          </Link>
          <Link href="/admin/campaign-events/calendar-promotion" className="rounded-full border px-5 py-2 text-sm font-bold">
            Calendar promotion
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-lg font-bold">Registry snapshot (RedDirt catalog)</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-bold text-kelly-slate">Total tools</dt>
            <dd className="text-2xl font-bold">{counts.total}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-kelly-slate">Functional</dt>
            <dd className="text-2xl font-bold text-emerald-800">{counts.functional}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-kelly-slate">Global orchestration</dt>
            <dd className="text-2xl font-bold">{globalTools.length}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-kelly-slate">Idea / scaffold</dt>
            <dd className="text-2xl font-bold text-kelly-text/70">{counts.idea + counts.scaffolded}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-kelly-text/55">
          Counts from <code>src/lib/agents/master-tool-registry/</code> — Kelly Agent, compliance, and countyWorkbench
          tools are documented in the global inventory but not yet imported into this registry.
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <h2 className="font-heading text-lg font-bold">Architecture docs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {DOC_LINKS.map((d) => (
            <li key={d.label}>
              <span className="font-semibold">{d.label}</span>
              {"file" in d ? (
                <span className="ml-2 font-mono text-xs text-kelly-text/50">{d.file}</span>
              ) : (
                <Link href={d.href} className="ml-2 font-bold text-kelly-navy underline">
                  {d.href}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-600/25 bg-amber-50/80 p-5 text-sm text-amber-950">
        <h2 className="font-heading font-bold">Consolidation status</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Three parallel stacks today: Ask Kelly (RAG LLM), Kelly Agent (admin tool bundle), Campaign Event OS (catalog + contracts).</li>
          <li>Legacy <code>pushCampaignEventToGoogle</code> still bypasses Event OS — see inventory § Calendar.</li>
          <li>countyWorkbench agents are doc/manifest-driven — no RedDirt import until integration packet.</li>
        </ul>
      </section>
    </div>
  );
}
