import Link from "next/link";
import type { V3DebatePrepSection } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
import type { DebatePrepSectionDrillDown } from "@/lib/intelligence/v4/debatePrepDrillDownTypes";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { getPrepSectionGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4EncounterDepthPanel } from "@/components/admin/intelligence/v4/V4EncounterDepthPanel";

export function V4DebatePrepSectionDrillDownPanel({
  drill,
  section,
}: {
  drill: DebatePrepSectionDrillDown;
  section?: V3DebatePrepSection;
}) {
  const guide = getPrepSectionGuide(drill.sectionId);

  return (
    <div className="space-y-6">
      <article className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-950">First debate · vs seasoned opponent</p>
        <p className="mt-2 text-sm leading-relaxed text-amber-950">{drill.firstTimeDebateNote}</p>
        <p className="mt-3 text-xs font-bold text-kelly-navy">
          Estimated prep for this section: ~{drill.estimatedPrepMinutes} minutes · Section {drill.sectionNumber} of 28
        </p>
      </article>

      {guide ? <V4OperatorGuide guide={guide} /> : null}

      {drill.encounterDepth ? <V4EncounterDepthPanel depth={drill.encounterDepth} /> : null}

      <DrillBlock title="What Hammer will likely do">
        <ul className="list-inside list-disc">
          {drill.whatOpponentWillDo.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </DrillBlock>

      <DrillBlock title="What the moderator may ask">
        <ul className="list-inside list-disc">
          {drill.whatModeratorMayAsk.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </DrillBlock>

      <DrillBlock title="Setup moves (trap positioning before he speaks)">
        <ol className="list-inside list-decimal space-y-1">
          {drill.setupMoves.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ol>
      </DrillBlock>

      {drill.rebuttalScripts.length > 0 ? (
        <section className="rounded-xl border border-violet-200 bg-white p-5">
          <h3 className="text-sm font-bold uppercase text-violet-950">Rebuttal scripts — agree · contrast · bridge</h3>
          <p className="mt-1 text-xs text-kelly-muted">Read aloud with staff playing Hammer. Do not memorize zingers unless claims allow.</p>
          <div className="mt-4 space-y-4">
            {drill.rebuttalScripts.map((script) => (
              <article key={script.trigger} className="rounded-lg border border-kelly-text/10 p-4 text-xs">
                <p className="font-bold text-rose-900">When: {script.trigger}</p>
                <p className="mt-2 italic text-kelly-muted">Hammer may say: &ldquo;{script.hammerLikelyLine}&rdquo;</p>
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
                  <p className="mt-2 rounded bg-kelly-navy/5 px-2 py-1 font-semibold text-kelly-navy">Zinger (optional): {script.zinger}</p>
                ) : null}
                {script.claimsNote ? <p className="mt-2 text-amber-900">Claims: {script.claimsNote}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {drill.sampleScripts.length > 0 ? (
        <section className="rounded-xl border border-kelly-navy/15 bg-white p-5">
          <h3 className="text-sm font-bold uppercase text-kelly-navy">Sample scripts — stand and deliver</h3>
          <div className="mt-3 space-y-3">
            {drill.sampleScripts.map((script) => (
              <article key={script.label} className="rounded-lg border border-kelly-text/10 bg-kelly-page/30 p-4 text-xs">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-bold text-kelly-navy">{script.label}</span>
                  <span className="font-mono text-[10px] text-kelly-subtle">{script.duration}</span>
                </div>
                <p className="mt-2 leading-relaxed text-kelly-text">{script.text}</p>
                {script.deliveryNote ? <p className="mt-2 font-semibold text-violet-900">Delivery: {script.deliveryNote}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {drill.zingers.length > 0 ? (
        <section className="rounded-xl border border-kelly-navy/20 bg-kelly-navy/5 p-5">
          <h3 className="text-sm font-bold uppercase text-kelly-navy">Zingers — use sparingly</h3>
          <ul className="mt-3 space-y-3 text-xs">
            {drill.zingers.map((z) => (
              <li key={z.line.slice(0, 40)} className="rounded-lg border border-kelly-navy/10 bg-white p-3">
                <p className="font-semibold text-kelly-navy">&ldquo;{z.line}&rdquo;</p>
                <p className="mt-2 text-emerald-900">
                  <span className="font-bold">When:</span> {z.whenToUse}
                </p>
                <p className="mt-1 text-rose-900">
                  <span className="font-bold">Do not use when:</span> {z.whenNotToUse}
                </p>
                {z.claimsGate ? <p className="mt-1 text-amber-900">Claims gate: {z.claimsGate}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <DrillBlock title="Mistakes first-time debaters make">
          <ul className="list-inside list-disc text-rose-950">
            {drill.mistakesFirstTimersMake.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </DrillBlock>
        <DrillBlock title="Body language & tone">
          <p>{drill.bodyLanguageAndTone}</p>
        </DrillBlock>
      </div>

      <DrillBlock title="Rehearsal steps (this section)">
        <ol className="list-inside list-decimal">
          {drill.rehearsalSteps.map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ol>
      </DrillBlock>

      <DrillBlock title="Staff role">
        <p>{drill.staffRole}</p>
      </DrillBlock>

      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h3 className="text-[10px] font-bold uppercase text-kelly-subtle">Related surfaces</h3>
        <ul className="mt-2 flex flex-wrap gap-2 text-xs">
          {drill.relatedLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="rounded-full border border-kelly-navy/30 px-3 py-1 font-bold text-kelly-navy hover:bg-kelly-page">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {section ? (
        <section className="rounded-xl border-2 border-kelly-text/10 bg-white p-5">
          <h3 className="text-sm font-bold uppercase text-kelly-navy">Research packet — summary content</h3>
          <p className="mt-1 text-[10px] text-kelly-subtle">Verify acts and claims before citing on stage.</p>
          {section.paragraphs.length > 0 ? (
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-kelly-muted">
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
          ) : null}
          {section.bullets.length > 0 ? (
            <ul className="mt-3 list-inside list-disc text-xs text-kelly-muted">
              {section.bullets.map((bullet) => (
                <li key={bullet.slice(0, 64)}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

import type { ReactNode } from "react";

function DrillBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-sky-100 bg-sky-50/30 p-4 text-xs leading-relaxed text-kelly-text">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-sky-900">{title}</h3>
      <div className="mt-2 text-kelly-muted">{children}</div>
    </section>
  );
}
