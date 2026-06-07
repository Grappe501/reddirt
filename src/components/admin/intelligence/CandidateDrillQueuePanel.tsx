import Link from "next/link";
import { CandidateDrillQueueCardPlayer } from "@/components/admin/intelligence/CandidateDrillQueueCardPlayer";
import type { DrillQueue, DrillQueueCard } from "@/lib/intelligence/v4/phase16P3DrillQueue";

export function CandidateDrillQueuePanel({
  queues,
  cards,
  activeQueue,
}: {
  queues: DrillQueue[];
  cards: DrillQueueCard[];
  activeQueue: DrillQueue;
}) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">Drill queues</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {queues.map((queue) => (
            <Link
              key={queue.queueId}
              href={queue.launchHref}
              className={`rounded-xl border bg-white p-4 text-sm transition hover:border-teal-400 ${
                queue.queueId === activeQueue.queueId ? "border-teal-400 ring-1 ring-teal-200" : "border-teal-200"
              }`}
            >
              <p className="font-bold text-kelly-navy">{queue.title}</p>
              <p className="mt-2 text-xs text-kelly-muted">
                {queue.cardCount} cards · ~{queue.estimatedMinutes} min
              </p>
            </Link>
          ))}
        </div>
      </section>

      <CandidateDrillQueueCardPlayer queueId={activeQueue.queueId} cards={cards} queueTitle={activeQueue.title} />

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">Queue outline — {activeQueue.title}</h2>
        <ol className="space-y-2">
          {cards.map((card) => (
            <li key={card.cardId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-kelly-text/10 bg-white px-3 py-2 text-xs">
              <span>
                <span className="font-bold text-kelly-navy">{card.order}.</span> {card.title}
                <span className="ml-2 text-[10px] uppercase text-kelly-subtle">{card.cardType}</span>
              </span>
              <span className="font-mono text-[10px] text-kelly-muted">
                {card.stageSafeBlocked ? "blocked" : "clear"} · {card.durationLabel}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
