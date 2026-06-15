import Link from "next/link";

import {
  conversationStrategyHref,
  getArkansasConversationStrategy,
} from "@/lib/election-plan/load-arkansas-conversation-strategy";
import { meetingsHubHref } from "@/lib/election-plan/load-meeting-accountability";
import { powerOf5CommandCenterHref } from "@/lib/election-plan/load-phase-18-7b-ownership";

type Variant = "full" | "chapter" | "compact";

type Props = {
  variant?: Variant;
};

export function ArkansasConversationStrategyPanel({ variant = "full" }: Props) {
  const s = getArkansasConversationStrategy();

  if (variant === "compact") {
    return (
      <div className="ep-card border-l-4 border-[var(--ep-gold)]">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Phase 18.7F · Organizing doctrine</p>
        <p className="mt-2 text-sm font-medium text-[var(--ep-navy)]">{s.corePrinciple}</p>
        <p className="mt-2 text-sm italic text-[var(--ep-navy-muted)]">{s.successQuestion}</p>
        <Link href={conversationStrategyHref()} className="mt-3 inline-block text-xs font-semibold underline">
          Full conversation strategy →
        </Link>
      </div>
    );
  }

  const isChapter = variant === "chapter";

  return (
    <section className={isChapter ? "" : "space-y-6"}>
      {!isChapter ? (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <Link href="/election-plan/executive-book/power-of-5" className="font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            ← Executive Book Ch. 8
          </Link>
          <span className="text-[var(--ep-navy-muted)]">·</span>
          <Link href={meetingsHubHref()} className="font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
            Meeting rhythm
          </Link>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7F</p>
        <h2 className={isChapter ? "font-heading text-xl font-bold text-[var(--ep-navy)]" : "font-heading text-2xl font-bold text-[var(--ep-navy)]"}>
          {s.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{s.subtitle}</p>
        <p className="mt-3 text-sm font-medium italic text-[var(--ep-navy)]">{s.notThis}</p>
      </div>

      <div className="ep-card border-l-4 border-[var(--ep-gold)]">
        <h3 className="font-heading font-bold text-[var(--ep-navy)]">Core principle</h3>
        <p className="mt-2 text-sm">{s.corePrinciple}</p>
        <p className="mt-3 text-sm italic text-[var(--ep-navy-muted)]">{s.trustNotArgument}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="ep-card">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Large events</p>
          <p className="mt-1 text-sm font-medium">{s.visibilityVsVotes.visibility}</p>
        </div>
        <div className="ep-card bg-[var(--ep-cream)]">
          <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Small events</p>
          <p className="mt-1 text-sm font-bold text-[var(--ep-navy)]">{s.visibilityVsVotes.votes}</p>
        </div>
      </div>
      <p className="text-sm text-[var(--ep-navy-muted)]">{s.visibilityVsVotes.doctrine}</p>

      <div className="ep-card">
        <h3 className="font-heading font-bold text-[var(--ep-navy)]">Conversation ladder</h3>
        <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Every interaction should move people up the ladder.</p>
        <ol className="mt-4 space-y-2">
          {s.conversationLadder.map((step) => (
            <li key={step.level} className="flex gap-3 border-b border-[var(--ep-border)] pb-2 last:border-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--ep-cream)] text-xs font-bold text-[var(--ep-navy)]">
                {step.level}
              </span>
              <div>
                <p className="font-semibold text-[var(--ep-navy)]">{step.name}</p>
                <p className="text-sm text-[var(--ep-navy-muted)]">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="ep-card">
        <h3 className="font-heading font-bold text-[var(--ep-navy)]">Power of 5 engine</h3>
        <blockquote className="mt-3 border-l-4 border-[var(--ep-gold)] pl-4 text-sm font-medium italic">
          &ldquo;{s.powerOf5Engine.firstAsk}&rdquo;
        </blockquote>
        <blockquote className="mt-2 border-l-4 border-[var(--ep-gold)] pl-4 text-sm font-medium italic">
          &ldquo;{s.powerOf5Engine.secondAsk}&rdquo;
        </blockquote>
        <div className="mt-4 ep-stat-grid">
          <div className="ep-stat">
            <div className="ep-stat-value">{s.powerOf5Engine.networkGoal.toLocaleString("en-US")}</div>
            <div className="ep-stat-label">{s.powerOf5Engine.metricLabel}</div>
          </div>
          <div className="ep-stat">
            <div className="ep-stat-value">{s.powerOf5Engine.hciGoal.toLocaleString("en-US")}</div>
            <div className="ep-stat-label">HCI goal</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          Track <strong>{s.powerOf5Engine.metricLabel}</strong> — not {s.powerOf5Engine.notMetricLabel} alone.
        </p>
        <Link href={powerOf5CommandCenterHref()} className="mt-3 inline-block text-xs font-semibold underline">
          Power of 5 command center →
        </Link>
      </div>

      <div className="ep-card">
        <h3 className="font-heading font-bold text-[var(--ep-navy)]">Eyeball-to-eyeball venues</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {s.eyeballToEyeballVenues.map((v) => (
            <li key={v} className="rounded-full bg-slate-100 px-3 py-1 text-sm">
              {v}
            </li>
          ))}
        </ul>
      </div>

      <div className="ep-card border-2 border-[var(--ep-gold-soft)]">
        <h3 className="font-heading font-bold text-[var(--ep-navy)]">Cross-party trust strategy</h3>
        <blockquote className="mt-3 text-lg font-medium italic text-[var(--ep-navy)]">
          &ldquo;{s.crossPartyTrust.message}&rdquo;
        </blockquote>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{s.crossPartyTrust.sosFrame}</p>
        <p className="mt-2 text-sm">{s.crossPartyTrust.goal}</p>
        <p className="mt-3 text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Priority counties</p>
        <p className="mt-1 text-sm">{s.crossPartyTrust.priorityCounties.join(" · ")}</p>
        <Link href={s.crossPartyTrust.href} className="mt-3 inline-block text-xs font-semibold underline">
          Searcy trust pilot →
        </Link>
      </div>

      <div className="ep-card bg-[var(--ep-cream)]">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Top-tier platform plank · citizen power</p>
        <h3 className="mt-1 font-heading font-bold text-[var(--ep-navy)]">Direct Democracy</h3>
        <blockquote className="mt-3 text-sm font-medium italic">&ldquo;{s.directDemocracyPlank.doctrine}&rdquo;</blockquote>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{s.directDemocracyPlank.sosRole}</p>
        <Link href={s.directDemocracyPlank.href} className="mt-3 inline-block text-xs font-semibold underline">
          Direct Democracy leadership →
        </Link>
      </div>

      {!isChapter ? (
        <div className="ep-card">
          <h3 className="font-heading font-bold text-[var(--ep-navy)]">Connected systems</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {s.systemConnections.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="text-sm font-semibold text-[var(--ep-navy)] hover:underline">
                  {c.system} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg border border-dashed border-[var(--ep-border)] px-4 py-3 text-sm text-[var(--ep-navy-muted)]">
        <strong className="text-[var(--ep-navy)]">After every stop:</strong> {s.stopCommandCenterPrompt}
      </div>
    </section>
  );
}

export function ConversationStrategySummaryStrip() {
  const s = getArkansasConversationStrategy();
  return (
    <Link
      href={conversationStrategyHref()}
      className="block ep-card transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
    >
      <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Phase 18.7F · Doctrine</p>
      <p className="mt-1 font-heading font-bold text-[var(--ep-navy)]">{s.title}</p>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">9-step conversation ladder · read in under 10 minutes</p>
    </Link>
  );
}
