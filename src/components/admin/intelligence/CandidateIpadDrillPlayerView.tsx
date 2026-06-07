"use client";

import Link from "next/link";
import { StageSafeBlockedPanel } from "@/components/admin/intelligence/StageSafeBlockedPanel";
import { evaluateStageSafeContent } from "@/lib/intelligence/v4/phase15StageSafeFilter";
import type { IpadDrillPlayerSession } from "@/lib/intelligence/v4/phase16P5IpadDrillPlayer";

export function CandidateIpadDrillPlayerView({ session }: { session: IpadDrillPlayerSession }) {
  const { card, queueTitle, totalCards, cardIndex } = session;
  const decision = evaluateStageSafeContent(card.claimsGate, "candidate");

  return (
    <div className="space-y-4 pb-4" data-phase16-p5="player-view">
      <section className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-950">{queueTitle}</p>
        <p className="mt-1 font-mono text-sm text-kelly-muted">
          Card {cardIndex + 1} of {totalCards} · {card.durationLabel}
        </p>
      </section>

      <article className="rounded-2xl border-2 border-teal-400/80 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-950">
          {card.cardType === "sos-speak-order" ? "SOS speak-order" : "Trap pivot"}
        </p>
        <h1 className="mt-3 font-heading text-2xl font-bold leading-tight text-kelly-navy">{card.title}</h1>
        <p className="mt-4 rounded-xl border border-kelly-text/10 bg-kelly-surface/30 p-4 text-sm italic leading-relaxed text-kelly-muted">
          {card.prompt}
        </p>

        {card.stageSafeBlocked ? (
          <div className="mt-4">
            <StageSafeBlockedPanel decision={decision} />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-5">
            <p className="text-[10px] font-bold uppercase text-emerald-950">Say this</p>
            <p className="mt-3 text-lg leading-relaxed text-kelly-text">{card.speakLine}</p>
          </div>
        )}

        <p className="mt-4 text-sm leading-relaxed text-kelly-muted">{card.kellyBeat}</p>

        <Link
          href={card.href}
          className="mt-4 inline-flex min-h-12 items-center text-sm font-bold text-kelly-navy underline"
        >
          Full drill-down →
        </Link>
      </article>
    </div>
  );
}
