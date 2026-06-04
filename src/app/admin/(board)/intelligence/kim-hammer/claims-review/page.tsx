import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { parseClaimsReview } from "@/lib/opposition/kimHammerWorkbench";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { listDebateWeekClaims } from "@/lib/intelligence/claims/debateClaimsSeed";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { ClaimsDebateWeekPanel } from "@/components/admin/intelligence/claims/ClaimsDebateWeekPanel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

/** Netlify-safe claims review — markdown table + ledger queue (no full workbench graph). */
export default function KimHammerClaimsReviewPage() {
  const v4 = loadDebateIntelligenceV4HubPacket();
  const debateClaims = tryIntelligenceLoad("debate-week-claims", () => listDebateWeekClaims(), []);

  const claimsMd = fs.readFileSync(
    path.join(process.cwd(), "docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md"),
    "utf8",
  );
  const tableRows = parseClaimsReview(claimsMd);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Claims review · P2"
        title="Election-record claims review"
        description="Synopsis claim checks from KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md, synced to the governed ledger for debate-week gatekeeping. Use safer wording columns on stage; open ledger rows for approval workflow."
        guide={getSurfaceGuide("claims")}
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/claims"
          className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Full ledger
        </Link>
      </V4PageHeader>

      <ClaimsDebateWeekPanel claims={debateClaims} />

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Markdown supported</p>
          <p className="font-heading text-2xl font-bold">{v4.hub.claims.supported.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Needs research</p>
          <p className="font-heading text-2xl font-bold text-amber-800">{v4.hub.claims.needsResearch.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Ledger debate rows</p>
          <p className="font-heading text-2xl font-bold">{debateClaims.length}</p>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Synopsis claim checks</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Claim</th>
                <th className="py-1.5 pr-3 font-semibold">Assessment</th>
                <th className="py-1.5 pr-3 font-semibold">Safer wording (use on stage)</th>
                <th className="py-1.5 font-semibold">Source needed</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.claim} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3 max-w-xs">{row.claim}</td>
                  <td className="py-1.5 pr-3 font-semibold uppercase">{row.assessment}</td>
                  <td className="py-1.5 pr-3 text-emerald-900">{row.saferWording}</td>
                  <td className="py-1.5">{row.sourceNeeded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
