import Link from "next/link";
import type { V4RehearsalCard } from "@/lib/intelligence/v4/debateIntelligenceV4Types";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";

export function V4RehearsalDeck({ cards }: { cards: V4RehearsalCard[] }) {
  const guide = getSurfaceGuide("rehearsalDeck");
  if (cards.length === 0) return <p className="text-xs text-kelly-muted">Drill queue empty.</p>;
  return (
    <div>
      {guide ? <V4OperatorGuide guide={guide} /> : null}
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
      {cards.map((card) => (
        <article key={card.billNumber} className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(card.billNumber)}`}
              className="font-heading text-lg font-bold text-kelly-navy underline"
            >
              {card.billNumber}
            </Link>
            <span className="text-[10px] font-bold uppercase text-amber-800">risk {card.risk}</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-kelly-text">{card.prompt}</p>
          <div className="mt-3 space-y-2 text-xs text-kelly-muted">
            <p>
              <span className="font-bold text-emerald-900">30s:</span> {card.answer30}
            </p>
            <p>
              <span className="font-bold text-sky-900">60s:</span> {card.answer60}
            </p>
            <p>
              <span className="font-bold text-violet-900">Rebuttal:</span> {card.rebuttalHint}
            </p>
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}
