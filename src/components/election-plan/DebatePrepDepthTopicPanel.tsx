import Link from "next/link";

import { DebatePrepGuideLinkText } from "@/components/election-plan/DebatePrepGuideLinkText";
import type { DebateDepthTopic } from "@/lib/intelligence/v4/debateEncounterDepthTypes";
import { getForumTechniquePatch } from "@/lib/intelligence/v4/forumTranscriptIntel";
import { mapAdminHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_TECHNIQUES_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  EP_TRAP_LANES_HREF,
  epDebateTechniqueHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";

type Props = {
  topic: DebateDepthTopic;
};

function ListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "rose" | "emerald" | "default";
}) {
  if (!items.length) return null;
  const color =
    tone === "rose" ? "text-rose-900" : tone === "emerald" ? "text-emerald-900" : "text-[var(--ep-navy-muted)]";
  return (
    <article className="ep-card p-5 text-sm">
      <h3 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{title}</h3>
      <ul className={`mt-3 list-inside list-disc space-y-1.5 ${color}`}>
        {items.map((item) => (
          <li key={item.slice(0, 48)}>
            <DebatePrepGuideLinkText text={item} />
          </li>
        ))}
      </ul>
    </article>
  );
}

const TOPIC_NAV: Record<string, Array<{ topicId: string; label: string }>> = {
  "hammer-attacks": [
    { topicId: "culture-war", label: "Next · culture-war" },
    { topicId: "if-stuck", label: "If stuck" },
  ],
  "culture-war": [
    { topicId: "hammer-attacks", label: "← hammer-attacks" },
    { topicId: "if-stuck", label: "Next · if-stuck" },
  ],
  "if-stuck": [
    { topicId: "culture-war", label: "← culture-war" },
    { topicId: "adversity", label: "Next · adversity" },
  ],
  adversity: [
    { topicId: "if-stuck", label: "← if-stuck" },
    { topicId: "three-way", label: "Next · three-way" },
  ],
  "three-way": [{ topicId: "adversity", label: "← adversity" }],
};

export function DebatePrepDepthTopicPanel({ topic }: Props) {
  const { depth } = topic;
  const forumAddendum = getForumTechniquePatch(topic.topicId);
  const nav = TOPIC_NAV[topic.topicId] ?? [];

  return (
    <section className="space-y-6">
      <nav className="ep-card flex flex-wrap gap-2 p-4 text-xs font-bold">
        <Link href={EP_DEBATE_TECHNIQUES_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1 hover:border-[var(--ep-navy)]">
          ← Techniques hub
        </Link>
        {nav.map((n) => (
          <Link
            key={n.topicId}
            href={epDebateTechniqueHref(n.topicId)}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-950 hover:bg-indigo-100"
          >
            {n.label}
          </Link>
        ))}
        <Link href={EP_TRAP_LANES_HREF} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-950">
          Trap lanes
        </Link>
        <Link href={EP_DEBATE_PREP_COMMAND_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1">
          SOS questions
        </Link>
        <Link href={EP_DEBATE_PREP_REHEARSAL_HREF} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-950">
          Mock debate / rehearsal
        </Link>
      </nav>

      {topic.topicId === "culture-war" ? (
        <article className="ep-card border-2 border-rose-300 bg-rose-50/50 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-rose-900">15-second decline script · trap lane 6</p>
          <p className="mt-2 font-semibold italic text-[var(--ep-navy)]">
            &ldquo;I am running to run the Secretary of State&apos;s office for every voter — let&apos;s talk about the acts and the clerks.&rdquo;
          </p>
          <p className="mt-3 text-[var(--ep-navy-muted)]">
            Memorize this boundary line, then pivot within 10 seconds. Full lane drill-down:
          </p>
          <Link
            href={epTrapLaneHref("culture-war-escalation")}
            className="mt-3 inline-block rounded-full border border-rose-400 bg-white px-4 py-1.5 text-xs font-bold text-rose-900 hover:bg-rose-50"
          >
            Open trap lane 6 — culture war →
          </Link>
        </article>
      ) : null}

      {forumAddendum ? (
        <article className="ep-card border-2 border-violet-300 bg-violet-50/50 p-5 text-sm">
          <p className="text-xs font-bold uppercase text-violet-900">ACCA forum intel · technique addendum</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">
            <DebatePrepGuideLinkText text={forumAddendum} />
          </p>
        </article>
      ) : null}

      <article className="ep-card border-2 border-[var(--ep-gold)]/25 bg-[var(--ep-cream)]/40 p-5">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">What to expect · ~{topic.estimatedMinutes} min</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ep-navy-muted)]">
          <DebatePrepGuideLinkText text={depth.whatToExpectPlain} />
        </p>
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

      <article className="ep-card border-amber-200 bg-amber-50/40 p-4 text-xs text-[var(--ep-navy-muted)]">
        <p className="font-bold uppercase text-amber-900">On stage reminder</p>
        <p className="mt-2">
          <DebatePrepGuideLinkText text="Memorize recovery lines — not full paragraphs. Claims gate still applies to every depth block." />
        </p>
      </article>

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
          <Link href={EP_OPPOSITION_RESEARCH_HREF} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-950">
            Claims gate
          </Link>
          <Link href={EP_DEBATE_PREP_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1">
            Debate prep hub
          </Link>
          <Link href={EP_DEBATE_TECHNIQUES_HREF} className="rounded-full border border-[var(--ep-border)] px-3 py-1">
            ← Techniques index
          </Link>
        </nav>
      ) : null}
    </section>
  );
}
