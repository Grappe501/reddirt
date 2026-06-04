import Link from "next/link";
import type { BillOperatorPlaybook } from "@/lib/intelligence/v4/debateOperatorPlaybookTypes";
import { KIM_HAMMER_COMMAND_CENTER_HREF } from "@/lib/opposition/kimHammerBriefingRegistry";

export function V4BillOperatorPlaybookPanel({ playbook }: { playbook: BillOperatorPlaybook }) {
  return (
    <section className="mb-6 space-y-4 rounded-xl border-2 border-kelly-navy/15 bg-gradient-to-br from-kelly-page/80 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-900">Step-by-step operator playbook</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">{playbook.recordItemLabel}</h2>
          <p className="mt-1 text-sm text-kelly-muted">{playbook.headline}</p>
        </div>
        {playbook.isCurated ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
            Curated drill
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
            Auto from narrative
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase text-kelly-navy">How / what / when / where / why — walkthrough</p>
        <ol className="mt-3 space-y-2">
          {playbook.steps.map((row) => (
            <li key={row.step} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2 text-xs">
              <span className="font-bold text-violet-900">
                {row.step}. {row.dimension}
              </span>
              <span className="mt-0.5 block text-kelly-muted">{row.detail}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-rose-200/50 bg-rose-50/30 p-4 text-xs">
        <p className="font-bold uppercase text-rose-950">This record item &amp; everyday Arkansans</p>
        <p className="mt-2 leading-relaxed text-rose-950/90">{playbook.peopleImpactFrame}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-sky-200/60 bg-sky-50/40 p-4 text-xs">
          <p className="font-bold uppercase text-sky-900">Debate — how to use on stage</p>
          <ul className="mt-2 space-y-2 text-kelly-muted">
            <li>
              <span className="font-semibold text-kelly-navy">Bring up when:</span> {playbook.debateUse.bringUpWhen}
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">Open with:</span> {playbook.debateUse.openingLine}
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">Act anchor:</span> {playbook.debateUse.actAnchor}
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">County / voter:</span> {playbook.debateUse.countyOrVoterImpact}
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">Bridge:</span> {playbook.debateUse.kellyBridge}
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">If he counters:</span> {playbook.debateUse.rebuttalIfHeCounters}
            </li>
          </ul>
          <p className="mt-3 font-bold text-amber-900">Do not say</p>
          <ul className="mt-1 list-inside list-disc text-amber-950/90">
            {playbook.debateUse.doNotSay.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-violet-200/50 bg-violet-50/30 p-4 text-xs">
          <p className="font-bold uppercase text-violet-950">Social media — how to use</p>
          <p className="mt-2 text-kelly-muted">
            <span className="font-semibold text-kelly-navy">Platforms:</span> {playbook.socialMediaUse.platforms.join(", ")}
          </p>
          <p className="mt-2 text-kelly-muted">
            <span className="font-semibold text-kelly-navy">Format:</span> {playbook.socialMediaUse.postFormat}
          </p>
          <p className="mt-2 font-semibold text-kelly-navy">Thread outline</p>
          <ol className="mt-1 list-inside list-decimal text-kelly-muted">
            {playbook.socialMediaUse.threadOutline.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ol>
          <p className="mt-2 text-kelly-muted">
            <span className="font-semibold text-kelly-navy">Caption idea:</span> {playbook.socialMediaUse.graphicCaption}
          </p>
          <p className="mt-2 text-[10px] text-amber-900">{playbook.socialMediaUse.claimsGateReminder}</p>
        </div>
      </div>

      {playbook.trapSetup ? (
        <div className="rounded-lg border-2 border-kelly-gold/40 bg-kelly-page/60 p-4 text-xs">
          <p className="font-bold uppercase text-kelly-navy">Walk him into your hand — trap setup</p>
          <p className="mt-1 font-semibold text-violet-950">{playbook.trapSetup.name}</p>
          <ul className="mt-2 space-y-2 text-kelly-muted">
            <li>
              <span className="font-semibold text-kelly-navy">Bait you want:</span> “{playbook.trapSetup.baitLineYouWantFromOpponent}”
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">You or moderator ask:</span> {playbook.trapSetup.moderatorOrKellySetupQuestion}
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">When he bites, pivot:</span> {playbook.trapSetup.kellyPivotWhenHeBites}
            </li>
            <li>
              <span className="font-semibold text-kelly-navy">Why it works:</span> {playbook.trapSetup.whyItWorks}
            </li>
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg border border-emerald-200/50 bg-emerald-50/40 p-4 text-xs">
        <p className="font-bold uppercase text-emerald-900">Kelly difference (clear contrast)</p>
        <p className="mt-2 text-emerald-950">{playbook.kellyDifference}</p>
      </div>

      <Link
        href={`${KIM_HAMMER_COMMAND_CENTER_HREF}/bills/${encodeURIComponent(playbook.billNumber)}`}
        className="inline-block text-xs font-bold text-kelly-navy underline"
      >
        Bill drill-down (act proof) →
      </Link>
    </section>
  );
}
