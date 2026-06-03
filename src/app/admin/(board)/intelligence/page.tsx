import Link from "next/link";
import { loadKimHammerWorkbench, loadKimHammerWorkbenchHubSummary } from "@/lib/opposition/kimHammerWorkbench";
import { runDailyIntelligenceAgentPassAsync } from "@/lib/intelligence/intelligenceAgentOrchestrator";
import { composeGovernedBriefRegistry } from "@/lib/intelligence/briefs/briefRegistry";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { tryIntelligenceLoad, tryIntelligenceLoadAsync } from "@/lib/intelligence/safeIntelligenceLoad";
import { AiIntelligenceBrainPanel } from "@/components/admin/intelligence/AiIntelligenceBrainPanel";
import { PublicBriefGradeIntelligencePanel } from "@/components/admin/intelligence/PublicBriefGradeIntelligencePanel";
import { AdminMessageIntelligencePanel } from "@/components/admin/intelligence/AdminMessageIntelligencePanel";
import { IntelligenceLaunchHub } from "@/components/admin/intelligence/IntelligenceLaunchHub";
import { IntelligenceCandidateOrientation } from "@/components/admin/intelligence/IntelligenceCandidateOrientation";
import { loadIntelligenceLaunchHubStats } from "@/lib/intelligence/intelligenceLaunchHubStats";
import type { DailyIntelligencePacket } from "@/lib/intelligence/intelligenceAgentOrchestrator";
import type { GovernedBriefRegistry } from "@/lib/intelligence/briefs/briefRegistry";

export const dynamic = "force-dynamic";
/** Netlify serverless — avoid edge runtime timeout on cold starts. */
export const runtime = "nodejs";
/** Opposition hub does heavy JSON reads; allow up to 26s on Pro. */
export const maxDuration = 26;

const card = "rounded-md border border-kelly-text/10 bg-kelly-page px-3 py-2 text-sm";

const EMPTY_DAILY_PACKET = {
  runId: "launch-fallback",
  generatedAt: new Date().toISOString(),
  publicationSafety: "NON_PUBLISHABLE",
  humanReviewRequired: true,
  governanceWarnings: ["Daily packet unavailable — check opposition JSON artifacts"],
  topPriorities: [],
  debatePrepPriorities: [],
  oppositionResearchPriorities: [],
  countyWorkbenchPriorities: [],
  brainAnswers: { answers: [] },
  messageIntelligenceReadinessScore: 0,
  oppositionBriefScore: 0,
  debateBriefScore: 0,
  topResearchGapsBlockingPublicMessaging: ["Retrieval task open"],
} as unknown as DailyIntelligencePacket;

