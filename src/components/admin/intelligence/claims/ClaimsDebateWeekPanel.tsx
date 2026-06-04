import Link from "next/link";
import type { ClaimLedgerEntry } from "@/lib/intelligence/claims/claimLedgerTypes";

const card = "rounded-xl border border-kelly-text/10 bg-white p-4";

function tone(entry: ClaimLedgerEntry): string {
  if (entry.internalUseStatus === "DO_NOT_USE" || entry.verificationStatus === "REJECTED") {
    return "border-rose-200 bg-rose-50/60 text-rose-950";
  }
  if (entry.verificationStatus === "HUMAN_APPROVED_INTERNAL") {
    return "border-emerald-200 bg-emerald-50/50 text-emerald-950";
  }
  return "border-amber-200/60 bg-amber-50/40 text-amber-950";
}

export function ClaimsDebateWeekPanel({ claims }: { claims: ClaimLedgerEntry[] }) {
  const approved = claims.filter((c) => c.verificationStatus === "HUMAN_APPROVED_INTERNAL");
  const blocked = claims.filter((c) => c.internalUseStatus === "DO_NOT_USE" || c.verificationStatus === "REJECTED");
  const review = claims.filter(
    (c) =>
      c.verificationStatus !== "HUMAN_APPROVED_INTERNAL" &&
      c.internalUseStatus !== "DO_NOT_USE" &&
      c.verificationStatus !== "REJECTED",
  );

  return (
    <section className={`${card} mb-6 border-2 border-violet-800/20 bg-violet-50/20`}>
      <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">P2 — Debate-week claim queue</h2>
      <p className="mt-2 text-xs text-kelly-muted">
        Before stage: every line in debate prep must map here. Green = approved for internal debate rehearsal only (not
        auto-approved for TV or paid media). Red = do not say. Amber = finish sourcing or use safer wording.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <QueueColumn title={`Approved internal (${approved.length})`} items={approved.slice(0, 12)} />
        <QueueColumn title={`Needs review (${review.length})`} items={review.slice(0, 12)} />
        <QueueColumn title={`Do not say (${blocked.length})`} items={blocked.slice(0, 12)} />
      </div>
      <p className="mt-4 text-[10px] text-kelly-subtle">
        Workflow: open claim → verify anchors → approve internal for rehearsal, or reject. Public adaptation still
        requires human sign-off per claim detail page.
      </p>
    </section>
  );
}

function QueueColumn({ title, items }: { title: string; items: ClaimLedgerEntry[] }) {
  return (
    <div className="rounded-lg border border-kelly-text/10 bg-white p-3">
      <p className="text-[10px] font-bold uppercase text-kelly-navy">{title}</p>
      <ul className="mt-2 space-y-2 text-xs">
        {items.length === 0 ? (
          <li className="text-kelly-subtle">None</li>
        ) : (
          items.map((claim) => (
            <li key={claim.id} className={`rounded border px-2 py-1.5 ${tone(claim)}`}>
              <Link href={`/admin/intelligence/claims/${encodeURIComponent(claim.id)}`} className="font-semibold underline">
                {claim.id.replace("claim-debate-", "").slice(0, 10)}
              </Link>
              <p className="mt-1 leading-snug">{claim.claimText.slice(0, 140)}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
