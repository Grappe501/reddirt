"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KELLY_CLOSING_SCRIPTS,
  KELLY_ONLY_WOMAN_ON_STAGE,
  KELLY_OPENING_SCRIPTS,
  KELLY_PSYCHOLOGY_PREP,
  KELLY_STAGE_PRESENCE,
  PACKO_IN_DEBATE_PREP,
  THREE_WAY_DEBATE_STRATEGY,
} from "@/lib/intelligence/v4/kellyDebateCoaching";
import {
  ANYTHING_BUT_HAMMER_STRATEGY,
  KELLY_SUPERIORITY_PILLARS,
  OFFENSIVE_OPENING_HEELS,
  RECORD_OFFENSE_PLAYBOOK,
  ROAD_STORY_INTEGRATION,
} from "@/lib/intelligence/v4/kellyOffensiveDebateStrategy";
import {
  KELLY_ATTACK_VECTORS,
  KELLY_RESEARCH_PREP_SEQUENCE,
} from "@/lib/intelligence/v4/kellyCandidateResearchDepth";
import {
  KELLY_COURT_DILIGENCE_PUBLIC_NOTE,
  KELLY_PUBLIC_RECORD_BRIEF,
  KELLY_PUBLIC_RECORD_PREP_SEQUENCE,
} from "@/lib/intelligence/v4/kellyCandidatePublicRecordBrief";
import {
  KELLY_OFFENSIVE_MOVES,
  OFFENSIVE_APPROACH_NARRATIVE,
} from "@/lib/intelligence/v4/kellyOffensiveApproachDepth";
import {
  HAMMER_STATEMENT_FLIPS,
  HOW_WE_PLAY_OUR_HAND,
  OFFENSIVE_DEBATE_PRINCIPLES,
} from "@/lib/intelligence/v4/kellyOffensivePrinciples";
import type { HammerDirectDemocracyPacket } from "@/lib/intelligence/v4/hammerDirectDemocracyOffensive";
import type { KellyRoadStoriesFile } from "@/lib/intelligence/loadKellyRoadStories";
import type { KellyCandidateSuggestion } from "@/lib/legislature/videoArchiveRoomManifest";
import { KellyOffensiveNarrativePanel } from "@/components/admin/intelligence/KellyOffensiveNarrativePanel";
import { IntelligenceAgentCopilotDock } from "@/components/admin/intelligence/IntelligenceAgentCopilotDock";
import { isCandidateIpadMode } from "@/lib/intelligence/candidateIpadMode";

