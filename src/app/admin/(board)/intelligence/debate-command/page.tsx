import { loadSafeDebateCommandPageData } from "@/lib/intelligence/safeDebateCommandLoads";
import { loadDebateIntelligenceV3Packet } from "@/lib/intelligence/v3/debateIntelligenceV3";
import { V3ResearchIntro } from "@/components/admin/intelligence/v3/V3ResearchIntro";
import { PrepareLlmEvidencePacketButton } from "@/components/admin/intelligence/PrepareLlmEvidencePacketButton";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

const card = "rounded-xl border border-kelly-text/10 bg-white p-4";

function scoreTone(score: number): string {
  if (score >= 80) return "text-emerald-700";
  if (score >= 70) return "text-amber-700";
  return "text-rose-700";
}

export default async function DebateCommandCenterPage() {
  const v3 = loadDebateIntelligenceV3Packet();
  const { state, briefPack, civicDebate, graphSummary, scenarioPrep, messageIntel, legislativeRollup } =
    loadSafeDebateCommandPageData();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V3ResearchIntro
        title="v3 research — debate & contrast frames"
        description="Background from debate profile and contrast-vs-Kelly markdown before readiness scores."
        sections={[...v3.researchLayers.debateProfile.slice(0, 3), ...v3.researchLayers.contrastVsKelly.slice(0, 2)]}
      />
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-subtle">Executive Debate Command Center</p>
        <h1 className="font-heading text-3xl font-bold">Debate command</h1>
        <p className="mt-2 max-w-4xl font-body text-sm text-kelly-muted">
          Readiness scores, recommended lanes, and warnings — internal draft only. Pair with{" "}
          <Link href="/admin/intelligence/kim-hammer/debate-prep" className="font-semibold text-kelly-navy underline">
            debate prep
          </Link>{" "}
          for rehearsal.
        </p>
      </header>

      <section className={`${card} mb-6 border-2 border-violet-800/25 bg-violet-50/30`}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Public-Brief-Grade Debate Intelligence</h2>
        <p className="mt-1 text-xs font-semibold text-amber-900">INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-kelly-text/10 bg-white p-3">
            <p className="text-[10px] font-bold uppercase text-kelly-subtle">Debate prep brief</p>
            <p className="font-heading text-2xl font-bold text-kelly-navy">{briefPack.debatePrep.confidenceScore}/100</p>
            <p className="text-xs text-kelly-muted">{briefPack.debatePrep.status}</p>
          </div>
          <div className="rounded-lg border border-kelly-text/10 bg-white p-3">
            <p className="text-[10px] font-bold uppercase text-kelly-subtle">Rapid response brief</p>
            <p className="font-heading text-2xl font-bold text-kelly-navy">{briefPack.rapidResponse.confidenceScore}/100</p>
            <p className="text-xs text-kelly-muted">{briefPack.rapidResponse.publishabilityStatus}</p>
          </div>
          <div className="rounded-lg border border-kelly-text/10 bg-white p-3">
            <p className="text-[10px] font-bold uppercase text-kelly-subtle">Opposition brief</p>
            <p className="font-heading text-2xl font-bold text-kelly-navy">{briefPack.opposition.confidenceScore}/100</p>
            <p className="text-xs text-kelly-muted">{briefPack.opposition.researchGaps.length} research gaps</p>
          </div>
        </div>
        <h3 className="mt-4 text-xs font-bold uppercase text-emerald-900">Recommended debate message lanes (internal)</h3>
        <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
          {briefPack.debatePrep.recommendedMessaging.map((line) => (
            <li key={line.slice(0, 60)}>{line}</li>
          ))}
        </ul>
        <h3 className="mt-3 text-xs font-bold uppercase text-rose-800">Unsafe claims warning</h3>
        <ul className="mt-1 list-inside list-disc text-xs text-rose-900">
          {[...briefPack.opposition.riskWarnings, ...briefPack.debatePrep.riskWarnings].slice(0, 6).map((line) => (
            <li key={line.slice(0, 60)}>{line}</li>
          ))}
        </ul>
        <h3 className="mt-3 text-xs font-bold uppercase text-kelly-subtle">Film room gaps</h3>
        <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
          {briefPack.debatePrep.researchGaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
        <Link href="/admin/intelligence/llm-review-queue" className="mt-3 inline-block text-xs font-semibold text-kelly-navy underline">
          LLM review queue (no auto-publish) →
        </Link>
        <div className="mt-4">
          <PrepareLlmEvidencePacketButton briefId={briefPack.debatePrep.briefId} />
        </div>
      </section>

      <section className={`${card} mb-6 border-2 border-teal-800/20 bg-teal-50/20`}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Transcript-backed debate lanes</h2>
        <p className="mt-1 text-xs font-semibold text-amber-900">INTERNAL_DRAFT · speaker review required before quote use</p>
        <h3 className="mt-3 text-xs font-bold uppercase text-emerald-900">Reviewed quote candidates</h3>
        <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
          {messageIntel.debateMessageLanes.length
            ? messageIntel.debateMessageLanes.slice(0, 5).map((lane) => <li key={lane.id}>{lane.text.slice(0, 140)}</li>)
            : legislativeRollup.debateUsefulChunks.map((c) => <li key={c.slice(0, 40)}>{c}</li>)}
          {!messageIntel.debateMessageLanes.length && !legislativeRollup.debateUsefulChunks.length ? (
            <li>No transcript-backed lanes yet — run legislature:intelligence:critical</li>
          ) : null}
        </ul>
        <h3 className="mt-3 text-xs font-bold uppercase text-rose-800">Unsafe quote warnings</h3>
        <ul className="mt-1 list-inside list-disc text-xs text-rose-900">
          {[
            ...messageIntel.phrasesToAvoid.map((p) => p.text),
            ...legislativeRollup.tooRiskyToUse.map((t) => `[RISKY] ${t}`),
          ]
            .slice(0, 6)
            .map((line) => (
              <li key={line.slice(0, 48)}>{line.slice(0, 160)}</li>
            ))}
        </ul>
        <h3 className="mt-3 text-xs font-bold uppercase text-kelly-subtle">Strongest committee-video evidence</h3>
        <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
          {legislativeRollup.strongestQuotes.length
            ? legislativeRollup.strongestQuotes.map((q) => <li key={q.slice(0, 40)}>{q}</li>)
            : <li>None verified — transcription deferred or pending human review</li>}
        </ul>
        <Link href="/admin/intelligence/legislative-video" className="mt-3 inline-block text-xs font-semibold text-kelly-navy underline">
          Legislative video intelligence →
        </Link>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-kelly-navy">A) Today&apos;s Priorities</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {state.todayPriorities.map((item) => (
            <article key={item.title} className={card}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{item.title}</p>
              <p className="mt-1 font-heading text-lg font-bold">{item.value}</p>
              <p className="mt-1 text-xs text-kelly-muted">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-kelly-navy">B) Candidate Readiness Scoreboard</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {state.readinessScores.map((score) => (
            <article key={score.id} className={card}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">{score.label}</p>
              <p className={`mt-1 font-heading text-2xl font-bold ${scoreTone(score.score)}`}>{score.score}</p>
              <p className="mt-1 text-xs text-kelly-muted">
                Trend: {score.trend} · Confidence: {score.scoreConfidence}
              </p>
              <p className="mt-1 text-xs text-kelly-muted">{score.whyThisScore}</p>
              <p className="mt-1 text-xs text-kelly-muted">Weak area: {score.weakAreas[0] ?? "None flagged"}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-900">
                Raise today: {score.raiseScoreToday[0] ?? "—"}
              </p>
              <p className="mt-1 text-xs font-semibold text-kelly-navy">Next module: {score.nextModule}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <article className={`${card} lg:col-span-1`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">C) Three Core Message Pillars</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {state.messagePillars.map((pillar) => (
              <li key={pillar}>{pillar}</li>
            ))}
          </ul>
        </article>

        <article className={`${card} lg:col-span-2`}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">D) Today&apos;s Opponent Intelligence</h2>
          <p className="mt-1 text-xs text-kelly-muted">
            Latest messaging and narrative shifts feeding live debate prep.
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Repeated phrases</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                {state.opponentIntelligence.repeatedPhrases.map((phrase) => (
                  <li key={phrase}>{phrase}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Newest bill anchors</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                {state.opponentIntelligence.newestResearch.slice(0, 4).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className={card}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">E) Today&apos;s Drill</h2>
          <p className="mt-1 text-xs text-kelly-muted">
            One-click launch for moderator + reporter + hostile follow-up + rebuttal pivots.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/admin/intelligence/kim-hammer/debate-prep" className="rounded border border-kelly-navy/30 bg-kelly-navy px-3 py-1 text-xs font-bold text-white">
              Start today&apos;s debate drill
            </Link>
            <Link href="/admin/intelligence/kim-hammer/research-gaps" className="rounded border px-3 py-1 text-xs font-semibold text-kelly-navy">
              View intelligence gaps
            </Link>
          </div>
        </article>

        <article className={card}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Training Academy Architecture</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {state.academyTracks.map((track) => (
              <li key={track}>{track}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className={card}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">NSI-4 · Civic impact intelligence</h2>
          <p className="mt-1 text-xs text-kelly-muted">Doctrine-aware bill civic signals for debate anchors.</p>
          <ul className="mt-2 space-y-2 text-xs">
            {civicDebate.flaggedBills.map((row) => (
              <li key={row.billNumber} className="rounded border border-kelly-text/10 bg-kelly-page/40 p-2">
                <Link href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(row.billNumber)}`} className="font-semibold text-kelly-navy underline">
                  {row.billNumber}
                </Link>
                {" · "}
                {row.civicSignal.replaceAll("_", " ")}
                <p className="mt-1 text-kelly-muted">{row.citizenSummary.slice(0, 160)}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className={card}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Philosophy & strategic risk</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {civicDebate.philosophyConsistency.map((row) => (
              <li key={row}>{row}</li>
            ))}
          </ul>
          {civicDebate.strategicRiskWarnings.length > 0 ? (
            <ul className="mt-3 list-inside list-disc text-xs text-amber-900">
              {civicDebate.strategicRiskWarnings.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-[10px] text-kelly-subtle">
            Graph: {graphSummary.entityCount} entities · {graphSummary.philosophyCount} philosophy nodes
          </p>
          <Link href="/admin/intelligence/campaign-intelligence-graph" className="mt-2 inline-block text-xs font-semibold text-kelly-navy underline">
            Open unified intelligence graph →
          </Link>
          <Link href="/admin/intelligence/strategy-alignment" className="mt-2 ml-3 inline-block text-xs font-semibold text-kelly-navy underline">
            Strategy alignment (SDI-1) →
          </Link>
        </article>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <article className={card}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">NSI-14 · Scenario-based debate prep</h2>
          <p className="mt-1 text-xs text-kelly-muted">
            Governed scenario modeling — INTERNAL_DRAFT only. No auto-generated final answers.
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Likely opponent attacks</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                {scenarioPrep.likelyOpponentAttacks.map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-rose-800">Debate trap warnings</p>
              <ul className="mt-1 list-inside list-disc text-xs text-rose-900">
                {scenarioPrep.debateTrapWarnings.map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Evidence dependencies · weak citations</p>
              <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
                {[...scenarioPrep.evidenceDependencies, ...scenarioPrep.weakCitationWarnings].map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-900">What not to say</p>
              <ul className="mt-1 list-inside list-disc text-xs text-amber-950">
                {scenarioPrep.whatNotToSay.map((line) => (
                  <li key={line.slice(0, 48)}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          <Link href="/admin/intelligence/scenario-simulation" className="mt-3 inline-block text-xs font-semibold text-kelly-navy underline">
            Open scenario simulation dashboard →
          </Link>
        </article>

        <article className={card}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Bridge lines · county-sensitive notes</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {scenarioPrep.bridgeLineGuidance.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">County-sensitive response notes</p>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {scenarioPrep.countySensitiveNotes.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Doctrine-safe response notes</p>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {scenarioPrep.doctrineSafeResponseNotes.length > 0
              ? scenarioPrep.doctrineSafeResponseNotes.map((line) => <li key={line.slice(0, 48)}>{line}</li>)
              : <li>Review doctrine alignment before deployment.</li>}
          </ul>
        </article>
      </section>

      <section className={`${card} mb-6`}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Film Room MVP</h2>
        <p className="mt-1 text-xs font-semibold text-amber-900">{state.filmRoom.archiveHonestyNote}</p>
        <p className="mt-2 text-xs text-kelly-muted">
          {state.filmRoom.directClipCount} direct opponent clip(s) · {state.filmRoom.referenceClipCount} reference SOS debate asset(s)
        </p>

        <h3 className="mt-4 text-xs font-bold uppercase text-rose-800">Film Room Coverage Gaps</h3>
        <ul className="mt-1 list-inside list-disc text-xs text-rose-900">
          {state.filmRoom.coverageGaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>

        <div className="mt-4 space-y-3">
          {state.filmRoom.items.slice(0, 6).map((item) => (
            <article key={item.id} className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3 text-xs">
              <p className="font-bold text-kelly-navy">{item.title}</p>
              <p className="text-kelly-muted">Topic: {item.topic} · Confidence: {item.confidence}</p>
              <p className="mt-1"><span className="font-semibold">Opponent angle:</span> {item.opponentClaimOrAngle}</p>
              <p className="mt-1"><span className="font-semibold">Counter:</span> {item.recommendedCounter}</p>
              <p className="mt-1"><span className="font-semibold">Drill:</span> {item.drillPrompt}</p>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-semibold text-kelly-navy underline">
                  Source (internal review)
                </a>
              ) : null}
            </article>
          ))}
        </div>
        <Link href="/admin/intelligence/kim-hammer/debate-archive" className="mt-3 inline-block text-xs font-semibold text-kelly-navy underline">
          Full debate archive →
        </Link>
        <Link href="/admin/intelligence/action-queue" className="mt-3 ml-4 inline-block text-xs font-semibold text-kelly-navy underline">
          Clip-needed tasks in action queue →
        </Link>
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Training Academy (architecture)</h2>
        <p className="mt-1 text-xs text-kelly-muted">Track list only — modules not yet built. Use debate prep + film room for daily drills.</p>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {state.academyTracks.map((track) => (
            <li key={track}>{track}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

