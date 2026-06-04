import Link from "next/link";
import { listDebateWeekClaims } from "@/lib/intelligence/claims/debateClaimsSeed";
import { listClaimsForAdmin, summarizeClaimLedger } from "@/lib/intelligence/claims/claimLedgerSummary";
import { ClaimsDebateWeekPanel } from "@/components/admin/intelligence/claims/ClaimsDebateWeekPanel";
import { loadCitationAnchors, loadCitationSources } from "@/lib/intelligence/claims/claimLedgerStore";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { V3BackLinks, V3PageHeader } from "@/components/admin/intelligence/v3/V3PageHeader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

const card = "rounded-xl border border-kelly-text/10 bg-white p-4";

function riskTone(risk: string): string {
  if (risk === "CRITICAL") return "text-rose-900 bg-rose-50 border-rose-200";
  if (risk === "HIGH") return "text-amber-900 bg-amber-50 border-amber-200";
  return "text-kelly-muted bg-kelly-page border-kelly-text/10";
}

export default async function ClaimsLedgerPage() {
  const v4 = loadDebateIntelligenceV4HubPacket();
  const summary = tryIntelligenceLoad("claim-ledger-summary", () => summarizeClaimLedger(), {
    totalClaims: v4.hub.claims.supported.length + v4.hub.claims.partial.length + v4.hub.claims.needsResearch.length,
    verifiedClaims: v4.hub.claims.supported.length,
    inferredClaims: v4.hub.claims.partial.length,
    unsupportedClaims: 0,
    needsReviewClaims: v4.hub.claims.needsResearch.length,
    approvedInternal: 0,
    approvedPublicAdaptation: 0,
    topMissingCitationGaps: [],
    byDomain: {},
    byVerificationStatus: {},
  });
  const debateClaims = tryIntelligenceLoad("debate-week-claims", () => listDebateWeekClaims(), []);
  const claims = tryIntelligenceLoad("claim-ledger-list", () => listClaimsForAdmin().slice(0, 100), []);
  const sourceCount = tryIntelligenceLoad("citation-sources", () => loadCitationSources().sources.length, 0);
  const anchorCount = tryIntelligenceLoad("citation-anchors", () => loadCitationAnchors().anchors.length, 0);

  const markdownClaims = [
    ...v4.hub.claims.needsResearch.slice(0, 15).map((c) => ({ ...c, source: "markdown-review" })),
    ...v4.hub.claims.supported.slice(0, 5).map((c) => ({ ...c, source: "markdown-review" })),
  ];

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V3PageHeader
        eyebrow="Claims · v4"
        title="Claim trace & citation depth"
        description="Step 5 of the debate path — legal and reputational firewall. Every line Kelly plans to say in debate prep sections 11 and 24 must appear here as supported or be cut. Same gate for TV, mail, and social."
      >
        <V3BackLinks />
        <Link href="/admin/intelligence/llm-review-queue" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
          LLM review
        </Link>
      </V3PageHeader>

      {getSurfaceGuide("claims") ? <V4OperatorGuide guide={getSurfaceGuide("claims")!} /> : null}

      <ClaimsDebateWeekPanel claims={debateClaims} />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Debate-week queue</p>
          <p className="font-heading text-2xl font-bold text-violet-900">{debateClaims.length}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Total claims</p>
          <p className="font-heading text-2xl font-bold">{summary.totalClaims}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Supported / partial / needs research</p>
          <p className="text-lg font-bold">
            {v4.hub.claims.supported.length} / {v4.hub.claims.partial.length} / {v4.hub.claims.needsResearch.length}
          </p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Needs review (ledger)</p>
          <p className="font-heading text-2xl font-bold text-amber-800">{summary.needsReviewClaims}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Sources / anchors</p>
          <p className="text-lg font-bold">{sourceCount} / {anchorCount}</p>
        </div>
      </section>

      {claims.length > 0 ? (
        <section className={`${card} mb-6`}>
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Ledger queue (top 100)</h2>
          <ul className="mt-3 space-y-2 text-xs">
            {claims.slice(0, 20).map((claim) => (
              <li key={claim.id} className={`rounded border px-2 py-1.5 ${riskTone(claim.publicUseRisk)}`}>
                <Link href={`/admin/intelligence/claims/${encodeURIComponent(claim.id)}`} className="font-semibold underline">
                  {claim.id}
                </Link>
                {" — "}
                {claim.claimText.slice(0, 120)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={card}>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Claims review markdown (v4 packet)</h2>
        <ul className="mt-3 space-y-2 text-xs text-kelly-muted">
          {markdownClaims.map((row, idx) => (
            <li key={`${row.claim.slice(0, 40)}-${idx}`} className="rounded border border-kelly-text/10 p-2">
              <span className="font-semibold uppercase text-kelly-navy">{row.assessment}</span>
              <p className="mt-1">{row.claim}</p>
              {row.saferWording ? <p className="mt-1 text-emerald-900">Safer: {row.saferWording}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
