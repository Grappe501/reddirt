import { loadKimHammerWorkbench, loadKimHammerWorkbenchHubSummary } from "@/lib/opposition/kimHammerWorkbench";
import {
  LAUNCH_CIVIC_SUMMARIES_STUB,
  LAUNCH_DEBATE_MESSAGING_STUB,
  LAUNCH_KH2_STUB,
  LAUNCH_SCENARIO_PREP_STUB,
} from "@/lib/intelligence/launchDebatePrepFastPath";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { listFlaggedBillCivicSummaries } from "@/lib/intelligence/kimHammerBillCivicIntelligence";
import { summarizeDebateCommandMessaging } from "@/lib/intelligence/campaignMessagingIntelligence";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { summarizeRegionalDeploymentConditions } from "@/lib/intelligence/regionalStrategicModeling";
import { summarizeDebateScenarioPrep } from "@/lib/intelligence/strategicScenarioSimulation";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export default async function KimHammerDebatePrepFullPage() {
  const launchMode = isIntelligenceOppositionDebateLaunchMode();
  const data = tryIntelligenceLoad(
    "kim-hammer-workbench",
    () => (launchMode ? loadKimHammerWorkbenchHubSummary() : loadKimHammerWorkbench()),
    {
    totalBills: 0,
    enactedActs: 0,
    researchConfidenceScore: 0,
    highConfidenceThemes: [],
    strongestDebateAnchors: [],
    claimBuckets: { supported: [], partial: [], needsResearch: [] },
    debateDrillQueue: [],
    riskClaims: ["Opposition dossier unavailable — redeploy with docs/opposition bundled"],
    safeLanguage: [],
    topContrastThemes: [],
    recommendedNextPass: ["Check Netlify function includes data/opposition and docs/opposition"],
    bills: [],
    topQuestions: [],
  } as unknown as ReturnType<typeof loadKimHammerWorkbenchHubSummary>);
  const fullWorkbench = data as ReturnType<typeof loadKimHammerWorkbench>;
  const reportQuestions: string[] =
    fullWorkbench.reportQuestions?.length ? fullWorkbench.reportQuestions : data.topQuestions;
  const countyOfficialConcerns: string[] = fullWorkbench.countyOfficialConcerns ?? [];
  const directDemocracyConcerns: string[] = fullWorkbench.directDemocracyConcerns ?? [];
  const kh2 = launchMode
    ? LAUNCH_KH2_STUB
    : tryIntelligenceLoad("kim-hammer-kh2", () => loadKimHammerKh2Workbench(), LAUNCH_KH2_STUB);
  const civicSummaries = launchMode ? LAUNCH_CIVIC_SUMMARIES_STUB : listFlaggedBillCivicSummaries();
  const debateMessaging = launchMode
    ? LAUNCH_DEBATE_MESSAGING_STUB
    : tryIntelligenceLoad("debate-messaging", () => summarizeDebateCommandMessaging(), LAUNCH_DEBATE_MESSAGING_STUB);
  const regional = launchMode ? null : summarizeRegionalDeploymentConditions();
  const countyBriefings = launchMode ? null : loadCountyBriefingIntelligenceIndex();
  const debateCounties = (countyBriefings?.counties ?? []).filter((row) =>
    row.briefingSignals.some((signal) => signal.signal === "COUNTY_DEBATE_RELEVANT"),
  );
  const scenarioPrep = launchMode
    ? LAUNCH_SCENARIO_PREP_STUB
    : tryIntelligenceLoad("scenario-prep", () => summarizeDebateScenarioPrep(), LAUNCH_SCENARIO_PREP_STUB);

  return (
    <KimHammerBriefingPageShell moduleId="debate-prep">
<section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">1) Debate Strategy Overview</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>Objective: educate voters on record, impact, and Secretary of State office philosophy.</li>
          <li>Study own positions and opponent bill record; rehearse mock debate and opening/closing.</li>
          <li>Answer the question first, then bridge to core values and sourced record.</li>
        </ul>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">2) Candidate Core Frame</h2>
          <p className="mt-2 text-xs text-kelly-muted">
            This race is about whether the Secretary of State office is used for more political control or rebuilt around trust,
            transparency, participation, county support, and election integrity.
          </p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">3) Three Core Debate Pillars</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Trust and transparency.</li>
            <li>Support counties and election workers.</li>
            <li>Protect participation and direct democracy while maintaining integrity.</li>
          </ul>
        </div>
      </section>

      {!launchMode && kh2.likelyArguments.arguments.length > 0 ? (
        <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">
            Likely Hammer Arguments + Evidence He May Cite
          </h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {kh2.likelyArguments.arguments.map((arg) => (
              <li key={arg.id}>
                {arg.argument} (anchors: {arg.sourceAnchors.slice(0, 2).join(" | ")})
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">4) Bill-to-Question Bank</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.topQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">5) Answer Builder</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Direct answer</li>
            <li>Sourced fact with bill/act reference</li>
            <li>Values contrast</li>
            <li>Voter/county process impact</li>
            <li>Solution + bridge line</li>
          </ul>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">6) Rebuttal Builder</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Acknowledge integrity goal where appropriate.</li>
            <li>Distinguish means and implementation effects.</li>
            <li>Return to trust/access/county-support frame.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">7) Mock Debate Drill Mode</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {data.debateDrillQueue.map((card) => (
              <li key={card.billNumber}>
                {card.billNumber}: 30s + 60s + rebuttal + follow-up (risk {card.risk})
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">8) Opening Statement Builder</h2>
          <p className="mt-2 text-xs text-kelly-muted">
            Include office philosophy, unity, trust, county support, integrity-through-transparency, and service-over-culture-war.
          </p>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">9) Closing Statement Builder</h2>
          <p className="mt-2 text-xs text-kelly-muted">
            Include voter trust, county support, participation, competence, and why this office matters to daily Arkansas life.
          </p>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">10) Attack/Defense Risk Meter</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            <li>Unsourced claim</li>
            <li>Motive claim</li>
            <li>Overstatement</li>
            <li>Legal claim needing review</li>
            <li>Personal attack / partisan overreach</li>
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">11) Reporter Question Prep</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {reportQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">12) County Clerk / Election Worker Angle</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {countyOfficialConcerns.length > 0 ? (
              countyOfficialConcerns.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>County clerk angles load from full message guidance after debate-week launch mode.</li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">13) Direct Democracy Angle</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {directDemocracyConcerns.length > 0 ? (
              directDemocracyConcerns.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>Direct-democracy critique lines load from full message guidance after debate-week launch mode.</li>
            )}
          </ul>
        </div>
      </section>

      {!launchMode && civicSummaries.length > 0 ? (
      <section className="mb-4 rounded-xl border border-indigo-200/40 bg-indigo-50/30 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">NSI-4 · Doctrine-aware debate civic intelligence</h2>
        <p className="mt-1 text-xs text-indigo-900/80">
          Philosophy-aware, county-aware civic signals for debate anchors — read-only governed synthesis.
        </p>
        <ul className="mt-3 space-y-2 text-xs text-indigo-950">
          {civicSummaries.map((row) => (
            <li key={row.billNumber} className="rounded border border-indigo-200/50 bg-white/70 p-2">
              <Link href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(row.billNumber)}`} className="font-semibold underline">
                {row.billNumber}
              </Link>
              {" · "}
              {row.civicSignal.replaceAll("_", " ")}
              <p className="mt-1 text-indigo-900/90">{row.signal.slice(0, 180)}</p>
            </li>
          ))}
        </ul>
        <ul className="mt-3 list-inside list-disc text-xs text-indigo-900">
          {debateMessaging.philosophyConsistency.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
        {debateMessaging.strategicRiskWarnings.length > 0 ? (
          <ul className="mt-2 list-inside list-disc text-xs text-amber-900">
            {debateMessaging.strategicRiskWarnings.slice(0, 4).map((row) => (
              <li key={row}>{row}</li>
            ))}
          </ul>
        ) : null}
      </section>
      ) : null}

      {!launchMode && countyBriefings && regional ? (
        <>
          <section className="mb-4 rounded-xl border border-teal-200/40 bg-teal-50/30 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-950">NSI-5 · County-specific debate guidance</h2>
            <p className="mt-1 text-xs text-teal-900/80">
              Locally relevant opponent bills, bridge lines, and what-not-to-say guidance per county briefing.
            </p>
            <Link href="/admin/intelligence/kim-hammer/county-briefings" className="mt-2 inline-block text-xs font-semibold text-teal-950 underline">
              Open county briefing index →
            </Link>
            <ul className="mt-3 space-y-2 text-xs text-teal-950">
              {debateCounties.slice(0, 5).map((county) => (
                <li key={county.countyId} className="rounded border border-teal-200/50 bg-white/70 p-2">
                  <Link href={`/admin/intelligence/kim-hammer/counties/${encodeURIComponent(county.countyId)}`} className="font-semibold underline">
                    {county.countyName}
                  </Link>
                  {county.topOpponentBills[0] ? (
                    <p className="mt-1">Top local bill: {county.topOpponentBills[0].billNumber} — {county.topOpponentBills[0].civicSignalText.slice(0, 120)}</p>
                  ) : null}
                  {county.debatePrepGuidance[0] ? <p className="mt-1">{county.debatePrepGuidance[0]}</p> : null}
                  {county.whatToAvoid[0] ? <p className="mt-1 text-amber-900">Avoid: {county.whatToAvoid[0]}</p> : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-4 rounded-xl border border-violet-200/40 bg-violet-50/30 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">NSI-6 · Regional strategic overlays</h2>
            <p className="mt-1 text-xs text-violet-900/80">County clusters, turnout-sensitive framing, and media saturation warnings — aggregate-only.</p>
            <ul className="mt-3 space-y-2 text-xs text-violet-950">
              {regional.clusters.map((cluster) => (
                <li key={cluster.clusterId} className="rounded border border-violet-200/50 bg-white/70 p-2">
                  <strong>{cluster.title}</strong> ({cluster.countyIds.join(", ")})
                  <p className="mt-1">{cluster.deploymentSummary}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      <section className="mb-4 rounded-xl border border-indigo-200/40 bg-indigo-50/30 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-950">NSI-7 · Deep brief & writing tools</h2>
        <p className="mt-1 text-xs text-indigo-900/80">
          Governed intelligence papers, target pathway warnings, and INTERNAL_DRAFT talking point helpers.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Link href="/admin/intelligence/morning-brief" className="rounded border border-indigo-900/20 bg-white px-2 py-1 font-semibold text-indigo-950">
            Morning brief
          </Link>
          <Link href="/admin/intelligence/writing-toolbox" className="rounded border border-indigo-900/20 bg-white px-2 py-1 font-semibold text-indigo-950">
            Writing toolbox
          </Link>
          <Link href="/admin/intelligence/strategic-target-pathway" className="rounded border border-indigo-900/20 bg-white px-2 py-1 font-semibold text-indigo-950">
            Target pathway
          </Link>
        </div>
        <p className="mt-2 text-[10px] text-indigo-900/70">
          Media monitoring gaps remain until NSI-8 live intake. Registration assumptions are anecdotal — validate before field reliance.
        </p>
      </section>

      <section className="mb-4 rounded-xl border border-violet-200/50 bg-violet-50/40 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">NSI-14 · Scenario-based debate prep</h2>
        <p className="mt-1 text-xs text-violet-900/80">
          SCENARIO_MODEL · INTERNAL_ONLY · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED — no auto-generated final answers.
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div className="text-xs text-violet-950">
            <p className="font-bold uppercase tracking-wider text-[10px]">Likely opponent attacks</p>
            <ul className="mt-1 list-inside list-disc">
              {scenarioPrep.likelyOpponentAttacks.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
            <p className="mt-3 font-bold uppercase tracking-wider text-[10px]">Debate trap warnings</p>
            <ul className="mt-1 list-inside list-disc text-rose-900">
              {scenarioPrep.debateTrapWarnings.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
            <p className="mt-3 font-bold uppercase tracking-wider text-[10px]">Evidence dependencies</p>
            <ul className="mt-1 list-inside list-disc">
              {scenarioPrep.evidenceDependencies.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="text-xs text-violet-950">
            <p className="font-bold uppercase tracking-wider text-[10px]">Weak citation warnings</p>
            <ul className="mt-1 list-inside list-disc">
              {scenarioPrep.weakCitationWarnings.length > 0
                ? scenarioPrep.weakCitationWarnings.map((line) => <li key={line.slice(0, 48)}>{line}</li>)
                : <li>None flagged.</li>}
            </ul>
            <p className="mt-3 font-bold uppercase tracking-wider text-[10px]">County-sensitive response notes</p>
            <ul className="mt-1 list-inside list-disc">
              {scenarioPrep.countySensitiveNotes.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
            <p className="mt-3 font-bold uppercase tracking-wider text-[10px]">Bridge line guidance</p>
            <ul className="mt-1 list-inside list-disc">
              {scenarioPrep.bridgeLineGuidance.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
            <p className="mt-3 font-bold uppercase tracking-wider text-[10px]">What not to say</p>
            <ul className="mt-1 list-inside list-disc text-rose-900">
              {scenarioPrep.whatNotToSay.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
        <Link href="/admin/intelligence/scenario-simulation" className="mt-3 inline-block text-xs font-semibold text-violet-950 underline">
          Scenario simulation dashboard →
        </Link>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">14) Debate Evidence Locker</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          <li>Bill and act links from source packet.</li>
          <li>Claims review + safe wording rows.</li>
          <li>Research gaps queue for fiscal notes, testimony, and county implementation evidence.</li>
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

