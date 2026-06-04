"use client";

import Link from "next/link";
import {
  CHECK_MY_RECORD_PLAYBOOK,
  CHECK_MY_RECORD_REHEARSAL_SCRIPT,
  PACKO_NARRATIVE_CONTROL,
  RECORD_FINDING_FRAMES,
  STAGE_NARRATIVE_CONTROL,
} from "@/lib/intelligence/v4/kellyOffensiveNarrativeControl";

export function KellyOffensiveNarrativePanel() {
  return (
    <div className="space-y-6">
      <article className="rounded-xl border-2 border-violet-300 bg-violet-50/40 p-5 text-xs">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-950">Narrative control</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">{STAGE_NARRATIVE_CONTROL.headline}</h2>
        <p className="mt-3 leading-relaxed text-kelly-text">{STAGE_NARRATIVE_CONTROL.thesis}</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {STAGE_NARRATIVE_CONTROL.theThreeStories.map((s) => (
            <div key={s.candidate} className="rounded-lg border border-violet-200 bg-white p-3">
              <p className="font-bold text-kelly-navy">{s.candidate}</p>
              <p className="mt-2 text-[10px] font-bold uppercase text-rose-900">He wants</p>
              <p className="mt-1 text-kelly-muted">{s.storyHeWants}</p>
              <p className="mt-2 text-[10px] font-bold uppercase text-emerald-900">We allow</p>
              <p className="mt-1 text-kelly-muted">{s.storyWeAllow}</p>
              <p className="mt-2 text-[10px] font-bold uppercase text-amber-900">We refuse</p>
              <p className="mt-1 text-kelly-muted">{s.storyWeRefuse}</p>
            </div>
          ))}
        </div>
        <ul className="mt-4 list-inside list-disc space-y-1 text-kelly-muted">
          {STAGE_NARRATIVE_CONTROL.moderatorQuestions.map((q) => (
            <li key={q.slice(0, 48)}>{q}</li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg border border-kelly-navy/15 bg-kelly-page/40 p-3 font-semibold text-kelly-navy">
          {STAGE_NARRATIVE_CONTROL.closingNarrativeLock}
        </p>
      </article>

      <article className="rounded-xl border-4 border-rose-400 bg-rose-50/50 p-5 text-xs">
        <p className="text-[10px] font-bold uppercase text-rose-950">When he says it on every stop</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-navy">{CHECK_MY_RECORD_PLAYBOOK.headline}</h2>
        <p className="mt-3 leading-relaxed text-kelly-text">{CHECK_MY_RECORD_PLAYBOOK.mentalModel}</p>
        <p className="mt-3 font-bold text-rose-950">When it comes</p>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          {CHECK_MY_RECORD_PLAYBOOK.whenItComes.map((w) => (
            <li key={w.slice(0, 40)}>{w}</li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-[10px] font-bold uppercase text-kelly-navy">
          Index card: {CHECK_MY_RECORD_PLAYBOOK.indexCardVersion}
        </p>
        <div className="mt-4 space-y-3">
          {CHECK_MY_RECORD_PLAYBOOK.openingLineChoices.map((o) => (
            <div key={o.id} className="rounded-lg border border-rose-200 bg-white p-4">
              <p className="font-bold text-rose-950">{o.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-kelly-text">{o.text}</p>
              <ul className="mt-2 list-inside list-disc text-violet-900">
                {o.deliveryNotes.map((n) => (
                  <li key={n.slice(0, 40)}>{n}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </article>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Delivery walkthrough — follow these six beats</h2>
        <p className="mt-1 text-xs text-kelly-muted">Rehearse standing. Do not skip steps under pressure.</p>
        <div className="mt-4 space-y-4">
          {CHECK_MY_RECORD_PLAYBOOK.deliveryWalkthrough.map((beat) => (
            <article key={beat.step} className="rounded-xl border-2 border-kelly-navy/15 bg-white p-4 text-xs">
              <p className="font-mono text-lg font-bold text-kelly-navy">
                Step {beat.step} — {beat.label}
              </p>
              <p className="mt-3 rounded-lg bg-kelly-page/50 p-3 text-sm leading-relaxed text-kelly-text">{beat.sayThis}</p>
              <p className="mt-3 font-bold text-emerald-950">How to deliver</p>
              <ul className="mt-2 list-inside list-disc text-kelly-muted">
                {beat.deliveryNotes.map((n) => (
                  <li key={n.slice(0, 48)}>{n}</li>
                ))}
              </ul>
              {beat.doNot.length > 0 ? (
                <>
                  <p className="mt-3 font-bold text-rose-950">Do not</p>
                  <ul className="mt-2 list-inside list-disc text-rose-950">
                    {beat.doNot.map((n) => (
                      <li key={n.slice(0, 48)}>{n}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <article className="rounded-xl border border-amber-300 bg-amber-50/40 p-5 text-xs">
        <h3 className="font-bold uppercase text-amber-950">If he says check YOUR record</h3>
        <p className="mt-2 text-sm leading-relaxed text-kelly-text">{CHECK_MY_RECORD_PLAYBOOK.ifHeSaysCheckYours.sayThis}</p>
        <ul className="mt-3 list-inside list-disc text-kelly-muted">
          {CHECK_MY_RECORD_PLAYBOOK.ifHeSaysCheckYours.deliveryNotes.map((n) => (
            <li key={n.slice(0, 40)}>{n}</li>
          ))}
        </ul>
      </article>

      <article className="rounded-xl border-2 border-kelly-navy bg-kelly-page/30 p-5 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">{CHECK_MY_RECORD_REHEARSAL_SCRIPT.label}</h2>
          <span className="text-[10px] font-bold uppercase text-amber-900">{CHECK_MY_RECORD_REHEARSAL_SCRIPT.claimsGate}</span>
        </div>
        <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-kelly-text md:text-sm">
          {CHECK_MY_RECORD_REHEARSAL_SCRIPT.text}
        </p>
        <p className="mt-4 font-bold text-violet-950">Delivery checklist</p>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {CHECK_MY_RECORD_REHEARSAL_SCRIPT.deliveryChecklist.map((c) => (
            <li key={c.slice(0, 48)}>{c}</li>
          ))}
        </ul>
      </article>

      <section>
        <h2 className="text-sm font-bold uppercase text-kelly-navy">What we found — how it feeds offense</h2>
        <p className="mt-1 text-xs text-kelly-muted">Pick one frame per answer; do not stack all five.</p>
        <div className="mt-4 space-y-4">
          {RECORD_FINDING_FRAMES.map((f) => (
            <article key={f.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
              <p className="font-bold text-kelly-navy">{f.headline}</p>
              <p className="mt-2 leading-relaxed text-kelly-text">{f.narrative}</p>
              <p className="mt-2 font-mono text-[10px] text-amber-900">Acts: {f.exampleActs.join(", ")}</p>
              <p className="mt-2">
                <strong className="text-rose-950">Citizen harm:</strong> {f.citizenHarm}
              </p>
              <p className="mt-2">
                <strong className="text-emerald-950">Kelly:</strong> {f.kellyContrast}
              </p>
              <p className="mt-2 italic text-violet-950">
                <strong>If he doubles down:</strong> {f.trapIfHeDoublesDown}
              </p>
            </article>
          ))}
        </div>
        <Link href="/admin/intelligence/video-archive-room" className="mt-4 inline-block text-xs font-bold text-kelly-navy underline">
          Bill traps & PDFs in video archive →
        </Link>
      </section>

      <article className="rounded-xl border border-sky-200 bg-sky-50/40 p-5 text-xs">
        <h2 className="font-bold uppercase text-sky-950">{PACKO_NARRATIVE_CONTROL.headline}</h2>
        <div className="mt-4 space-y-3">
          <p>
            <strong>Packo vs duopoly:</strong> {PACKO_NARRATIVE_CONTROL.whenPackoAttacksDuopoly}
          </p>
          <p>
            <strong>Packo vs Hammer:</strong> {PACKO_NARRATIVE_CONTROL.whenPackoAttacksHammerRecord}
          </p>
          <p>
            <strong>Hammer vs Packo:</strong> {PACKO_NARRATIVE_CONTROL.whenHammerAttacksPackoAsSpoiler}
          </p>
          <p>
            <strong>Most qualified:</strong> {PACKO_NARRATIVE_CONTROL.whenModeratorAsksWhoIsMostQualified}
          </p>
        </div>
        <p className="mt-4 font-bold text-rose-950">Do not</p>
        <ul className="mt-2 list-inside list-disc text-rose-950">
          {PACKO_NARRATIVE_CONTROL.narrativeDoNot.map((n) => (
            <li key={n.slice(0, 40)}>{n}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}
