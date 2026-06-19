"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StageSafeBlockedPanel } from "@/components/admin/intelligence/StageSafeBlockedPanel";
import { evaluateStageSafeContent } from "@/lib/intelligence/v4/phase15StageSafeFilter";
import type { DrillQueueCard, DrillQueueId } from "@/lib/intelligence/v4/phase16P3DrillQueue";
import { drillQueueCardTypeLabel } from "@/lib/intelligence/v4/phase16P3DrillQueue";

export function CandidateDrillQueueCardPlayer({
  queueId,
  cards,
  queueTitle,
  hubBaseHref = "/admin/intelligence/drill-queue",
}: {
  queueId: DrillQueueId;
  cards: DrillQueueCard[];
  queueTitle: string;
  hubBaseHref?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCard = searchParams.get("card");
  const parsed = rawCard ? Number.parseInt(rawCard, 10) : 1;
  const index = Number.isFinite(parsed) && parsed >= 1 ? Math.min(cards.length, parsed) - 1 : 0;
  const card = cards[index];
  if (!card) return null;

  const decision = evaluateStageSafeContent(card.claimsGate, "candidate");
  const prevIndex = index > 0 ? index : null;
  const nextIndex = index < cards.length - 1 ? index + 2 : null;

  function goToCard(cardNumber: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("queue", queueId);
    params.set("card", String(cardNumber));
    router.push(`${hubBaseHref}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-teal-200 bg-teal-50/30 p-4 text-sm">
        <p className="text-[10px] font-bold uppercase text-teal-950">{queueTitle}</p>
        <p className="mt-1 font-mono text-xs text-kelly-muted">
          Card {card.order} of {cards.length} · {card.durationLabel}
        </p>
      </section>

      <article className="rounded-xl border-2 border-teal-400/80 bg-white p-6 text-sm shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-950">
            {drillQueueCardTypeLabel(card.cardType)}
          </p>
          {card.stageSafeBlocked ? (
            <span className="rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-950">
              Stage-safe blocked
            </span>
          ) : (
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
              Clear to rehearse
            </span>
          )}
        </div>

        <h2 className="mt-3 font-heading text-xl font-bold text-kelly-navy">{card.title}</h2>
        <p className="mt-3 rounded-lg border border-kelly-text/10 bg-kelly-surface/30 p-3 text-xs italic text-kelly-muted">
          Prompt: {card.prompt}
        </p>

        {card.stageSafeBlocked ? (
          <div className="mt-4">
            <StageSafeBlockedPanel decision={decision} />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-4">
            <p className="text-[10px] font-bold uppercase text-emerald-950">Say this</p>
            <p className="mt-2 text-base leading-relaxed text-kelly-text">{card.speakLine}</p>
          </div>
        )}

        <p className="mt-4 text-xs text-kelly-muted">{card.kellyBeat}</p>

        <Link href={card.href} className="mt-4 inline-block text-xs font-bold text-kelly-navy underline">
          Open full drill-down →
        </Link>
      </article>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={prevIndex === null}
          onClick={() => prevIndex !== null && goToCard(prevIndex)}
          className="rounded-full border border-teal-300 bg-white px-4 py-2 text-xs font-bold text-teal-950 disabled:opacity-40"
        >
          ← Previous
        </button>
        <p className="font-mono text-[10px] text-kelly-subtle">
          {index + 1} / {cards.length}
        </p>
        <button
          type="button"
          disabled={nextIndex === null}
          onClick={() => nextIndex !== null && goToCard(nextIndex)}
          className="rounded-full border border-teal-500 bg-teal-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          Next card →
        </button>
      </div>
    </div>
  );
}