function CoachingSection({ block }: { block: { title: string; bullets: string[]; doNot: string[] } }) {
  return (
    <article className="rounded-xl border border-sky-100 bg-white p-5 text-xs">
      <h3 className="text-sm font-bold uppercase text-sky-950">{block.title}</h3>
      <ul className="mt-3 list-inside list-disc space-y-1 text-kelly-muted">
        {block.bullets.map((b) => (
          <li key={b.slice(0, 48)}>{b}</li>
        ))}
      </ul>
      {block.doNot.length > 0 ? (
        <>
          <p className="mt-4 font-bold uppercase text-rose-900">Do not</p>
          <ul className="mt-2 list-inside list-disc text-rose-950">
            {block.doNot.map((b) => (
              <li key={b.slice(0, 48)}>{b}</li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}

export function KellyDebateCoachingPanel({
  suggestions,
  compact,
  directDemocracy,
  roadStories,
  vvsgEducation,
}: {
  suggestions: KellyCandidateSuggestion[];
  compact?: boolean;
  directDemocracy?: HammerDirectDemocracyPacket;
  roadStories?: KellyRoadStoriesFile;
  vvsgEducation?: {
    executiveSummary: string;
    whatToKnow: string[];
    fairPublicLine: string;
    href: string;
  };
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitSuggestion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/intelligence/debate-coaching/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: String(fd.get("text")),
          category: String(fd.get("category")),
          createdBy: String(fd.get("createdBy") || "Kelly"),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      setStatus(data.ok ? "Saved — refresh to see in list." : data.error ?? "Failed");
      if (data.ok) (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {!compact ? (
        <>
        <article className="rounded-xl border-2 border-emerald-300 bg-emerald-50/50 p-5 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-950">Your dossier · read first</p>
          <h2 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Experience-to-Office Alignment Profile</h2>
          <p className="mt-2 leading-relaxed text-kelly-text">
            Single-page readout mapping your leadership, training, civic education, and rural roots to what the Secretary of
            State actually does — with debate framing examples, a 30-second bio framework, and twelve drill-down sections.
            Read this before offensive scripts so every answer follows Experience → Skill → Office.
          </p>
          <Link
            href="/admin/intelligence/candidate-dossiers/kelly-grappe"
            className="mt-3 inline-flex min-h-12 items-center rounded-full border-2 border-emerald-400 bg-white px-4 text-sm font-bold text-emerald-950"
          >
            Open your alignment profile →
          </Link>
        </article>

        <article className="rounded-xl border-4 border-kelly-navy bg-kelly-navy p-5 text-xs text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-gold">Offensive constitution — read first</p>
          <h2 className="mt-2 font-heading text-xl font-bold">{OFFENSIVE_DEBATE_PRINCIPLES.headline}</h2>
          <div className="mt-4 space-y-3">
            {OFFENSIVE_DEBATE_PRINCIPLES.principles.map((p) => (
              <div key={p.id} className="rounded-lg border border-white/20 bg-white/5 p-3">
                <p className="font-bold text-kelly-gold">
                  {p.id}. {p.title}
                </p>
                <p className="mt-1 leading-relaxed text-white/90">{p.rule}</p>
              </div>
            ))}
          </div>
        </article>

        {vvsgEducation ? (
          <article className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-5 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-950">VVSG 2.0 · EAC May 2026</p>
            <p className="mt-2 text-kelly-muted">{vvsgEducation.executiveSummary}</p>
            <p className="mt-3 font-bold text-kelly-navy">Know before stage</p>
            <ul className="mt-2 list-inside list-disc text-kelly-muted">
              {vvsgEducation.whatToKnow.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg border border-indigo-100 bg-white p-3 text-sm italic text-indigo-950">
              &ldquo;{vvsgEducation.fairPublicLine}&rdquo;
            </p>
            <Link href={vvsgEducation.href} className="mt-3 inline-block font-bold text-kelly-navy underline">
              Full VVSG 2.0 education module →
            </Link>
          </article>
        ) : null}

        <KellyOffensiveNarrativePanel />

        <article className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-5 text-xs">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">{OFFENSIVE_APPROACH_NARRATIVE.headline}</h2>
          <ul className="mt-3 list-inside list-disc text-kelly-muted">
            {OFFENSIVE_APPROACH_NARRATIVE.philosophy.map((p) => (
              <li key={p.slice(0, 48)}>{p}</li>
            ))}
          </ul>
          <p className="mt-4 font-bold uppercase text-indigo-950">Minute-by-minute offense</p>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {OFFENSIVE_APPROACH_NARRATIVE.minuteByMinute.map((m) => (
              <li key={m.slice(0, 48)}>{m}</li>
            ))}
          </ul>
        </article>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Offensive moves — respond · rebut · lead</h2>
          {KELLY_OFFENSIVE_MOVES.map((move) => (
            <article key={move.id} className="rounded-xl border border-emerald-100 bg-white p-4 text-xs">
              <p className="font-bold text-emerald-950">{move.name}</p>
              <p className="mt-1 text-kelly-subtle">When: {move.whenToUse}</p>
              <p className="mt-2">
                <span className="font-semibold text-kelly-navy">Setup:</span> {move.setup}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-violet-900">Execute:</span> {move.execution}
              </p>
              <p className="mt-2 italic text-rose-950/90">He may say: &ldquo;{move.expectedOpponentResponse}&rdquo;</p>
              <p className="mt-2">
                <span className="font-semibold text-sky-900">Round 2:</span> {move.secondRoundKelly}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-sky-900">Round 3:</span> {move.thirdRoundKelly}
              </p>
              <p className="mt-2 text-[10px] text-amber-900">{move.educationNote}</p>
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Kelly candidate research — how they come after her</h2>
          <p className="text-xs text-kelly-muted">Defensive depth: expect · respond · verify before stage.</p>
          {KELLY_ATTACK_VECTORS.map((v) => (
            <article key={v.id} className="rounded-xl border border-rose-100 bg-white p-4 text-xs">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-950">
                  {v.prepPriority}
                </span>
                <span className="rounded-full border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                  {v.verificationStatus}
                </span>
              </div>
              <p className="mt-2 font-bold text-kelly-navy">{v.title}</p>
              <p className="mt-2 font-semibold text-rose-950">How they come after her</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {v.howTheyComeAfterHer.map((l) => (
                  <li key={l.slice(0, 48)}>{l}</li>
                ))}
              </ul>
              <p className="mt-2 font-semibold text-violet-950">On stage</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {v.whatToExpectOnStage.map((l) => (
                  <li key={l.slice(0, 48)}>{l}</li>
                ))}
              </ul>
              <p className="mt-2 font-semibold text-emerald-950">Kelly response framework</p>
              <ul className="mt-1 list-inside list-disc text-kelly-muted">
                {v.kellyResponseFramework.map((l) => (
                  <li key={l.slice(0, 48)}>{l}</li>
                ))}
              </ul>
            </article>
          ))}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-violet-950">Public record brief — sourced facts</h3>
            <p className="text-xs text-kelly-muted">{KELLY_COURT_DILIGENCE_PUBLIC_NOTE}</p>
            {KELLY_PUBLIC_RECORD_BRIEF.map((fact) => (
              <article key={fact.id} className="rounded-xl border border-violet-100 bg-white p-4 text-xs">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-950">
                    {fact.category}
                  </span>
                  <span className="rounded-full border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
                    {fact.verificationStatus}
                  </span>
                </div>
                <p className="mt-2 font-bold text-kelly-navy">{fact.headline}</p>
                <p className="mt-2 text-kelly-muted">{fact.summary}</p>
                <p className="mt-2 font-semibold text-rose-950">How opponents use it</p>
                <ul className="mt-1 list-inside list-disc text-kelly-muted">
                  {fact.howOpponentsUseIt.map((l) => (
                    <li key={l.slice(0, 48)}>{l}</li>
                  ))}
                </ul>
                <p className="mt-2 font-semibold text-emerald-950">Kelly response</p>
                <ul className="mt-1 list-inside list-disc text-kelly-muted">
                  {fact.kellyResponseFramework.map((l) => (
                    <li key={l.slice(0, 48)}>{l}</li>
                  ))}
                </ul>
                {fact.sources.length > 0 ? (
                  <p className="mt-2 text-[10px] text-kelly-muted">
                    Sources:{" "}
                    {fact.sources.map((s) => s.label).join(" · ")}
                  </p>
                ) : null}
              </article>
            ))}
          </section>
          <article className="rounded-lg border border-kelly-navy/15 bg-kelly-page/40 p-4">
            <p className="font-bold uppercase text-kelly-navy">Research prep sequence</p>
            <ol className="mt-2 list-inside list-decimal text-kelly-muted">
              {KELLY_PUBLIC_RECORD_PREP_SEQUENCE.map((s) => (
                <li key={s.slice(0, 48)}>{s}</li>
              ))}
            </ol>
          </article>
          <article className="rounded-lg border border-kelly-navy/15 bg-kelly-page/40 p-4">
            <p className="font-bold uppercase text-kelly-navy">Attack vector prep sequence</p>
            <ol className="mt-2 list-inside list-decimal text-kelly-muted">
              {KELLY_RESEARCH_PREP_SEQUENCE.map((s) => (
                <li key={s.slice(0, 48)}>{s}</li>
              ))}
            </ol>
            <Link
              href="/admin/intelligence/diligence/kelly-grappe"
              className="mt-3 inline-block text-[10px] font-bold text-rose-900 underline"
            >
              Phase A — log five-search diligence checklist →
            </Link>
          </article>
        </section>

        <article className="rounded-xl border-2 border-sky-200 bg-sky-50/50 p-5 text-xs">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">{HOW_WE_PLAY_OUR_HAND.headline}</h2>
          <p className="mt-2 font-semibold text-sky-950">Table stakes</p>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {HOW_WE_PLAY_OUR_HAND.tableStakes.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
          <p className="mt-4 font-semibold text-sky-950">Rhythm (absorb → pivot → act → exit)</p>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {HOW_WE_PLAY_OUR_HAND.rhythm.map((t) => (
              <li key={t.slice(0, 40)}>{t}</li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-white p-3">
              <p className="font-bold text-emerald-950">Press when</p>
              <ul className="mt-2 list-inside list-disc text-kelly-muted">
                {HOW_WE_PLAY_OUR_HAND.whenToPress.map((t) => (
                  <li key={t.slice(0, 40)}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white p-3">
              <p className="font-bold text-amber-950">De-escalate when</p>
              <ul className="mt-2 list-inside list-disc text-kelly-muted">
                {HOW_WE_PLAY_OUR_HAND.whenToDeEscalate.map((t) => (
                  <li key={t.slice(0, 40)}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-kelly-navy/20 bg-kelly-page/50 p-3 font-semibold text-kelly-navy">
            Win condition: {HOW_WE_PLAY_OUR_HAND.winCondition}
          </p>
        </article>

        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Turn Hammer&apos;s lines into our strengths</h2>
          <p className="text-xs text-kelly-muted">
            When he says X, do not fight the frame — flip it. Proof anchors link to acts, transcripts, and road stories.
          </p>
          {HAMMER_STATEMENT_FLIPS.map((flip) => (
            <article key={flip.id} className="rounded-xl border border-rose-100 bg-white p-4 text-xs">
              <p className="text-[10px] font-mono uppercase text-rose-900">{flip.id}</p>
              <p className="mt-2 font-bold text-rose-950">He says: &ldquo;{flip.hammerSays}&rdquo;</p>
              <p className="mt-1 text-kelly-subtle">Sounds like: {flip.whatItSoundsLike}</p>
              <p className="mt-3 font-bold text-emerald-950">Kelly turn:</p>
              <p className="mt-1 leading-relaxed text-kelly-text">{flip.kellyTurn}</p>
              <p className="mt-3 text-[10px] text-violet-950">
                <strong>Proof:</strong> {flip.proofAnchor}
              </p>
              <p className="mt-1 text-[10px] text-amber-900">{flip.claimsNote}</p>
            </article>
          ))}
        </section>

        <article className="rounded-xl border-2 border-rose-200 bg-rose-50/40 p-5 text-xs">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">{OFFENSIVE_OPENING_HEELS.headline}</h2>
          <p className="mt-2 text-kelly-muted">{OFFENSIVE_OPENING_HEELS.tone}</p>
          <p className="mt-3 font-bold uppercase text-rose-950">Minute one</p>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {OFFENSIVE_OPENING_HEELS.minuteOneMoves.map((m) => (
              <li key={m.slice(0, 40)}>{m}</li>
            ))}
          </ul>
          <p className="mt-3 font-semibold text-violet-950">First trap (90s): {OFFENSIVE_OPENING_HEELS.firstTrapWithin90s}</p>
          <Link href="/admin/intelligence/video-archive-room" className="mt-3 inline-block font-bold text-kelly-navy underline">
            Video archive · legislative offense tab →
          </Link>
        </article>

        <article className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 text-xs">
          <h2 className="font-bold uppercase text-emerald-950">{KELLY_SUPERIORITY_PILLARS.headline}</h2>
          <ul className="mt-3 list-inside list-disc text-kelly-muted">
            {KELLY_SUPERIORITY_PILLARS.forThePeople.map((b) => (
              <li key={b.slice(0, 40)}>{b}</li>
            ))}
          </ul>
          <p className="mt-3 text-kelly-text"><strong>vs Hammer:</strong> {KELLY_SUPERIORITY_PILLARS.vsHammer}</p>
          <p className="mt-1 text-kelly-text"><strong>vs Packo:</strong> {KELLY_SUPERIORITY_PILLARS.vsPacko}</p>
        </article>

        <article className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 text-xs">
          <h2 className="font-bold uppercase text-amber-950">{ANYTHING_BUT_HAMMER_STRATEGY.phase}</h2>
          <p className="mt-2 text-kelly-muted">{ANYTHING_BUT_HAMMER_STRATEGY.electoralMath}</p>
          <div className="mt-4 space-y-3">
            {ANYTHING_BUT_HAMMER_STRATEGY.publicMessagingPhases.map((p) => (
              <div key={p.phase} className="rounded border border-amber-100 bg-white p-3">
                <p className="font-bold text-amber-950">{p.phase}</p>
                <p className="mt-1 text-kelly-muted">{p.message}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-bold text-violet-950">Packo-friendly (on stage now)</p>
          <ul className="mt-2 list-inside list-disc">
            {ANYTHING_BUT_HAMMER_STRATEGY.packoFriendlyLines.map((l) => (
              <li key={l.slice(0, 40)}>{l}</li>
            ))}
          </ul>
          <p className="mt-4 font-bold text-rose-950">Do not say yet</p>
          <ul className="mt-2 list-inside list-disc text-rose-950">
            {ANYTHING_BUT_HAMMER_STRATEGY.doNotSayYet.map((l) => (
              <li key={l.slice(0, 40)}>{l}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-kelly-navy/15 bg-white p-5 text-xs">
          <h2 className="font-bold uppercase text-kelly-navy">{RECORD_OFFENSE_PLAYBOOK.headline}</h2>
          <p className="mt-2 text-kelly-muted">{RECORD_OFFENSE_PLAYBOOK.closingSuperiority}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {RECORD_OFFENSE_PLAYBOOK.lanes.map((lane) => (
              <div key={lane.lane} className="rounded-lg border border-kelly-text/10 p-3">
                <p className="font-bold text-kelly-navy">{lane.lane}</p>
                <p className="mt-1 text-[10px] font-mono text-amber-900">Acts: {lane.acts.join(", ")}</p>
                <p className="mt-2 text-kelly-muted"><strong>Record:</strong> {lane.hammerPaint}</p>
                <p className="mt-1 text-emerald-950"><strong>Kelly:</strong> {lane.kellyExit}</p>
              </div>
            ))}
          </div>
        </article>

        {directDemocracy ? (
          <article className="rounded-xl border border-rose-100 bg-rose-50/20 p-5 text-xs">
            <h2 className="font-bold uppercase text-rose-950">{directDemocracy.clusterLabel}</h2>
            <p className="mt-2 text-kelly-muted">{directDemocracy.thesis}</p>
            <p className="mt-3 text-[10px] text-amber-900">
              Top acts to cite:{" "}
              {directDemocracy.bills
                .slice(0, 6)
                .map((b) => (b.actNumber ? `Act ${b.actNumber}` : b.billNumber))
                .join(" · ")}
            </p>
            <Link href="/admin/intelligence/video-archive-room" className="mt-3 inline-block font-bold underline">
              Full bill traps in video archive →
            </Link>
          </article>
        ) : null}

        <article className="rounded-xl border border-emerald-100 p-5 text-xs">
          <h2 className="font-bold uppercase text-emerald-950">{ROAD_STORY_INTEGRATION.headline}</h2>
          <ul className="mt-3 list-inside list-disc text-kelly-muted">
            {ROAD_STORY_INTEGRATION.rules.map((r) => (
              <li key={r.slice(0, 40)}>{r}</li>
            ))}
          </ul>
          {roadStories && roadStories.storySlots.length > 0 ? (
            <div className="mt-4 space-y-2">
              {roadStories.storySlots.slice(0, 3).map((s) => (
                <p key={s.id} className="rounded border border-kelly-text/10 p-2 text-kelly-muted">
                  <strong>{s.title}</strong> ({s.claimsStatus}): {s.story.slice(0, 120)}…
                </p>
              ))}
            </div>
          ) : null}
        </article>
        </>
      ) : null}

      {!compact ? (
        <article className="rounded-xl border-2 border-violet-200 bg-violet-50/40 p-5 text-sm">
          <h2 className="font-heading text-xl font-bold text-kelly-navy">{THREE_WAY_DEBATE_STRATEGY.headline}</h2>
          <p className="mt-2 text-kelly-muted">
            <strong>Kelly:</strong> {THREE_WAY_DEBATE_STRATEGY.kellyRole}
          </p>
          <p className="mt-1 text-kelly-muted">
            <strong>Hammer:</strong> {THREE_WAY_DEBATE_STRATEGY.hammerRole}
          </p>
          <p className="mt-1 text-kelly-muted">
            <strong>Packo:</strong> {THREE_WAY_DEBATE_STRATEGY.packoRole}
          </p>
          <Link href="/admin/intelligence/video-archive-room" className="mt-3 inline-block text-xs font-bold text-kelly-navy underline">
            Opponent video archive →
          </Link>
        </article>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Three-way cross lanes</h2>
        {THREE_WAY_DEBATE_STRATEGY.crossLanes.map((lane) => (
          <article key={lane.scenario} className="rounded-lg border border-kelly-text/10 p-4 text-xs">
            <p className="font-bold text-violet-950">{lane.scenario}</p>
            <p className="mt-1 text-kelly-muted">Hammer: {lane.hammerLikely}</p>
            {"packoMayAdd" in lane && lane.packoMayAdd ? <p className="mt-1 text-kelly-muted">Packo: {lane.packoMayAdd}</p> : null}
            <p className="mt-2 font-semibold text-emerald-950">Kelly: {lane.kellyMove}</p>
          </article>
        ))}
      </section>

      {!compact ? (
        <article className="rounded-xl border border-amber-100 bg-amber-50/30 p-5 text-xs">
          <h3 className="font-bold uppercase text-amber-950">{PACKO_IN_DEBATE_PREP.headline}</h3>
          <p className="mt-2 text-amber-900">{PACKO_IN_DEBATE_PREP.spellingNote}</p>
          <p className="mt-3 font-bold">Kelly bridges</p>
          <ul className="mt-2 list-inside list-disc">
            {PACKO_IN_DEBATE_PREP.kellyBridges.map((b) => (
              <li key={b.slice(0, 40)}>{b}</li>
            ))}
          </ul>
          <Link href="/admin/intelligence/opponents/michael-packo" className="mt-3 inline-block font-bold text-kelly-navy underline">
            Pakko command center →
          </Link>
        </article>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <CoachingSection block={KELLY_ONLY_WOMAN_ON_STAGE} />
        <CoachingSection block={KELLY_STAGE_PRESENCE} />
      </div>
      <CoachingSection block={KELLY_PSYCHOLOGY_PREP} />

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase text-kelly-navy">Opening statements — rehearse standing</h2>
        <div className="space-y-3">
          {KELLY_OPENING_SCRIPTS.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase text-kelly-navy">Closing statements</h2>
        <div className="space-y-3">
          {KELLY_CLOSING_SCRIPTS.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      </section>

      {!compact && !isCandidateIpadMode() ? <IntelligenceAgentCopilotDock /> : null}

      <section className="rounded-xl border-2 border-kelly-navy/15 bg-white p-5">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Kelly&apos;s suggestions for staff</h2>
        <p className="mt-1 text-xs text-kelly-muted">Your lines, worries, or ideas — staff folds into prep packet after review.</p>
        <form onSubmit={submitSuggestion} className="mt-4 space-y-2 text-xs">
          <select name="category" className="w-full rounded border px-2 py-1" defaultValue="coaching">
            <option value="opening">Opening</option>
            <option value="closing">Closing</option>
            <option value="rebuttal">Rebuttal</option>
            <option value="coaching">Coaching / presence</option>
            <option value="other">Other</option>
          </select>
          <textarea name="text" required rows={3} placeholder="e.g. I want a softer line on clerks in the 60s opening…" className="w-full rounded border px-2 py-1" />
          <input name="createdBy" placeholder="Your name" className="w-full rounded border px-2 py-1" />
          <button type="submit" disabled={busy} className="rounded bg-kelly-navy px-3 py-1.5 font-bold text-white disabled:opacity-50">
            Submit suggestion
          </button>
        </form>
        {status ? <p className="mt-2 text-amber-900">{status}</p> : null}
        {suggestions.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {suggestions.map((s) => (
              <li key={s.id} className="rounded border border-kelly-text/10 px-3 py-2 text-xs">
                <span className="font-mono text-[10px] uppercase text-kelly-subtle">{s.category}</span>
                <p className="mt-1">{s.text}</p>
                <p className="mt-1 text-[10px] text-kelly-subtle">{new Date(s.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-xs text-kelly-muted">No suggestions yet.</p>
        )}
      </section>
    </div>
  );
}

function ScriptCard({
  script,
}: {
  script: {
    label: string;
    durationSeconds: number;
    text: string;
    deliveryNotes: string[];
    claimsGate: string;
  };
}) {
  return (
    <article className="rounded-xl border border-kelly-navy/15 bg-kelly-page/20 p-4 text-xs">
      <div className="flex justify-between gap-2">
        <span className="font-bold text-kelly-navy">{script.label}</span>
        <span className="font-mono text-[10px] text-kelly-subtle">~{script.durationSeconds}s</span>
      </div>
      <p className="mt-3 leading-relaxed text-kelly-text">{script.text}</p>
      <p className="mt-2 text-[10px] text-amber-900">Claims: {script.claimsGate}</p>
      <ul className="mt-2 list-inside list-disc text-violet-900">
        {script.deliveryNotes.map((n) => (
          <li key={n.slice(0, 40)}>{n}</li>
        ))}
      </ul>
    </article>
  );
}
