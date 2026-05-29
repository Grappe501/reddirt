import Link from "next/link";
import type { CountyBriefingIntelligence } from "@/lib/intelligence/types/countyBriefingIntelligence";
import type { BorderCountyMediaProfile } from "@/lib/intelligence/types/mediaMarketIntelligence";
import type { CountyScenarioWatchSummary } from "@/lib/intelligence/types/strategicScenarioSimulation";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-xl border border-kelly-text/10 bg-white p-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{title}</h2>
      <div className="mt-2 text-xs text-kelly-muted">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-kelly-subtle">None flagged.</p>;
  return (
    <ul className="list-inside list-disc space-y-1">
      {items.map((item) => (
        <li key={item.slice(0, 48)}>{item}</li>
      ))}
    </ul>
  );
}

export function KimHammerCountyBriefingPanel({
  briefing,
  mediaProfile,
  scenarioWatch,
}: {
  briefing: CountyBriefingIntelligence;
  mediaProfile?: BorderCountyMediaProfile | null;
  scenarioWatch?: CountyScenarioWatchSummary;
}) {
  return (
    <>
      <section className="mb-4 rounded-xl border border-emerald-200/50 bg-emerald-50/40 p-4 text-xs">
        <p className="font-bold uppercase tracking-wider text-emerald-950">NSI-5 · County briefing intelligence</p>
        <p className="mt-1 text-emerald-900/90">
          {briefing.region} · Confidence: {briefing.confidenceBand} · Local risk: {briefing.localRiskLevel}
        </p>
        <ul className="mt-2 space-y-1 text-emerald-950">
          {briefing.briefingSignals.map((row) => (
            <li key={row.signal}>
              <span className="font-semibold">{row.signal.replaceAll("_", " ")}</span>: {row.text}
            </li>
          ))}
        </ul>
      </section>

      <Section title="1) County strategic summary">
        <BulletList items={briefing.countyStrategyNotes} />
      </Section>

      <Section title="2) How we message here">
        <BulletList items={briefing.recommendedMessagingFrames} />
        <p className="mt-2 font-semibold text-kelly-navy">Doctrine alignment</p>
        <BulletList items={briefing.doctrineAlignmentSummary} />
      </Section>

      <Section title="3) Opponent bills to point out here">
        {briefing.topOpponentBills.length === 0 ? (
          <p>No ranked local bill priorities — see statewide opposition packet.</p>
        ) : (
          <ul className="space-y-2">
            {briefing.topOpponentBills.map((bill) => (
              <li key={bill.billNumber} className="rounded border border-kelly-text/10 p-2">
                <Link
                  href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(bill.billNumber)}`}
                  className="font-semibold text-kelly-navy underline"
                >
                  {bill.billNumber}
                </Link>
                {" · "}
                {bill.civicSignal.replaceAll("_", " ")} (score {bill.localRelevanceScore})
                <p className="mt-1">{bill.localReason}</p>
                <p className="mt-1 text-kelly-subtle">{bill.civicSignalText.slice(0, 160)}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="4) Local voter impact">
        <BulletList items={briefing.civicImpactSummary} />
      </Section>

      <Section title="5) Ballot initiative / direct democracy impact">
        <BulletList items={briefing.ballotInitiativeImpact} />
      </Section>

      <Section title="6) Election integrity & transparency">
        <BulletList items={[...briefing.electionIntegrityImpact, ...briefing.transparencyAccountabilityImpact]} />
      </Section>

      <Section title="7) County operations & burden">
        <BulletList items={briefing.countyOperationsImpact} />
      </Section>

      <Section title="8) Debate / forum prep">
        <BulletList items={briefing.debatePrepGuidance} />
        {briefing.topNarratives.length > 0 ? (
          <>
            <p className="mt-2 font-semibold text-kelly-navy">Strongest local narratives</p>
            <ul className="list-inside list-disc">
              {briefing.topNarratives.map((row) => (
                <li key={row.narrativeId}>{row.narrativeTitle}: {row.signalText.slice(0, 120)}</li>
              ))}
            </ul>
          </>
        ) : null}
      </Section>

      <Section title="9) Volunteer & surrogate notes">
        <BulletList items={briefing.volunteerSurrogateGuidance} />
        {briefing.exportReadyTalkingPoints.length > 0 ? (
          <>
            <p className="mt-2 font-semibold text-kelly-navy">Export-ready talking points</p>
            <BulletList items={briefing.exportReadyTalkingPoints} />
          </>
        ) : null}
      </Section>

      <Section title="10) What to avoid">
        <BulletList items={briefing.whatToAvoid} />
        <BulletList items={briefing.localRiskSummary} />
      </Section>

      <Section title="11) Evidence & citation status">
        <p className="font-semibold text-kelly-navy">Strongest</p>
        <BulletList items={briefing.strongestEvidence} />
        <p className="mt-2 font-semibold text-kelly-navy">Weakest / blocked</p>
        <BulletList items={briefing.weakestEvidence} />
        {briefing.blockedNarratives.length > 0 ? (
          <>
            <p className="mt-2 font-semibold text-rose-800">Blocked narratives</p>
            <ul className="list-inside list-disc text-rose-900">
              {briefing.blockedNarratives.map((row) => (
                <li key={row.narrativeId}>{row.narrativeTitle}</li>
              ))}
            </ul>
          </>
        ) : null}
      </Section>

      <Section title="12) Open research needs">
        <BulletList items={briefing.openResearchNeeds} />
      </Section>

      {briefing.operationalIntelligence ? (
        <>
          <section className="mb-4 rounded-xl border border-sky-200/50 bg-sky-50/40 p-4 text-xs">
            <p className="font-bold uppercase tracking-wider text-sky-950">NSI-6 · Operational environment (aggregate-only)</p>
            <ul className="mt-2 space-y-1 text-sky-950">
              {briefing.operationalIntelligence.operationalSignals.map((row) => (
                <li key={row.signal}>
                  <span className="font-semibold">{row.signal.replaceAll("_", " ")}</span>: {row.text}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] text-sky-900/80">
              Adapters: {briefing.operationalIntelligence.adapterIdsUsed.join(", ")}
              {briefing.operationalIntelligence.regionalClusterId
                ? ` · Cluster: ${briefing.operationalIntelligence.regionalClusterId}`
                : ""}
            </p>
          </section>

          <Section title="Operational environment">
            <BulletList items={briefing.operationalIntelligence.operationalEnvironment} />
          </Section>

          <Section title="Turnout & participation environment">
            <BulletList items={briefing.operationalIntelligence.turnoutParticipationEnvironment} />
          </Section>

          <Section title="Volunteer & field readiness">
            <BulletList items={briefing.operationalIntelligence.volunteerFieldReadiness} />
          </Section>

          <Section title="Media ecosystem environment">
            <BulletList items={briefing.operationalIntelligence.mediaEcosystemEnvironment} />
          </Section>

          <Section title="Demographic & economic context">
            <BulletList items={briefing.operationalIntelligence.demographicEconomicContext} />
          </Section>

          <Section title="Strategic opportunity analysis">
            <BulletList items={briefing.operationalIntelligence.strategicOpportunityAnalysis} />
          </Section>

          <Section title="Operational risk analysis">
            <BulletList items={briefing.operationalIntelligence.operationalRiskAnalysis} />
          </Section>
        </>
      ) : null}

      {mediaProfile ? (
        <>
          <section className="mb-4 rounded-xl border border-indigo-200/50 bg-indigo-50/40 p-4 text-xs">
            <p className="font-bold uppercase tracking-wider text-indigo-950">NSI-9B · Local media environment</p>
            <ul className="mt-2 space-y-1 text-indigo-950">
              {mediaProfile.readinessSignals.map((row) => (
                <li key={row.signal}>
                  <span className="font-semibold">{row.signal.replaceAll("_", " ")}</span>: {row.text}
                </li>
              ))}
            </ul>
          </section>

          <Section title="Local media environment">
            <p className="font-semibold text-kelly-navy">Primary media market</p>
            <p>{mediaProfile.primaryMediaMarket}</p>
            <p className="mt-2 font-semibold text-kelly-navy">Secondary media markets</p>
            <BulletList items={mediaProfile.secondaryMediaMarkets.length > 0 ? mediaProfile.secondaryMediaMarkets : ["None flagged"]} />
            <p className="mt-2 font-semibold text-kelly-navy">Cross-state sources (registry)</p>
            <BulletList
              items={
                mediaProfile.crossStateSources.length > 0
                  ? mediaProfile.crossStateSources.map((s) => `${s.sourceName} (${s.state}) — manual review`)
                  : ["No cross-state sources registered yet"]
              }
            />
            <p className="mt-2 font-semibold text-kelly-navy">Local papers</p>
            <BulletList items={mediaProfile.localPapers.length > 0 ? mediaProfile.localPapers : ["None registered"]} />
            <p className="mt-2 font-semibold text-kelly-navy">Local radio</p>
            <BulletList items={mediaProfile.localRadio.length > 0 ? mediaProfile.localRadio : ["None registered"]} />
            <p className="mt-2 font-semibold text-kelly-navy">TV market influence</p>
            <BulletList items={mediaProfile.tvMarketInfluence.length > 0 ? mediaProfile.tvMarketInfluence : ["None registered"]} />
            <p className="mt-2 font-semibold text-kelly-navy">Statewide paper importance</p>
            <p>{mediaProfile.statewidePaperImportant ? "Supplements but does not replace local/border media" : "Statewide outlets likely sufficient"}</p>
            <p className="mt-2 font-semibold text-kelly-navy">Monitoring gaps</p>
            <BulletList items={mediaProfile.coverageGaps.length > 0 ? mediaProfile.coverageGaps : ["None flagged"]} />
          </Section>

          <Section title="Messaging implications">
            <BulletList items={mediaProfile.messagingImplications} />
            <p className="mt-2 text-[10px] italic text-rose-800">
              Little Rock sufficient: {mediaProfile.littleRockCoverageSufficient ? "yes" : "no — validate locally"}.
              Cross-state TV may shape awareness. County talking points need local validation before field use.
            </p>
          </Section>
        </>
      ) : null}

      {scenarioWatch ? (
        <section className="mb-4 rounded-xl border border-violet-200/50 bg-violet-50/40 p-4 text-xs">
          <p className="font-bold uppercase tracking-wider text-violet-950">NSI-14 · Scenario watch</p>
          <p className="mt-1 text-violet-900/80">Governed scenario modeling — aggregate only · HUMAN_REVIEW_REQUIRED</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-2 text-violet-950">
            <div>
              <p className="font-semibold text-kelly-navy">Likely opponent frames</p>
              <BulletList items={scenarioWatch.likelyOpponentFrames} />
              <p className="mt-2 font-semibold text-kelly-navy">Media escalation risks</p>
              <BulletList items={scenarioWatch.mediaEscalationRisks} />
              <p className="mt-2 font-semibold text-kelly-navy">Narrative collision risks</p>
              <BulletList items={scenarioWatch.narrativeCollisionRisks} />
            </div>
            <div>
              <p className="font-semibold text-kelly-navy">Turnout / registration scenario notes</p>
              <BulletList items={scenarioWatch.turnoutRegistrationNotes} />
              <p className="mt-2 font-semibold text-kelly-navy">Field capacity risk</p>
              <BulletList items={scenarioWatch.fieldCapacityRisks} />
              <p className="mt-2 font-semibold text-kelly-navy">Local evidence blockers</p>
              <BulletList items={scenarioWatch.evidenceBlockers} />
              <p className="mt-2 font-semibold text-kelly-navy">What to watch</p>
              <BulletList items={scenarioWatch.whatToWatch} />
            </div>
          </div>
          <Link href="/admin/intelligence/scenario-simulation" className="mt-2 inline-block font-semibold text-violet-950 underline">
            Scenario simulation dashboard →
          </Link>
        </section>
      ) : null}

      <section className="mb-4 rounded-xl border border-violet-200/50 bg-violet-50/40 p-4 text-xs">
        <p className="font-bold uppercase tracking-wider text-violet-950">NSI-7 · Strategic intelligence links</p>
        <ul className="mt-2 space-y-1 text-violet-950">
          <li>
            <Link href="/admin/intelligence/morning-brief" className="font-semibold underline">
              Morning intelligence brief
            </Link>
            {" — daily leadership paper with county alerts"}
          </li>
          <li>
            <Link href="/admin/intelligence/writing-toolbox" className="font-semibold underline">
              Writing toolbox
            </Link>
            {" — INTERNAL_DRAFT talking points for "}{briefing.countyName}
          </li>
          <li>
            <Link href="/admin/intelligence/strategic-target-pathway" className="font-semibold underline">
              Target pathway
            </Link>
            {" — registration assumptions & win-number gaps"}
          </li>
        </ul>
        <p className="mt-2 text-[10px] text-violet-900/80">
          Media monitoring: NSI-8 intake queue + NSI-9/9B source registry. Cross-border findings remain NEEDS_REVIEW — not auto-export.
        </p>
      </section>
    </>
  );
}
