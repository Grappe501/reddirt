import Link from "next/link";
import { loadVvsg20CandidateEducation } from "@/lib/intelligence/v4/vvsg20CandidateEducation";
import { formatFundingAmount } from "@/lib/intelligence/v4/countyElectionFundingIntelligence";

export function V4Vvsg20CandidateEducationPanel() {
  const r = loadVvsg20CandidateEducation();
  const src = r.governance.sourceDocument;

  return (
    <div className="space-y-8">
      <article className="rounded-xl border-2 border-indigo-300/60 bg-indigo-50/40 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-950">Candidate education · EAC VVSG 2.0</p>
        <p className="mt-3 text-sm leading-relaxed text-kelly-text">{r.executiveSummaryForKelly}</p>
        <p className="mt-3 text-xs text-kelly-muted">
          Source:{" "}
          <a href={src.url} target="_blank" rel="noreferrer" className="font-bold text-kelly-navy underline">
            {src.title}
          </a>{" "}
          ({src.publisher}, {src.published})
        </p>
        <p className="mt-2 text-[10px] font-bold text-amber-900">{r.governance.publicationSafety}</p>
      </article>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-sky-200 bg-sky-50/30 p-5 text-xs">
          <h2 className="text-sm font-bold uppercase text-sky-950">{r.whatIsVvsg20.headline}</h2>
          <p className="mt-2 text-kelly-muted">{r.whatIsVvsg20.plainEnglish}</p>
          <p className="mt-3 font-bold text-kelly-navy">What a voting system does (VVSG scope)</p>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {r.whatIsVvsg20.votingSystemFunctions.map((f) => (
              <li key={f.slice(0, 40)}>{f}</li>
            ))}
          </ul>
          <p className="mt-3 font-bold text-emerald-950">VVSG 2.0 upgrades over 1.0</p>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {r.whatIsVvsg20.vvsg20ImprovementsOver10.map((f) => (
              <li key={f.slice(0, 40)}>{f}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 text-xs">
          <h2 className="text-sm font-bold uppercase text-amber-950">{r.nationalInventoryFacts.headline}</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-kelly-muted">
            {r.nationalInventoryFacts.facts.map((f) => (
              <li key={f.slice(0, 48)}>{f}</li>
            ))}
          </ul>
          <p className="mt-4 font-bold text-rose-950">Why officials replace systems</p>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {r.nationalInventoryFacts.topReplacementMotivators.map((f) => (
              <li key={f.slice(0, 48)}>{f}</li>
            ))}
          </ul>
          <p className="mt-4 font-bold text-violet-950">Barriers to VVSG 2.0 adoption</p>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {r.nationalInventoryFacts.topBarriers.map((f) => (
              <li key={f.slice(0, 48)}>{f}</li>
            ))}
          </ul>
        </article>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">{r.certificationPipeline.headline}</h2>
        <div className="mt-4 space-y-3">
          {r.certificationPipeline.steps.map((step) => (
            <article key={step.phase} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
              <p className="font-bold text-kelly-navy">{step.phase}</p>
              <p className="mt-2 text-kelly-muted">{step.detail}</p>
              {step.timelineNote ? <p className="mt-2 text-[10px] text-sky-900">{step.timelineNote}</p> : null}
              {step.arkansasNote ? (
                <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/50 p-2 text-amber-950">{step.arkansasNote}</p>
              ) : null}
              {step.kellySosMove ? (
                <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-2 text-emerald-950">
                  <span className="font-bold">Kelly SOS move:</span> {step.kellySosMove}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 text-xs">
          <article className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-4">
            <p className="font-bold text-emerald-950">Federally certified to VVSG 2.0 (report date)</p>
            <ul className="mt-2 space-y-1 text-kelly-muted">
              {r.certificationPipeline.federallyCertifiedAsOfReport.map((s) => (
                <li key={s.system}>
                  {s.vendor} — {s.system} ({s.certified})
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-lg border border-violet-200 bg-violet-50/30 p-4">
            <p className="font-bold text-violet-950">In federal testing pipeline</p>
            <p className="mt-2 text-kelly-muted">{r.certificationPipeline.inPipeline.join(" · ")}</p>
            <p className="mt-3 text-[10px] text-violet-900">{r.certificationPipeline.industryDeploymentEstimate}</p>
          </article>
        </div>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 text-xs">
        <h2 className="text-sm font-bold uppercase text-emerald-950">{r.nationalCostEstimate.headline}</h2>
        <p className="mt-2 text-lg font-bold text-kelly-navy">{formatFundingAmount(r.nationalCostEstimate.total)} (U.S., equipment only)</p>
        <ul className="mt-3 list-inside list-disc text-kelly-muted">
          {r.nationalCostEstimate.caveats.map((c) => (
            <li key={c.slice(0, 48)}>{c}</li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg border border-emerald-100 bg-white p-3 italic text-emerald-950">
          {r.nationalCostEstimate.eacFundingRecommendation}
        </p>
      </section>

      <section className="rounded-xl border-2 border-kelly-gold/40 bg-kelly-page/50 p-5 text-xs">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">{r.arkansasConnection.headline}</h2>
        <p className="mt-2 text-sm text-kelly-text">{r.arkansasConnection.processSummary}</p>
        <p className="mt-3 font-bold text-kelly-navy">Statutory hooks</p>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {r.arkansasConnection.statutoryHooks.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <p className="mt-4 font-bold text-emerald-950">Kelly opportunity as SOS</p>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {r.arkansasConnection.kellyOpportunity.map((o) => (
            <li key={o.slice(0, 48)}>{o}</li>
          ))}
        </ul>
        <ul className="mt-4 space-y-1">
          {r.arkansasConnection.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="font-bold text-kelly-navy underline">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <Link href="/admin/intelligence/election-funding" className="mt-4 inline-block font-bold text-violet-950 underline">
          CVSGF + HAVA funding module →
        </Link>
      </section>

      <section className="rounded-xl border border-violet-200 bg-violet-50/30 p-5 text-xs">
        <h2 className="text-sm font-bold uppercase text-violet-950">What Kelly should know before stage or trail</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-kelly-muted">
          {r.whatKellyShouldKnow.map((item) => (
            <li key={item.slice(0, 48)}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border-2 border-kelly-navy/20 bg-white p-5 text-xs">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Debate &amp; trail — how to present</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
            <p className="font-bold text-emerald-950">Kelly frame</p>
            <p className="mt-2 text-emerald-950">{r.debateAndTrailTalkingPoints.kellyFrame}</p>
          </div>
          <div className="rounded-lg border border-rose-100 bg-rose-50/40 p-4">
            <p className="font-bold text-rose-950">Hammer likely says</p>
            <p className="mt-2 text-rose-950">{r.debateAndTrailTalkingPoints.hammerLikelyFrame}</p>
          </div>
        </div>
        <article className="mt-4 space-y-3 rounded-lg border border-sky-200 bg-sky-50/40 p-4">
          <div>
            <p className="font-bold text-sky-950">If moderator asks about VVSG / voting machines</p>
            <p className="mt-1 text-kelly-text">{r.debateAndTrailTalkingPoints.kellyResponseIfModeratorAsksVvsg}</p>
          </div>
          <div>
            <p className="font-bold text-sky-950">If Hammer cites &apos;#1 in nation&apos;</p>
            <p className="mt-1 text-kelly-text">{r.debateAndTrailTalkingPoints.kellyResponseIfHammerCitesRanking}</p>
          </div>
        </article>
        <p className="mt-4 rounded-lg border border-kelly-gold/40 bg-kelly-page/50 p-3 text-sm italic text-kelly-navy">
          Fair public line: &ldquo;{r.debateAndTrailTalkingPoints.fairPublicLine}&rdquo;
        </p>
        <article className="mt-4 rounded-lg border-2 border-kelly-gold/40 bg-kelly-page/40 p-4">
          <p className="font-bold text-kelly-navy">Trap question (verify tone with staff)</p>
          <p className="mt-2 text-kelly-text">{r.debateAndTrailTalkingPoints.trapQuestionForHammer}</p>
        </article>
        <p className="mt-4 font-bold text-amber-900">Do not say</p>
        <ul className="mt-1 list-inside list-disc text-amber-950">
          {r.debateAndTrailTalkingPoints.doNotSay.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-kelly-page/40 p-5 text-xs">
        <h2 className="font-bold uppercase text-kelly-navy">Staff research questions</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-kelly-muted">
          {r.questionsForSosStaff.map((q) => (
            <li key={q.slice(0, 48)}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
        <h2 className="font-bold uppercase text-kelly-navy">Verified claims for ledger</h2>
        <ul className="mt-3 space-y-2">
          {r.verifiedClaimsForLedger.map((c) => (
            <li key={c.claimText.slice(0, 48)} className="rounded-lg border border-kelly-text/10 p-3">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                  c.classification === "VERIFIED" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                }`}
              >
                {c.classification}
              </span>
              <p className="mt-2 text-kelly-text">{c.claimText}</p>
              <p className="mt-1 text-[10px] text-kelly-subtle">{c.sourceHint}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
