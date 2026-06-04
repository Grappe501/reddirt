import type { OperatorGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";

export function V4OperatorGuide({ guide, compact }: { guide: OperatorGuide; compact?: boolean }) {
  if (compact) {
    return (
      <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50/40 p-3 text-xs text-sky-950">
        <p className="font-bold uppercase tracking-wider text-sky-900">How to use this</p>
        <p className="mt-1">{guide.whenToUse}</p>
        <p className="mt-2 text-sky-900/90">{guide.howToUseInDebate}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-sky-200/60 bg-sky-50/30 p-4 text-xs leading-relaxed text-kelly-text">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-900">Operator guide — how this fits your debate</p>
      <GuideBlock label="Why it matters" text={guide.whyItMatters} />
      <GuideBlock label="How it fits debate prep" text={guide.howItFitsDebatePrep} />
      <GuideBlock label="How it ties together" text={guide.tiesTogether} />
      <div>
        <p className="font-bold text-kelly-navy">What to look for</p>
        <ul className="mt-1 list-inside list-disc text-kelly-muted">
          {guide.whatToLookFor.map((item) => (
            <li key={item.slice(0, 48)}>{item}</li>
          ))}
        </ul>
      </div>
      <GuideBlock label="How to set up (before debate)" text={guide.howToSetUp} />
      <GuideBlock label="When to use" text={guide.whenToUse} />
      <GuideBlock label="How to use in the debate" text={guide.howToUseInDebate} />
      <GuideBlock label="On the campaign trail" text={guide.campaignTrailUse} />
    </div>
  );
}

function GuideBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="font-bold text-kelly-navy">{label}</p>
      <p className="mt-1 text-kelly-muted">{text}</p>
    </div>
  );
}
