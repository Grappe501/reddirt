import Link from "next/link";
import {
  Phase10UpgradePassPanel,
  StrategyPhilosophyInventoryPanel,
} from "@/components/admin/intelligence/Phase10UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadEnrichedCampaignPhilosophyGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import { computePhase10UpgradePass } from "@/lib/intelligence/v4/phase10StrategyPhilosophyClosure";
import { listAllStrategyPhilosophySurfaces } from "@/lib/intelligence/v4/strategyPhilosophyInventory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function StrategyPhilosophyHubPage() {
  const report = computePhase10UpgradePass();
  const surfaces = listAllStrategyPhilosophySurfaces();
  const philosophy = loadEnrichedCampaignPhilosophyGraph();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence command · Phase 10"
        title="Strategy & political philosophy command"
        description="Unified inventory and depth crosswalk — debate philosophy briefings, psychology manual, civic philosophy graph, Kelly strategic plan manual, and intelligence strategy surfaces wired to the same depth standard as dossier and debate prep."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/debate-briefings"
          className="rounded-full border border-fuchsia-300 bg-fuchsia-50 px-3 py-1 text-xs font-bold text-fuchsia-950"
        >
          Philosophy briefings
        </Link>
        <Link
          href="/admin/campaign-strategy/framework"
          className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Theory of change
        </Link>
        <Link
          href="/admin/intelligence/strategy-alignment"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Strategy alignment
        </Link>
        <Link
          href="/admin/intelligence/phase-9-upgrade"
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          Phase 9 bridge
        </Link>
      </V4PageHeader>

      <Phase10UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-indigo-200 bg-indigo-50/30 p-6">
        <h2 className="font-heading text-xl font-bold text-indigo-950">Enriched civic philosophy graph</h2>
        <p className="mt-2 text-sm text-kelly-muted">
          Eight NSI-4 philosophy nodes with Phase 10 debate application, Kelly SOS framing, and intelligence cross-links.
        </p>
        <ul className="mt-4 space-y-4">
          {philosophy.nodes.map((node) => (
            <li key={node.philosophyId} id={node.philosophyId} className="rounded-lg border border-white bg-white p-4 text-sm">
              <p className="font-bold text-kelly-navy">{node.title}</p>
              <p className="mt-1 text-kelly-muted">{node.principle}</p>
              <p className="mt-2 text-xs font-semibold uppercase text-indigo-900">Debate application</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {node.debateApplication.map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs font-semibold uppercase text-indigo-900">Kelly SOS framing</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {node.kellySosFraming.map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                {node.intelligenceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <StrategyPhilosophyInventoryPanel surfaces={surfaces} />

      <section className="mb-8 rounded-xl border border-kelly-navy/15 bg-white p-6 text-sm">
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Analysis summary</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-kelly-muted">
          <li>
            <strong>Debate political philosophy (8 briefings)</strong> — handling methods for agree-then-contrast, author vs
            administrator, clerk partnership, pile-on survival, rebuttal architecture, presence, integrity framing, and direct
            democracy offense. Phase 10 adds framework crosswalk, psychology links, and strategy-alignment hooks.
          </li>
          <li>
            <strong>Psychology manual (19 sections)</strong> — emotional decision-making, atmosphere management, Hammer/Pakko
            profiles, trust equation, ACCA three-way context. Phase 10 crosswalks each section to philosophy briefings and Kelly
            manual chapters.
          </li>
          <li>
            <strong>Civic philosophy graph (8 nodes)</strong> — civic trust, transparency, participation, county partnership,
            modernization, citizen empowerment, anti-centralization, direct democracy. Enriched with debate application prose at
            read time.
          </li>
          <li>
            <strong>Kelly SOS strategic plan manual (22 chapters)</strong> — theory of change in framework chapter is the
            strategic philosophy spine; reader at /admin/campaign-strategy with Strategy Partner RAG.
          </li>
          <li>
            <strong>Campaign system manual (~252 files)</strong> — operational corpus chunked for agents; accessible via Strategy
            Partner and chunks API.
          </li>
          <li>
            <strong>Intelligence strategy surfaces</strong> — opposition strategy v6.2, SDI-1 alignment, target pathway, scenario
            simulation, campaign intelligence graph — all linked from this hub.
          </li>
        </ul>
      </section>
    </div>
  );
}
