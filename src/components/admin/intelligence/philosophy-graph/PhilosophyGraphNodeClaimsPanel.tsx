import Link from "next/link";
import type { PhilosophyGraphClaimsOverlay } from "@/lib/intelligence/v4/phase11P4PhilosophyGraphClaimsDepth";
import type { ClaimLedgerEntry } from "@/lib/intelligence/claims/claimLedgerTypes";

function claimTone(claim: ClaimLedgerEntry | undefined): string {
  if (!claim) return "border-amber-200 bg-amber-50 text-amber-950";
  if (claim.verificationStatus === "HUMAN_APPROVED_INTERNAL") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (claim.verificationStatus === "REJECTED" || claim.internalUseStatus === "DO_NOT_USE") {
    return "border-rose-200 bg-rose-50 text-rose-950";
  }
  return "border-amber-200 bg-amber-50 text-amber-950";
}

export function PhilosophyGraphNodeClaimsPanel({
  overlay,
  claim,
  title,
}: {
  overlay: PhilosophyGraphClaimsOverlay;
  claim?: ClaimLedgerEntry;
  title: string;
}) {
  return (
    <section className="mb-6 rounded-xl border-2 border-violet-200/80 bg-gradient-to-br from-violet-50/50 to-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-950">Phase 11 P4 · Claims review</p>
      <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{title}</h2>

      <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${claimTone(claim)}`}>
        <p className="font-bold uppercase tracking-wider">Ledger row</p>
        {claim ? (
          <>
            <Link href={`/admin/intelligence/claims/${encodeURIComponent(claim.id)}`} className="font-semibold underline">
              {claim.id}
            </Link>
            <p className="mt-1">{claim.verificationStatus} · {claim.classification}</p>
            <p className="mt-1 leading-snug">{claim.claimText.slice(0, 200)}</p>
          </>
        ) : (
          <p>Not seeded — run philosophy graph claims seed or open upgrade pass.</p>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Stage-safe wording</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-emerald-900">
            {overlay.stageSafeWording.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Do not say</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-rose-900">
            {overlay.doNotSayLines.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Claim review steps</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {overlay.claimReviewSteps.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Operator steps</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {overlay.operatorSteps.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {overlay.intelligenceLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-bold text-violet-950"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
