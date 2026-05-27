import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

export default async function KimHammerWebsiteIntelligencePage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Website Intelligence</p>
        <h1 className="font-heading text-2xl font-bold">Kim Hammer Website Capture</h1>
      </header>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Campaign Message Snapshot</h2>
        <p className="mt-1 text-xs text-kelly-muted">Pages captured: {data.websitePages.pages.length}</p>
        <p className="mt-1 text-xs text-kelly-muted">Frame summary: {data.websiteMessageIndex.campaignFrameSummary.label}</p>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.websiteMessageIndex.repeatedPhrases.map((item) => (
            <li key={item.phrase}>
              "{item.phrase}" ({item.occurrences})
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Claims + Fact-Check Status</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.websiteClaimsReview.claims.map((claim) => (
            <li key={claim.claim}>
              {claim.claim} ({claim.evidenceStatus}; {claim.factCheckStatus})
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Captured Pages</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Title</th>
                <th className="py-1.5 pr-3 font-semibold">URL</th>
                <th className="py-1.5 pr-3 font-semibold">Captured</th>
                <th className="py-1.5 pr-3 font-semibold">Claims</th>
                <th className="py-1.5 pr-3 font-semibold">Values</th>
                <th className="py-1.5 font-semibold">SOS/election claims</th>
              </tr>
            </thead>
            <tbody>
              {data.websitePages.pages.map((page) => (
                <tr key={page.url} className="border-b border-kelly-text/5 align-top">
                  <td className="py-1.5 pr-3">{page.pageTitle}</td>
                  <td className="py-1.5 pr-3">
                    <a className="underline text-kelly-navy" href={page.url} target="_blank" rel="noreferrer">
                      {page.url}
                    </a>
                  </td>
                  <td className="py-1.5 pr-3">{page.capturedAt}</td>
                  <td className="py-1.5 pr-3">{page.claims.join(" | ") || "NONE"}</td>
                  <td className="py-1.5 pr-3">{page.valuesLanguage.join(", ") || "NONE"}</td>
                  <td className="py-1.5">{page.electionOrSosClaims.join(" | ") || "NONE"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

