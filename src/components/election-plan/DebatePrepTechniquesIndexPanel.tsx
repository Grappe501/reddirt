import Link from "next/link";

import { DebatePrepGuideLinkText } from "@/components/election-plan/DebatePrepGuideLinkText";
import { DebatePrepOperatorGuideCard } from "@/components/election-plan/DebatePrepOperatorGuideCard";
import { ForumDebateUpgradePanel } from "@/components/election-plan/ForumDebateUpgradePanel";
import {
  DEBATE_REHEARSAL_TECHNIQUES,
  MODERATOR_INTERACTION_TECHNIQUES,
  STAGE_PRESENCE_CHECKLIST,
} from "@/lib/election-plan/debate-prep-operator-guide";
import {
  TECHNIQUE_READ_ORDER,
  TECHNIQUES_QUICK_LINKS,
} from "@/lib/election-plan/debatePrepGuideLinks";
import { mapAdminHrefToElectionPlan } from "@/lib/election-plan/debate-prep-route-map";
import {
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_TECHNIQUES_HREF,
  EP_TRAP_LANES_HREF,
  epDebateTechniqueHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";
import { DEBATE_DEPTH_TOPICS } from "@/lib/intelligence/v4/debateDepthTopics";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";

const REHEARSAL_TECHNIQUE_LINKS: Record<string, string> = {
  "15s-decline": epDebateTechniqueHref("culture-war"),
  "reset-line": epDebateTechniqueHref("if-stuck"),
  "three-way-order": epDebateTechniqueHref("three-way"),
  "agree-contrast-bridge": epDebateTechniqueHref("hammer-attacks"),
  "claims-gate": "/election-plan/opposition-research",
};

export function DebatePrepTechniquesIndexPanel() {
  const depthGuide = getSurfaceGuide("debate-depth-index");

  return (
    <section className="space-y-6">
      {depthGuide ? <DebatePrepOperatorGuideCard title="Techniques library — how to use" guide={depthGuide} /> : null}

      <article className="ep-card p-5">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Quick links for Kelly</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TECHNIQUES_QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-[var(--ep-navy)] px-3 py-1 text-xs font-bold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
            >
              {link.label} →
            </Link>
          ))}
          <Link
            href={epTrapLaneHref("culture-war-escalation")}
            className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-900 hover:bg-rose-100"
          >
            Trap lane 6 · culture war →
          </Link>
        </div>
      </article>

      <article className="ep-card border-indigo-200 bg-indigo-50/30 p-5 text-sm">
        <p className="text-xs font-bold uppercase text-indigo-900">Recommended read order (before mock debate)</p>
        <ol className="mt-3 list-inside list-decimal space-y-1.5">
          {TECHNIQUE_READ_ORDER.map((step) => (
            <li key={step.topicId}>
              <Link href={epDebateTechniqueHref(step.topicId)} className="font-bold text-[var(--ep-navy)] underline">
                {step.label}
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[var(--ep-navy-muted)]">
          Then open{" "}
          <Link href={EP_TRAP_LANES_HREF} className="font-semibold underline">
            trap lanes
          </Link>{" "}
          matching tonight&apos;s theme.
        </p>
      </article>

      <ForumDebateUpgradePanel />

      <p className="text-sm text-[var(--ep-navy-muted)]">
        Plain-language recovery and attack-pattern guides. Read{" "}
        <Link href={epDebateTechniqueHref("hammer-attacks")} className="font-semibold underline">
          hammer-attacks
        </Link>{" "}
        and{" "}
        <Link href={epDebateTechniqueHref("if-stuck")} className="font-semibold underline">
          if-stuck
        </Link>{" "}
        before every prep block; pair with{" "}
        <Link href={EP_DEBATE_PREP_REHEARSAL_HREF} className="font-semibold underline">
          rehearsal engine
        </Link>
        .
      </p>

      <article className="ep-card p-5">
        <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Core rehearsal techniques</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {DEBATE_REHEARSAL_TECHNIQUES.map((t) => {
            const href = REHEARSAL_TECHNIQUE_LINKS[t.id];
            return (
              <li key={t.id}>
                {href ? (
                  <Link href={href} className="font-semibold text-[var(--ep-navy)] underline">
                    {t.label}
                  </Link>
                ) : (
                  <p className="font-semibold text-[var(--ep-navy)]">{t.label}</p>
                )}
                <p className="text-[var(--ep-navy-muted)]">{t.detail}</p>
              </li>
            );
          })}
        </ul>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="ep-card p-5 text-sm">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Moderator interaction</h2>
          <ul className="mt-3 space-y-2">
            {MODERATOR_INTERACTION_TECHNIQUES.map((t) => (
              <li key={t.id}>
                <span className="font-semibold text-[var(--ep-navy)]">{t.label}:</span>{" "}
                <span className="text-[var(--ep-navy-muted)]">{t.detail}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="ep-card p-5 text-sm">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Stage presence</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
            {STAGE_PRESENCE_CHECKLIST.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
          <Link href={epDebateTechniqueHref("if-stuck")} className="mt-3 inline-block text-xs font-bold text-[var(--ep-navy)] underline">
            If-stuck recovery scripts →
          </Link>
        </article>
      </div>

      <div id="topic-guides" className="grid gap-4 sm:grid-cols-2">
        {DEBATE_DEPTH_TOPICS.map((topic) => (
          <Link
            key={topic.topicId}
            href={epDebateTechniqueHref(topic.topicId)}
            className="ep-card flex flex-col p-5 transition hover:border-[var(--ep-gold)]"
          >
            <p className="text-[10px] font-bold uppercase text-indigo-800">~{topic.estimatedMinutes} min</p>
            <h2 className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{topic.title}</h2>
            <p className="mt-2 flex-1 text-sm text-[var(--ep-navy-muted)]">{topic.summary}</p>
            <p className="mt-3 line-clamp-3 text-xs text-[var(--ep-navy-muted)]">{topic.depth.whatToExpectPlain}</p>
            <p className="mt-4 text-xs font-bold text-[var(--ep-gold)]">Open full guide →</p>
          </Link>
        ))}
      </div>

      <article className="ep-card p-5 text-sm">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Cross-links</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEBATE_DEPTH_TOPICS.map((topic) => (
            <Link
              key={topic.topicId}
              href={epDebateTechniqueHref(topic.topicId)}
              className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold hover:border-[var(--ep-navy)]"
            >
              {topic.title}
            </Link>
          ))}
          <Link
            href={EP_TRAP_LANES_HREF}
            className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-950"
          >
            All trap lanes
          </Link>
          {DEBATE_DEPTH_TOPICS.flatMap((topic) =>
            topic.relatedLinks.map((link) => (
              <Link
                key={`${topic.topicId}-${link.href}`}
                href={mapAdminHrefToElectionPlan(link.href)}
                className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold hover:border-[var(--ep-gold)]"
              >
                {link.label}
              </Link>
            )),
          )}
        </div>
      </article>
    </section>
  );
}
