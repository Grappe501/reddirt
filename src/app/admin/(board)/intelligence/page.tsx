import Link from "next/link";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";

export const dynamic = "force-dynamic";

const card = "rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm";

export default async function OppositionIntelligenceAdminPage() {
  const data = loadKimHammerWorkbench();
  const topTheme = data.highConfidenceThemes[0];

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Opposition Research Workbench</p>
        <h1 className="font-heading text-2xl font-bold">Candidate Command View</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          First-screen briefing: what is verified, what pattern emerges, what to say, what to avoid, and what to drill today.
          Source-first and contrast-ready for debate preparation.
        </p>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Bills indexed</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.totalBills}</p>
          <p className="mt-1 text-xs text-kelly-muted">Kim Hammer election-law bill packet</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Enacted acts found</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.enactedActs}</p>
          <p className="mt-1 text-xs text-kelly-muted">Act-number confirmed in source packet</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Research confidence</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.researchConfidenceScore}%</p>
          <p className="mt-1 text-xs text-kelly-muted">High-confidence bill coverage</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Claims needing follow-up</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.claimBuckets.needsResearch.length}</p>
          <p className="mt-1 text-xs text-kelly-muted">Claims review queue</p>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">What Matters Most Tonight</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Pattern driver: <span className="font-semibold text-kelly-text">{topTheme?.theme ?? "MISSING"}</span> ({topTheme?.billCount ?? 0} bills).</li>
            <li>Strongest debate anchors: {data.strongestDebateAnchors.map((b) => b.billNumber).join(", ")}.</li>
            <li>Supported claims: {data.claimBuckets.supported.length}; partial: {data.claimBuckets.partial.length}; needs research: {data.claimBuckets.needsResearch.length}.</li>
            <li>Top risky claim bucket: motive inference and overstatement without statutory confirmation.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Open Workbench</h2>
          <div className="mt-2 flex flex-col gap-2 text-xs">
            <Link className="rounded border border-kelly-navy/30 bg-kelly-navy px-2 py-1 font-bold text-white" href="/admin/intelligence/debate-command">
              Executive Debate Command Center
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/kim-hammer">
              Kim Hammer command center
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/kim-hammer/county-briefings">
              County briefings (NSI-5)
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/campaign-intelligence-graph">
              Campaign intelligence graph (NSI-4)
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/strategy-alignment">
              Strategy alignment (SDI-1)
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/morning-brief">
              Morning brief (NSI-7)
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/strategic-target-pathway">
              Target pathway (NSI-7)
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/writing-toolbox">
              Writing toolbox (NSI-7)
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/media-intake">
              Media intake (NSI-8)
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/intelligence-memory">
              Intelligence memory (NSI-13)
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/scenario-simulation">
              Scenario simulation (NSI-14)
            </Link>
            <Link className="rounded border border-teal-700/30 bg-teal-50 px-2 py-1 font-semibold text-teal-900" href="/admin/intelligence/action-queue">
              Human action queue (NSI-15)
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/kim-hammer/debate-prep">
              Debate prep center
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/kim-hammer/claims-review">
              Claims hygiene
            </Link>
            <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/kim-hammer/research-gaps">
              Research gaps
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.highConfidenceThemes.map((theme) => (
          <div key={theme.theme} className={card}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{theme.theme.replaceAll("_", " ")}</p>
            <p className="mt-1 font-heading text-xl font-bold">{theme.billCount} bills</p>
            <p className="mt-1 text-xs text-kelly-muted">Pattern panel input</p>
          </div>
        ))}
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Debate Drill Queue</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.debateDrillQueue.slice(0, 5).map((cardItem) => (
              <li key={cardItem.billNumber}>
                {cardItem.billNumber}: {cardItem.prompt}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Do Not Say / Risk Claims</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.riskClaims.slice(0, 6).map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">What To Say (Source-Grounded)</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.safeLanguage.slice(0, 5).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Top Contrast Themes</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.topContrastThemes.map((theme) => (
              <li key={theme}>{theme.replaceAll("_", " ")}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Research Gap Queue</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.recommendedNextPass.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Bill Risk / Opportunity Table</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Bill</th>
                <th className="py-1.5 pr-3 font-semibold">Act</th>
                <th className="py-1.5 pr-3 font-semibold">Session</th>
                <th className="py-1.5 pr-3 font-semibold">Theme</th>
                <th className="py-1.5 pr-3 font-semibold">Confidence</th>
                <th className="py-1.5 pr-3 font-semibold">Debate use</th>
                <th className="py-1.5 font-semibold">Open</th>
              </tr>
            </thead>
            <tbody>
              {data.bills.map((row) => (
                <tr key={row.billNumber} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{row.billNumber}</td>
                  <td className="py-1.5 pr-3">{row.actNumber ?? "MISSING"}</td>
                  <td className="py-1.5 pr-3">{row.sessionYear}</td>
                  <td className="py-1.5 pr-3">{row.topicCategory[0] ?? "unclassified_election_topic"}</td>
                  <td className="py-1.5 pr-3">{row.confidenceLevel}</td>
                  <td className="py-1.5 pr-3">{row.confidenceLevel === "HIGH" ? "HIGH" : "MEDIUM"}</td>
                  <td className="py-1.5">
                    <Link href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(row.billNumber)}`} className="font-semibold text-kelly-navy underline">
                      view
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

