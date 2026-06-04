import type { ReactNode } from "react";
import Link from "next/link";
import type { TrapLaneWithBriefing } from "@/lib/intelligence/v4/debateBriefingEnrichment";
import { TRAP_LANE_FIRST_TIMER_NOTE } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { buildTrapLaneStepCoverage } from "@/lib/intelligence/v4/trapLaneStepCoverage";
import { V4TrapStepCoveragePanel } from "@/components/admin/intelligence/v4/V4DepthPanels";
import { V4EncounterDepthPanel } from "@/components/admin/intelligence/v4/V4EncounterDepthPanel";
import { V4DebateBriefingPanel } from "@/components/admin/intelligence/v4/V4DebateBriefingPanel";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
      <h3 className="text-sm font-bold uppercase text-kelly-navy">{title}</h3>
      <div className="mt-3 text-kelly-muted">{children}</div>
    </section>
  );
}

export function V4TrapLaneDrillDownPanel({
  drill,
  prev,
  next,
}: {
  drill: TrapLaneWithBriefing;
  prev: { laneId: string; title: string } | null;
  next: { laneId: string; title: string } | null;
}) {
  return (
    <div className="space-y-6">
      <V4DebateBriefingPanel briefing={drill.briefing} title="Trap lane quick-read briefing" />

      <article className="rounded-xl border-2 border-kelly-gold/40 bg-kelly-page/40 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy">
          Trap lane {drill.laneNumber} of 6 · ~{drill.estimatedPrepMinutes} min prep
        </p>
        <p className="mt-3 text-sm leading-relaxed text-kelly-text">{drill.narrativeOverview}</p>
        <p className="mt-3 text-[10px] font-bold text-amber-900">{drill.claimsGate}</p>
      </article>

      {(drill.whatToLookForOffensive.length > 0 || drill.whatToLookForDefensive.length > 0) && (
        <article className="rounded-xl border border-sky-200 bg-sky-50/40 p-5 text-xs">
          <p className="font-bold uppercase text-sky-950">What to look for — debate use</p>
          {drill.whatToLookForOffensive.length > 0 ? (
            <>
              <p className="mt-3 font-bold text-rose-950">Offensive (Kelly)</p>
              <p className="mt-1 text-kelly-muted">{drill.debateOffensiveUse}</p>
              <ul className="mt-2 list-inside list-disc text-rose-950/90">
                {drill.whatToLookForOffensive.map((t) => (
                  <li key={t.slice(0, 48)}>{t}</li>
                ))}
              </ul>
            </>
          ) : null}
          {drill.whatToLookForDefensive.length > 0 ? (
            <>
              <p className="mt-3 font-bold text-emerald-950">Defensive (protect Kelly)</p>
              <p className="mt-1 text-kelly-muted">{drill.debateDefensiveUse}</p>
              <ul className="mt-2 list-inside list-disc text-emerald-950/90">
                {drill.whatToLookForDefensive.map((t) => (
                  <li key={t.slice(0, 48)}>{t}</li>
                ))}
              </ul>
            </>
          ) : null}
          {drill.whatToLookForVerify.length > 0 ? (
            <>
              <p className="mt-3 font-bold text-amber-950">Verify before stage</p>
              <ul className="mt-2 list-inside list-disc text-amber-950/90">
                {drill.whatToLookForVerify.map((t) => (
                  <li key={t.slice(0, 48)}>{t}</li>
                ))}
              </ul>
            </>
          ) : null}
        </article>
      )}

      <article className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-950">
        {TRAP_LANE_FIRST_TIMER_NOTE}
      </article>

      {drill.encounterDepth ? <V4EncounterDepthPanel depth={drill.encounterDepth} /> : null}

      <V4TrapStepCoveragePanel coverage={buildTrapLaneStepCoverage(drill)} />

      <Block title="What to expect Hammer to say">
        <ul className="list-inside list-disc space-y-2">
          {drill.whatToExpectHammerToSay.map((line) => (
            <li key={line.slice(0, 48)} className="text-kelly-text">
              {line}
            </li>
          ))}
        </ul>
        {drill.hammerTonalities.length > 0 ? (
          <>
            <p className="mt-4 font-bold text-rose-950">How he will sound</p>
            <ul className="mt-2 list-inside list-disc">
              {drill.hammerTonalities.map((t) => (
                <li key={t.slice(0, 40)}>{t}</li>
              ))}
            </ul>
          </>
        ) : null}
      </Block>

      <Block title="When & how to set the trap">
        <p className="font-semibold text-violet-950">{drill.setupTiming}</p>
        <p className="mt-2 text-kelly-text">{drill.baitPsychology}</p>
        <ol className="mt-4 list-inside list-decimal space-y-2">
          {drill.setupMoves.map((m) => (
            <li key={m.slice(0, 48)}>{m}</li>
          ))}
        </ol>
        {drill.whenHeBitesSignals.length > 0 ? (
          <>
            <p className="mt-4 font-bold text-emerald-950">Signals he took the bait</p>
            <ul className="mt-2 list-inside list-disc">
              {drill.whenHeBitesSignals.map((s) => (
                <li key={s.slice(0, 40)}>{s}</li>
              ))}
            </ul>
          </>
        ) : null}
      </Block>

      <Block title="What the moderator may ask">
        <ul className="list-inside list-disc">
          {drill.whatModeratorMayAsk.map((q) => (
            <li key={q.slice(0, 48)}>{q}</li>
          ))}
        </ul>
      </Block>

      <article className="rounded-xl border-2 border-violet-200 bg-violet-50/30 p-5 text-xs">
        <h3 className="text-sm font-bold uppercase text-violet-950">Kelly pivot — deep narrative</h3>
        <p className="mt-3 text-base leading-relaxed text-kelly-text md:text-sm">{drill.kellyPivotDeep}</p>
      </article>

      {drill.rebuttalScripts.length > 0 ? (
        <section className="rounded-xl border border-violet-200 bg-white p-5">
          <h3 className="text-sm font-bold uppercase text-violet-950">Rebuttals — agree · contrast · bridge</h3>
          <div className="mt-4 space-y-4">
            {drill.rebuttalScripts.map((script) => (
              <article key={script.trigger} className="rounded-lg border border-kelly-text/10 p-4 text-xs">
                <p className="font-bold text-rose-900">When: {script.trigger}</p>
                <p className="mt-2 italic text-kelly-muted">He may say: &ldquo;{script.hammerLikelyLine}&rdquo;</p>
                <p className="mt-2">
                  <span className="font-bold text-emerald-900">Agree:</span> {script.agree}
                </p>
                <p className="mt-1">
                  <span className="font-bold text-violet-900">Contrast:</span> {script.contrast}
                </p>
                <p className="mt-1">
                  <span className="font-bold text-kelly-navy">Bridge:</span> {script.bridge}
                </p>
                {script.zinger ? (
                  <p className="mt-2 rounded bg-kelly-navy/5 px-2 py-1 font-semibold text-kelly-navy">
                    Zinger: {script.zinger}
                  </p>
                ) : null}
                {script.claimsNote ? <p className="mt-2 text-amber-900">{script.claimsNote}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {drill.sampleScripts.length > 0 ? (
        <section className="rounded-xl border border-kelly-navy/15 bg-kelly-page/20 p-5">
          <h3 className="text-sm font-bold uppercase text-kelly-navy">Sample scripts — rehearse standing</h3>
          <div className="mt-4 space-y-4">
            {drill.sampleScripts.map((script) => (
              <article key={script.label} className="rounded-lg border border-kelly-text/10 bg-white p-4">
                <div className="flex justify-between gap-2 text-xs">
                  <span className="font-bold text-kelly-navy">{script.label}</span>
                  <span className="text-kelly-subtle">{script.duration}</span>
                </div>
                <p className="mt-3 text-base leading-relaxed text-kelly-text md:text-sm">{script.text}</p>
                {script.deliveryNote ? <p className="mt-2 text-violet-900">{script.deliveryNote}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {drill.zingers.length > 0 ? (
        <Block title="Zingers (optional)">
          <ul className="space-y-3">
            {drill.zingers.map((z) => (
              <li key={z.line.slice(0, 40)} className="rounded border border-kelly-text/10 p-3">
                <p className="font-semibold text-kelly-navy">{z.line}</p>
                <p className="mt-1 text-[10px]">Use when: {z.whenToUse}</p>
                <p className="text-[10px] text-rose-950">Not when: {z.whenNotToUse}</p>
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {drill.debateSteps.length > 0 ? (
        <Block title="Six-dimension playbook">
          <ol className="space-y-2">
            {drill.debateSteps.map((row) => (
              <li key={row.step} className="rounded border border-kelly-text/10 px-3 py-2">
                <span className="font-bold text-violet-900">
                  {row.step}. {row.dimension}
                </span>
                <span className="block">{row.detail}</span>
              </li>
            ))}
          </ol>
        </Block>
      ) : null}

      {(drill.relatedActs.length > 0 || drill.relatedBills.length > 0) && (
        <Block title="Record anchors">
          {drill.relatedActs.length > 0 ? (
            <p>
              <span className="font-bold">Acts:</span> {drill.relatedActs.join(", ")}
            </p>
          ) : null}
          {drill.relatedBills.length > 0 ? (
            <p className="mt-2">
              <span className="font-bold">Bills:</span>{" "}
              {drill.relatedBills.map((b) => (
                <Link
                  key={b}
                  href={`/admin/intelligence/kim-hammer/bills/${b}/act-proof`}
                  className="mr-2 font-bold text-kelly-navy underline"
                >
                  {b}
                </Link>
              ))}
            </p>
          ) : null}
          <Link href="/admin/intelligence/video-archive-room" className="mt-3 inline-block font-bold text-kelly-navy underline">
            Legislative offense tab →
          </Link>
        </Block>
      )}

      {drill.ifHeDoesNotBite.length > 0 ? (
        <Block title="If he does not bite">
          <ul className="list-inside list-disc">
            {drill.ifHeDoesNotBite.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </Block>
      ) : null}

      {drill.packoNote ? (
        <article className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 text-xs">
          <p className="font-bold text-sky-950">Packo / three-way</p>
          <p className="mt-2">{drill.packoNote}</p>
        </article>
      ) : null}

      <Block title="Mistakes first-timers make">
        <ul className="list-inside list-disc text-rose-950">
          {drill.mistakesFirstTimersMake.map((m) => (
            <li key={m.slice(0, 40)}>{m}</li>
          ))}
        </ul>
      </Block>

      <article className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 text-xs">
        <p className="font-bold uppercase text-emerald-950">Body language & tone</p>
        <p className="mt-2">{drill.bodyLanguageAndTone}</p>
        <p className="mt-4 font-bold uppercase text-emerald-950">Rehearsal steps</p>
        <ol className="mt-2 list-inside list-decimal">
          {drill.rehearsalSteps.map((step) => (
            <li key={step.slice(0, 40)}>{step}</li>
          ))}
        </ol>
      </article>

      <nav className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
        {prev ? (
          <Link href={`/admin/intelligence/trap-lanes/${prev.laneId}`} className="text-kelly-navy underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        <Link href="/admin/intelligence/trap-lanes" className="text-kelly-navy underline">
          All trap lanes
        </Link>
        {next ? (
          <Link href={`/admin/intelligence/trap-lanes/${next.laneId}`} className="text-kelly-navy underline">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
