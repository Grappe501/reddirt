import Link from "next/link";
import type { ClaimLedgerEntry } from "@/lib/intelligence/claims/claimLedgerTypes";
import type { PhilosophyGraphNodeSurface } from "@/lib/intelligence/v4/phase11P4Closure";

export function PhilosophyGraphClaimsQueuePanel({
  nodes,
  claims,
}: {
  nodes: PhilosophyGraphNodeSurface[];
  claims: ClaimLedgerEntry[];
}) {
  const byId = new Map(claims.map((c) => [c.id, c]));
  const approved = claims.filter((c) => c.verificationStatus === "HUMAN_APPROVED_INTERNAL");
  const review = claims.filter(
    (c) => c.verificationStatus !== "HUMAN_APPROVED_INTERNAL" && c.verificationStatus !== "REJECTED",
  );
  const blocked = claims.filter((c) => c.verificationStatus === "REJECTED" || c.internalUseStatus === "DO_NOT_USE");

  return (
    <section className="mb-6 rounded-xl border-2 border-violet-300/60 bg-gradient-to-br from-violet-50/40 to-white p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">Philosophy graph claim queue</h2>
      <p className="mt-2 text-xs text-kelly-muted">
        Eight NSI-4 philosophy nodes — each maps to a governed ledger row. Clear NEEDS_REVIEW before debate prep cites
        graph principles on stage.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Approved internal" value={approved.length} />
        <Stat label="Needs review" value={review.length} />
        <Stat label="Blocked" value={blocked.length} />
      </div>

      <ul className="mt-4 space-y-2">
        {nodes.map((node) => {
          const claim = byId.get(node.claimId);
          const status = claim?.verificationStatus ?? "UNSEEDED";
          return (
            <li key={node.philosophyId} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2 text-sm">
              <Link href={node.href} className="font-semibold text-kelly-navy underline">
                {node.title}
              </Link>
              <p className="mt-0.5 text-[10px] text-kelly-muted">
                {node.phase11P4Enriched ? "P4 enriched" : "needs overlay"} · graph {node.reviewStatus} · claim {status}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2">
      <p className="text-[10px] font-bold uppercase text-kelly-subtle">{label}</p>
      <p className="font-heading text-2xl font-bold text-kelly-navy">{value}</p>
    </div>
  );
}
