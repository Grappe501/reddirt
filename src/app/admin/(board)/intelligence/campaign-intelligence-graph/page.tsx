import Link from "next/link";
import {
  auditCampaignIntelligenceGraphLinks,
  getGraphDomainsUnified,
  loadCampaignIntelligenceGraph,
  loadEnrichedCampaignPhilosophyGraph,
  summarizeCampaignIntelligenceGraph,
} from "@/lib/intelligence/campaignIntelligenceGraph";

export default async function CampaignIntelligenceGraphPage() {
  const graph = loadCampaignIntelligenceGraph();
  const philosophy = loadEnrichedCampaignPhilosophyGraph();
  const summary = summarizeCampaignIntelligenceGraph();
  const audit = auditCampaignIntelligenceGraphLinks();
  const domains = getGraphDomainsUnified();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          NSI-4 · Unified Campaign Intelligence Graph
        </p>
        <h1 className="font-heading text-2xl font-bold">Campaign Intelligence Graph</h1>
        <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
          Read-only entity resolution across bills, narratives, doctrines, counties, exports, and civic philosophy.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/strategy-philosophy-hub" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Strategy & philosophy hub
          </Link>
          <Link href="/admin/intelligence/strategy-alignment" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            SDI-1 alignment
          </Link>
          <Link href="/admin/intelligence/debate-command" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Debate command
          </Link>
          <Link href="/admin/intelligence/philosophy-graph-claims-review" className="rounded border px-2 py-1 font-semibold text-kelly-navy">
            Philosophy claims review
          </Link>
        </div>
      </header>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Entities</p>
          <p className="mt-1 text-xl font-bold">{summary.entityCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Bills</p>
          <p className="mt-1 text-xl font-bold">{summary.billCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Narratives</p>
          <p className="mt-1 text-xl font-bold">{summary.narrativeCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Doctrines</p>
          <p className="mt-1 text-xl font-bold">{summary.doctrineCount}</p>
        </div>
        <div className="rounded-md border border-kelly-text/10 bg-white px-3 py-2 text-xs">
          <p className="font-semibold text-kelly-navy">Philosophy nodes</p>
          <p className="mt-1 text-xl font-bold">{summary.philosophyCount}</p>
        </div>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Graph domains unified</h2>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3 text-kelly-muted">
          {domains.map((domain) => (
            <li key={domain}>· {domain}</li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Valid internal links: {audit.validLinks} · Broken: {audit.brokenLinks.length}
        </p>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Philosophy graph</h2>
        <ul className="mt-2 space-y-2">
          {philosophy.nodes.map((node) => (
            <li key={node.philosophyId} className="rounded border border-kelly-text/10 p-2">
              <strong>{node.title}</strong> — {node.principle.slice(0, 120)}
              <p className="mt-1 text-[10px] text-kelly-muted">{node.debateApplication[0]}</p>
              <Link href={`/admin/intelligence/strategy-philosophy-hub#${node.philosophyId}`} className="text-[10px] font-bold text-indigo-900 underline">
                Full depth →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Entity registry (sample)</h2>
        <div className="mt-2 max-h-[480px] overflow-y-auto">
          <table className="w-full min-w-[720px] text-left text-[10px]">
            <thead className="text-kelly-subtle">
              <tr>
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Type</th>
                <th className="px-2 py-1">Title</th>
                <th className="px-2 py-1">Links</th>
              </tr>
            </thead>
            <tbody>
              {graph.entities.slice(0, 40).map((entity) => (
                <tr key={entity.entityId} className="border-t border-kelly-text/10">
                  <td className="px-2 py-2 font-mono">{entity.entityId}</td>
                  <td className="px-2 py-2">{entity.entityType}</td>
                  <td className="px-2 py-2">{entity.title}</td>
                  <td className="px-2 py-2">{entity.linkedEntities.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
