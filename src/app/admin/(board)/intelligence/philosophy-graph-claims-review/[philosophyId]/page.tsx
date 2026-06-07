import Link from "next/link";
import { notFound } from "next/navigation";
import { PhilosophyGraphNodeClaimsPanel } from "@/components/admin/intelligence/philosophy-graph/PhilosophyGraphNodeClaimsPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadEnrichedCampaignPhilosophyGraph } from "@/lib/intelligence/campaignIntelligenceGraph";
import { resolvePhilosophyGraphClaim } from "@/lib/intelligence/claims/philosophyGraphClaimsSeed";
import {
  getPhilosophyGraphClaimsOverlay,
  PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF,
} from "@/lib/intelligence/v4/phase11P4PhilosophyGraphClaimsDepth";

type Props = {
  params: Promise<{ philosophyId: string }>;
};

export const dynamic = "force-dynamic";

export default async function PhilosophyGraphNodeClaimsPage({ params }: Props) {
  const { philosophyId } = await params;
  const philosophy = loadEnrichedCampaignPhilosophyGraph();
  const node = philosophy.nodes.find((n) => n.philosophyId === philosophyId);
  if (!node) notFound();

  const overlay = getPhilosophyGraphClaimsOverlay(philosophyId);
  const claim = resolvePhilosophyGraphClaim(philosophyId);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Philosophy graph · Claims review"
        title={node.title}
        description={node.principle}
      >
        <V4BackLinks />
        <Link
          href={PHILOSOPHY_GRAPH_CLAIMS_HUB_HREF}
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-950"
        >
          Claims hub
        </Link>
        {claim ? (
          <Link
            href={`/admin/intelligence/claims/${encodeURIComponent(claim.id)}`}
            className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
          >
            Open ledger row
          </Link>
        ) : null}
      </V4PageHeader>

      <PhilosophyGraphNodeClaimsPanel overlay={overlay} claim={claim} title={node.title} />

      <section className="rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Graph node detail</h2>
        <p className="mt-2 text-xs text-kelly-muted">Category: {node.category} · Review: {node.reviewStatus}</p>
        <p className="mt-2 text-xs text-kelly-muted">
          Doctrines: {node.linkedDoctrines.join(", ") || "—"} · Bills: {node.linkedBills.join(", ") || "—"}
        </p>
        <ul className="mt-3 list-inside list-disc text-xs text-kelly-muted">
          {node.debateApplication.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