export default async function OppositionIntelligenceAdminPage() {
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
    riskClaims: ["Claim review required before external use"],
    safeLanguage: [],
    topContrastThemes: [],
    recommendedNextPass: ["Retrieval task open — see action queue"],
    bills: [],
    topQuestions: [],
  } as unknown as ReturnType<typeof loadKimHammerWorkbench>);

  const dailyPacket = launchMode
    ? EMPTY_DAILY_PACKET
    : await tryIntelligenceLoadAsync(
        "daily-intelligence-pass",
        () => runDailyIntelligenceAgentPassAsync({ syncActionQueue: true }),
        EMPTY_DAILY_PACKET,
      );

  const briefRegistry = launchMode
    ? null
    : tryIntelligenceLoad(
        "brief-registry",
        () => composeGovernedBriefRegistry({ syncActionQueue: false }),
        {
          generatedAt: new Date().toISOString(),
          countyBundles: [],
          countyPublicBriefRollup: {
            PUBLIC_BRIEF_READY: 0,
            INTERNAL_MESSAGE_SOURCE_ONLY: 0,
            FIELD_PLANNING_ONLY: 0,
            SHELL_ONLY: 0,
            BLOCKED: 0,
          },
          oppositionDebate: {
            opposition: { confidenceScore: 0, researchGaps: ["Retrieval task open"] },
            debatePrep: { confidenceScore: 0, researchGaps: ["No clips indexed yet"] },
            rapidResponse: { confidenceScore: 0 },
          },
          weeklyPacket: { oppositionResearchGaps: [] },
          dailyPacket,
          messageGuidance: [],
          brainAnswers: { answers: [] },
          llmContract: { liveLlmEnabled: false },
          topResearchGapsBlockingPublicMessaging: ["Retrieval task open"],
          candidateMessageBrief: { briefId: "fallback" },
          weeklyIntelligenceBrief: { briefId: "fallback" },
        } as unknown as GovernedBriefRegistry,
      );

  const topTheme = data.highConfidenceThemes[0];
  const hubStats = loadIntelligenceLaunchHubStats();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      {launchMode ? <IntelligenceCandidateOrientation /> : null}
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Opposition Research Workbench</p>
        <h1 className="font-heading text-2xl font-bold">Tonight&apos;s overview</h1>
        <p className="mt-2 max-w-4xl font-body text-sm leading-relaxed text-kelly-muted">
          First-screen briefing: what is verified, what pattern emerges, what to say, what to avoid, and what to drill today.
          Source-first and contrast-ready for debate preparation.
        </p>
        <p className="mt-2 text-xs font-semibold text-amber-900">
          Evidence scores reflect archive depth — not your personal debate performance.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/admin/intelligence/kim-hammer/debate-prep"
            className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
          >
            Go to debate prep →
          </Link>
          <Link
            href="/admin/intelligence/debate-command"
            className="rounded-full border border-kelly-navy/30 px-4 py-2 text-xs font-bold text-kelly-navy"
          >
            Debate command scores
          </Link>
        </div>
      </header>

      <IntelligenceLaunchHub stats={hubStats} />

      {!launchMode ? (
        <>
          <AiIntelligenceBrainPanel packet={dailyPacket} />
          {briefRegistry ? (
            <PublicBriefGradeIntelligencePanel packet={dailyPacket} registry={briefRegistry} />
          ) : null}
          <AdminMessageIntelligencePanel />
        </>
      ) : null}

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
          <p className="mt-1 text-xs text-kelly-muted">Archive depth — verify before publish</p>
        </div>
        <div className={card}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Claims needing follow-up</p>
          <p className="mt-1 font-heading text-2xl font-bold">{data.claimBuckets.needsResearch.length}</p>
          <p className="mt-1 text-xs text-kelly-muted">
            <Link href="/admin/intelligence/claims" className="underline">
              Claims review queue
            </Link>
          </p>
        </div>
      </section>

      {!launchMode ? (
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-kelly-text/10 bg-white p-4 lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">What Matters Most Tonight</h2>
            <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
              <li>
                Pattern driver: <span className="font-semibold text-kelly-text">{topTheme?.theme ?? "MISSING"}</span> (
                {topTheme?.billCount ?? 0} bills).
              </li>
              <li>Strongest debate anchors: {data.strongestDebateAnchors.map((b) => b.billNumber).join(", ") || "—"}.</li>
              <li>
                Supported claims: {data.claimBuckets.supported.length}; partial: {data.claimBuckets.partial.length}; needs
                research: {data.claimBuckets.needsResearch.length}.
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Extended workbench links</h2>
            <div className="mt-2 flex flex-col gap-2 text-xs">
              <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/kim-hammer/county-briefings">
                County briefings (NSI-5)
              </Link>
              <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/campaign-intelligence-graph">
                Campaign intelligence graph
              </Link>
              <Link className="rounded border px-2 py-1 font-semibold text-kelly-navy" href="/admin/intelligence/media-intake">
                Media intake
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Debate Drill Queue</h2>
          {data.debateDrillQueue.length === 0 ? (
            <p className="mt-2 text-xs text-kelly-muted">No drill cards indexed yet.</p>
          ) : (
            <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
              {data.debateDrillQueue.slice(0, 5).map((cardItem) => (
                <li key={cardItem.billNumber}>
                  {cardItem.billNumber}: {cardItem.prompt}
                </li>
              ))}
            </ul>
          )}
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

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Research Gap Queue</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.recommendedNextPass.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link href="/admin/intelligence/action-queue" className="mt-2 inline-block text-xs font-semibold text-kelly-navy underline">
          Assign owners in action queue →
        </Link>
      </section>

      {data.bills.length > 0 ? (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Bill Risk / Opportunity Table</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-kelly-text/10 text-kelly-muted">
                  <th className="py-1.5 pr-3 font-semibold">Bill</th>
                  <th className="py-1.5 pr-3 font-semibold">Act</th>
                  <th className="py-1.5 pr-3 font-semibold">Confidence</th>
                  <th className="py-1.5 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody>
                {data.bills.map((row) => (
                  <tr key={row.billNumber} className="border-b border-kelly-text/5">
                    <td className="py-1.5 pr-3">{row.billNumber}</td>
                    <td className="py-1.5 pr-3">{row.actNumber ?? "MISSING"}</td>
                    <td className="py-1.5 pr-3">{row.confidenceLevel}</td>
                    <td className="py-1.5">
                      <Link
                        href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(row.billNumber)}`}
                        className="font-semibold text-kelly-navy underline"
                      >
                        view
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <p className="text-xs text-kelly-muted">No bill index loaded — check opposition data artifacts.</p>
      )}
    </div>
  );
}
