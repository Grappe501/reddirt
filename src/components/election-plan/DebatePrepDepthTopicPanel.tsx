import Link from "next/link";

import type { DebateDepthTopic } from "@/lib/intelligence/v4/debateEncounterDepthTypes";
import { getForumTechniquePatch } from "@/lib/intelligence/v4/forumTranscriptIntel";
import { mapAdminHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";
import { EP_DEBATE_TECHNIQUES_HREF, EP_TRAP_LANES_HREF } from "@/lib/election-plan/debate-prep-links";

type Props = {
  topic: DebateDepthTopic;
};

function ListBlock({ title, items, tone }: { title: string; items: string[]; tone?: "rose" | "emerald" | "default" }) {
  if (!items.length) return null;
  const color =
    tone === "rose" ? "text-rose-900" : tone === "emerald" ? "text-emerald-900" : "text-[var(--ep-navy-muted)]";
  return (
    <article className="ep-card p-5 text-sm">
      <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{title}</h3>
      <ul className={`mt-3 list-inside list-disc space-y-1 ${color}`}>
        {items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export function DebatePrepDepthTopicPanel({ topic }: Props) {
  const { depth } = topic;
  const forumAddendum = getForumTechniquePatch(topic.topicId);

  return (
    <section className="space-y-6">
      {forumAddendum ? (
        <article className="ep-card border-2 border-violet-300 bg-violet-50/50 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-violet-900">ACCA forum intel · technique addendum</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">{forumAddendum}</p>
        </article>
      ) : null}
      <article className="ep-card border-2 border-[var(--ep-gold)]/25 bg-[var(--ep-cream)]/40 p-5">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Techniques · ~{topic.estimatedMinutes} min</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{depth.whatToExpectPlain}</p>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListBlock title="How Hammer will attack" items={depth.howHeWillAttack ?? []} tone="rose" />
        <ListBlock title="How to handle it" items={depth.howToHandleIt ?? []} tone="emerald" />
      </div>

      <ListBlock title="If you get hung up" items={depth.ifYouGetHungUp ?? []} />
      <ListBlock title="Handling adversity" items={depth.handlingAdversity ?? []} />
      {depth.cultureWarDefense?.length ? (
        <ListBlock title="Culture-war defense" items={depth.cultureWarDefense} tone="emerald" />
      ) : null}

      {topic.relatedLinks.length > 0 ? (
        <nav className="ep-card flex flex-wrap gap-2 p-4 text-xs font-semibold">
          <span className="w-full text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Related</span>
          {topic.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={mapAdminHrefToElectionPlan(link.href)}
              className="rounded-full border border-[var(--ep-border)] px-3 py-1 hover:border-[var(--ep-gold)]"
            >
              {link.label}
            </Link>
          ))}
          <Link href={EP_TRAP_LANES_HREF} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-950">
            All trap lanes
          </Link>
          <Link href={EP_DEBATE_TECHNIQUES_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1">
            ← Techniques index
          </Link>
        </nav>
      ) : null}
    </section>
  );
}
