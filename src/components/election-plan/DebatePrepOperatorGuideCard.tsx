import { DebatePrepGuideLinkText } from "@/components/election-plan/DebatePrepGuideLinkText";
import type { OperatorGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";

type Props = {
  title: string;
  guide: OperatorGuide;
};

function GuideBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">{label}</p>
      <p className="mt-1 text-[var(--ep-navy-muted)]">
        <DebatePrepGuideLinkText text={text} />
      </p>
    </div>
  );
}

function DepthListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "rose" | "emerald" | "amber" | "default";
}) {
  if (!items.length) return null;
  const border =
    tone === "rose"
      ? "border-rose-200 bg-rose-50/40"
      : tone === "emerald"
        ? "border-emerald-200 bg-emerald-50/40"
        : tone === "amber"
          ? "border-amber-200 bg-amber-50/40"
          : "border-[var(--ep-border)]";
  return (
    <article className={`ep-card p-4 text-sm ${border}`}>
      <h4 className="text-xs font-bold uppercase text-[var(--ep-navy)]">{title}</h4>
      <ul className="mt-2 list-inside list-disc space-y-1.5 text-[var(--ep-navy-muted)]">
        {items.map((item) => (
          <li key={item.slice(0, 48)}>
            <DebatePrepGuideLinkText text={item} />
          </li>
        ))}
      </ul>
    </article>
  );
}

export function DebatePrepOperatorGuideCard({ title, guide }: Props) {
  const hasDepth =
    guide.whatToExpectPlain ||
    (guide.howHeWillAttack?.length ?? 0) > 0 ||
    (guide.howToHandleIt?.length ?? 0) > 0 ||
    (guide.ifYouGetHungUp?.length ?? 0) > 0;

  return (
    <article className="ep-card p-5 text-sm">
      <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{title}</h3>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GuideBlock label="Why it matters" text={guide.whyItMatters} />
        <GuideBlock label="How it fits debate prep" text={guide.howItFitsDebatePrep} />
        <GuideBlock label="When to use" text={guide.whenToUse} />
        <GuideBlock label="How to set up" text={guide.howToSetUp} />
      </div>

      {guide.whatToExpectPlain ? (
        <article className="mt-4 rounded-lg border border-[var(--ep-gold)]/30 bg-[var(--ep-cream)]/50 p-4">
          <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">What to expect</p>
          <p className="mt-2 leading-relaxed text-[var(--ep-navy-muted)]">
            <DebatePrepGuideLinkText text={guide.whatToExpectPlain} />
          </p>
        </article>
      ) : null}

      {hasDepth ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <DepthListBlock title="How Hammer will attack" items={guide.howHeWillAttack ?? []} tone="rose" />
          <DepthListBlock title="How to handle it" items={guide.howToHandleIt ?? []} tone="emerald" />
          <DepthListBlock title="If you get hung up" items={guide.ifYouGetHungUp ?? []} tone="amber" />
          <DepthListBlock title="Handling adversity" items={guide.handlingAdversity ?? []} />
          <DepthListBlock title="Culture-war defense" items={guide.cultureWarDefense ?? []} tone="emerald" />
        </div>
      ) : null}

      <div className="mt-4">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">What to look for</p>
        <ul className="mt-2 list-inside list-disc space-y-1.5 text-[var(--ep-navy-muted)]">
          {guide.whatToLookFor.map((item) => (
            <li key={item.slice(0, 48)}>
              <DebatePrepGuideLinkText text={item} />
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-[var(--ep-navy-muted)]">
        <span className="font-semibold text-[var(--ep-navy)]">On stage:</span>{" "}
        <DebatePrepGuideLinkText text={guide.howToUseInDebate} />
      </p>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
        <span className="font-semibold text-[var(--ep-navy)]">Campaign trail:</span>{" "}
        <DebatePrepGuideLinkText text={guide.campaignTrailUse} />
      </p>
      {guide.tiesTogether ? (
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          <span className="font-semibold text-[var(--ep-navy)]">Ties together:</span>{" "}
          <DebatePrepGuideLinkText text={guide.tiesTogether} />
        </p>
      ) : null}
    </article>
  );
}
