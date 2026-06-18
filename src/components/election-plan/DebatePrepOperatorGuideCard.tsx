import type { OperatorGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";

type Props = {
  title: string;
  guide: OperatorGuide;
};

export function DebatePrepOperatorGuideCard({ title, guide }: Props) {
  return (
    <article className="ep-card p-5 text-sm">
      <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">{title}</h3>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <GuideBlock label="Why it matters" text={guide.whyItMatters} />
        <GuideBlock label="How it fits debate prep" text={guide.howItFitsDebatePrep} />
        <GuideBlock label="When to use" text={guide.whenToUse} />
        <GuideBlock label="How to set up" text={guide.howToSetUp} />
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">What to look for</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--ep-navy-muted)]">
          {guide.whatToLookFor.map((item) => (
            <li key={item.slice(0, 48)}>{item}</li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-[var(--ep-navy-muted)]">
        <span className="font-semibold text-[var(--ep-navy)]">On stage:</span> {guide.howToUseInDebate}
      </p>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
        <span className="font-semibold text-[var(--ep-navy)]">Campaign trail:</span> {guide.campaignTrailUse}
      </p>
    </article>
  );
}

function GuideBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">{label}</p>
      <p className="mt-1 text-[var(--ep-navy-muted)]">{text}</p>
    </div>
  );
}
