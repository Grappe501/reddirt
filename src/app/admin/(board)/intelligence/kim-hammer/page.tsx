import Link from "next/link";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { loadKimHammerKh4Workbench } from "@/lib/opposition/kimHammerKh4Workbench";

const card = "rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm";

export default async function KimHammerCommandCenterPage() {
  const data = loadKimHammerWorkbench();
  const profile = loadKimHammerProfileWorkbench();
  const kh2 = loadKimHammerKh2Workbench();
  const kh3 = loadKimHammerKh3Workbench();
  const kh4 = loadKimHammerKh4Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Kim Hammer Opposition Command Center</p>
        <h1 className="font-heading text-2xl font-bold">Opposition Research + Debate Prep</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          Source-backed command view for candidate prep: pattern, verified claims, risk controls, debate frames, and research gaps.
        </p>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Bills indexed</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.totalBills}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Enacted acts</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.enactedActs}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">High-confidence themes</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.highConfidenceThemes.length}</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Claims follow-up</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.claimBuckets.needsResearch.length}</p>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Candidate Contrast Panel</h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-kelly-text/10 bg-kelly-page p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Pattern risk side</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                <li>Control / regulation / enforcement expansion pattern questions.</li>
                <li>County burden and implementation pressure points.</li>
                <li>Direct democracy and petition process tightening themes.</li>
              </ul>
            </div>
            <div className="rounded border border-kelly-text/10 bg-kelly-page p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Campaign doctrine side</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                <li>Trust, transparency, participation.</li>
                <li>Support counties and election workers.</li>
                <li>Balls-and-strikes Secretary of State office.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Open Sections</h2>
          <div className="mt-2 flex flex-col gap-2 text-xs">
            <Link href="/admin/intelligence/kim-hammer/profile" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Candidate profile</Link>
            <Link href="/admin/intelligence/kim-hammer/electoral-history" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Electoral history</Link>
            <Link href="/admin/intelligence/kim-hammer/website" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Website intelligence</Link>
            <Link href="/admin/intelligence/kim-hammer/message-analysis" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Message analysis</Link>
            <Link href="/admin/intelligence/kim-hammer/strengths-weaknesses" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Strengths & weaknesses</Link>
            <Link href="/admin/intelligence/kim-hammer/media-footprint" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Media footprint</Link>
            <Link href="/admin/intelligence/kim-hammer/public-timeline" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Public timeline</Link>
            <Link href="/admin/intelligence/kim-hammer/public-controversies" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Public controversies</Link>
            <Link href="/admin/intelligence/kim-hammer/contrast-vs-kelly" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Contrast vs Kelly</Link>
            <Link href="/admin/intelligence/kim-hammer/debate-profile" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Debate profile</Link>
            <Link href="/admin/intelligence/kim-hammer/rebuttal-prep" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Rebuttal prep</Link>
            <Link href="/admin/intelligence/kim-hammer/debate-prep" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Debate prep</Link>
            <Link href="/admin/intelligence/kim-hammer/claims-review" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Claims review</Link>
            <Link href="/admin/intelligence/kim-hammer/themes" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Themes</Link>
            <Link href="/admin/intelligence/kim-hammer/timeline" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Timeline</Link>
            <Link href="/admin/intelligence/kim-hammer/research-gaps" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Research gaps</Link>
            <Link href="/admin/intelligence/kim-hammer/intelligence-gaps" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Intelligence gaps</Link>
            <Link href="/admin/intelligence/kim-hammer/writings" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 writings archive</Link>
            <Link href="/admin/intelligence/kim-hammer/background-deep" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 background deep dive</Link>
            <Link href="/admin/intelligence/kim-hammer/management-capacity" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 management capacity</Link>
            <Link href="/admin/intelligence/kim-hammer/debate-archive" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 debate archive</Link>
            <Link href="/admin/intelligence/kim-hammer/response-model" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 response model</Link>
            <Link href="/admin/intelligence/kim-hammer/kh3-operational" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 operational layer</Link>
            <Link href="/admin/intelligence/kim-hammer/network-influence" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 network + influence</Link>
            <Link href="/admin/intelligence/kim-hammer/pattern-analysis" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 pattern analysis</Link>
            <Link href="/admin/intelligence/kim-hammer/vulnerability-matrix-kh3" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 vulnerability matrix</Link>
            <Link href="/admin/intelligence/kim-hammer/narrative-testing" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 narrative testing</Link>
            <Link href="/admin/intelligence/kim-hammer/county-exposure" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 county exposure</Link>
            <Link href="/admin/intelligence/kim-hammer/modern-sos-contrast" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 modern SOS contrast</Link>
            <Link href="/admin/intelligence/kim-hammer/rapid-response" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 rapid response</Link>
            <Link href="/admin/intelligence/kim-hammer/bill-relationship-graph" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 bill relationship graph</Link>
            <Link href="/admin/intelligence/kim-hammer/timeline-heatmap" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 timeline heatmap</Link>
            <Link href="/admin/intelligence/kim-hammer/direct-democracy" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-3 direct democracy file</Link>
            <Link href="/admin/intelligence/kim-hammer/evidence-command" className="rounded border border-kelly-navy/20 bg-kelly-page px-2 py-1 font-semibold text-kelly-navy">Evidence command center</Link>
            <Link href="/admin/intelligence/kim-hammer/public-debate-evidence" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Public debate evidence board</Link>
            <Link href="/admin/intelligence/kim-hammer/debate-packet-export" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Debate packet export</Link>
            <Link href="/admin/intelligence/kim-hammer/kh4-agent-tools" className="rounded border px-2 py-1 font-semibold text-kelly-navy">KH-4 agent tools</Link>
            <Link href="/admin/intelligence/kim-hammer/attack-surface" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Attack surface</Link>
            <Link href="/admin/intelligence/kim-hammer/intel-heat-map" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Intel heat map</Link>
            <Link href="/admin/intelligence/kim-hammer/narrative-drift-monitor" className="rounded border px-2 py-1 font-semibold text-kelly-navy">Narrative drift monitor</Link>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Public Identity + Electoral Summary</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {profile.profileHighlights.map((x) => (
              <li key={x}>{x}</li>
            ))}
            <li>Likely campaign frame: {kh2.messageAnalysis.candidateFrame.primary}</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Website Message + Source Confidence</h2>
          <p className="mt-1 text-xs text-kelly-muted">Website pages captured: {kh2.dashboardSummary.websitePagesCaptured}</p>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {kh2.websiteMessageIndex.repeatedPhrases.slice(0, 4).map((phrase) => (
              <li key={phrase.phrase}>
                "{phrase.phrase}" ({phrase.occurrences} hits)
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">KH-3 Deep Intel Snapshot</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Authored writing assets indexed: {kh3.summary.writingItems}</li>
            <li>Civic/community profile entries: {kh3.summary.civicItems}</li>
            <li>Management-capacity signals: {kh3.summary.managementSignals}</li>
            <li>Debate/media archive assets: {kh3.summary.debateAssets}</li>
            <li>Operational network clusters: {kh3.summary.networkClusters}</li>
            <li>Legislation pattern lanes: {kh3.summary.legislationPatterns}</li>
            <li>Vulnerability scoring rows: {kh3.summary.vulnerabilityRows}</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">KH-3 Priority Research Gaps</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {kh3.summary.topOpenGaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">KH-3 Operating System Extensions</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Narrative frames tested: {kh3.summary.narrativeFrames}</li>
            <li>County exposure segments: {kh3.summary.countyExposureSegments}</li>
            <li>Modern SOS contrast rows: {kh3.summary.contrastRows}</li>
            <li>Rapid-response evidence assets: {kh3.summary.rapidResponseAssets}</li>
            <li>Bill graph nodes: {kh3.summary.graphNodeCount}</li>
            <li>Timeline heatmap periods: {kh3.summary.heatmapPeriods}</li>
            <li>Public debate claims tracked: {kh3.summary.publicDebateItems}</li>
            <li>Public-ready claims: {kh3.summary.publicReadyClaims}</li>
            <li>KH-4 agents configured: {kh4.summary.agentCount}</li>
            <li>KH-4 attack-surface rows: {kh4.summary.riskRows}</li>
            <li>Debate export-ready claims: {kh4.summary.debateExportReady}</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">KH-3 Strategy Constraints</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {kh3.modernSosContrast.guardrails.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Top Strengths + Weaknesses</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {kh2.dashboardSummary.topStrengths.slice(0, 3).map((strength) => (
              <li key={strength.id}>Strength: {strength.strength}</li>
            ))}
            {kh2.dashboardSummary.topWeaknesses.slice(0, 3).map((weakness) => (
              <li key={weakness.id}>Weakness: {weakness.saferWording}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Do Not Say / Risky Claims</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.riskClaims.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Strongest Sourced Contrast Points</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {kh2.dashboardSummary.topContrastPoints.map((item) => (
              <li key={item.frame}>{item.kellyContrast}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Debate Prep Priority</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {kh2.dashboardSummary.debatePrepPriority.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Bill Table</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Bill</th>
                <th className="py-1.5 pr-3 font-semibold">Act</th>
                <th className="py-1.5 pr-3 font-semibold">Year</th>
                <th className="py-1.5 pr-3 font-semibold">Theme</th>
                <th className="py-1.5 pr-3 font-semibold">Role</th>
                <th className="py-1.5 pr-3 font-semibold">Confidence</th>
                <th className="py-1.5 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {data.bills.map((bill) => (
                <tr key={bill.billNumber} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{bill.billNumber}</td>
                  <td className="py-1.5 pr-3">{bill.actNumber ?? "MISSING"}</td>
                  <td className="py-1.5 pr-3">{bill.sessionYear}</td>
                  <td className="py-1.5 pr-3">{bill.topicCategory.join(", ")}</td>
                  <td className="py-1.5 pr-3">{bill.hammerRole}</td>
                  <td className="py-1.5 pr-3">{bill.confidenceLevel}</td>
                  <td className="py-1.5">
                    <Link className="font-semibold text-kelly-navy underline" href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(bill.billNumber)}`}>
                      open
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

