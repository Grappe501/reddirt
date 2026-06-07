import Link from "next/link";
import { Phase11P4UpgradePassPanel } from "@/components/admin/intelligence/Phase11P4UpgradePassPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  assertPhase11P4Bar,
  computePhase11P4UpgradePass,
  listPhilosophyGraphNodeSurfaces,
  PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF,
} from "@/lib/intelligence/v4/phase11P4Closure";
import { getPhilosophyGraphClaimsOverlay } from "@/lib/intelligence/v4/phase11P4PhilosophyGraphClaimsDepth";

export const dynamic = "force-dynamic";

export default function Phase11P4UpgradePage() {
  const report = computePhase11P4UpgradePass();
  const bar = assertPhase11P4Bar();
  const nodes = listPhilosophyGraphNodeSurfaces();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Intelligence upgrade · Phase 11 P4"
        title="Philosophy graph claims review"
        description="Exit gate for binding all eight NSI-4 philosophy graph nodes to governed claim ledger rows with P4 review workflow overlays."
      >
        <V4BackLinks />
        <Link
          href={PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF}
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Philosophy claims hub
        </Link>
        <Link
          href="/admin/intelligence/campaign-intelligence-graph"
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Intelligence graph
        </Link>
      </V4PageHeader>

      <Phase11P4UpgradePassPanel report={report} />

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Exit gate</h2>
        <p className={`mt-2 text-sm font-semibold ${bar.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {bar.ok ? "Phase 11 P4 bar met" : bar.message}
        </p>
        {!bar.ok ? (
          <p className="mt-2 text-xs text-kelly-muted">
            Run: <code>npx tsx scripts/seed-philosophy-graph-claims.ts</code> if claims count is low.
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        {nodes.map((node) => {
          const overlay = getPhilosophyGraphClaimsOverlay(node.philosophyId);
          return (
            <article key={node.philosophyId} className="rounded-xl border border-violet-100 bg-white p-4 text-sm">
              <Link href={node.href} className="font-bold text-kelly-navy underline">
                {node.title}
              </Link>
              <p className="mt-1 text-xs text-kelly-muted">{overlay.claimReviewSteps[0]}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
