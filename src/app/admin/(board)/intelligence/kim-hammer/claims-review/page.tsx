import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerClaimsReviewPage() {
  const data = loadKimHammerWorkbench();
  const kh2 = loadKimHammerKh2Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="claims-review">
<section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Supported</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.claimBuckets.supported.map((row) => (
              <li key={row.claim}>{row.claim}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Partially Supported</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.claimBuckets.partial.map((row) => (
              <li key={row.claim}>{row.claim}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Needs Research</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.claimBuckets.needsResearch.map((row) => (
              <li key={row.claim}>{row.claim}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Unsupported</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.claimBuckets.unsupported.map((row) => (
              <li key={row.claim}>{row.claim}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Safer Wording + Prohibited Wording</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Claim</th>
                <th className="py-1.5 pr-3 font-semibold">Assessment</th>
                <th className="py-1.5 pr-3 font-semibold">Safer wording</th>
                <th className="py-1.5 font-semibold">Source needed</th>
              </tr>
            </thead>
            <tbody>
              {data.claims.map((row) => (
                <tr key={row.claim} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{row.claim}</td>
                  <td className="py-1.5 pr-3">{row.assessment}</td>
                  <td className="py-1.5 pr-3">{row.saferWording}</td>
                  <td className="py-1.5">{row.sourceNeeded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Public Claims Index (KH-2)</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {kh2.publicClaims.claims.map((claim) => (
            <li key={claim.claimId}>
              {claim.statement} ({claim.evidenceStatus}; {claim.sourceConfidence})
            </li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

