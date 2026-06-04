import type { DebateEncounterDepth } from "@/lib/intelligence/v4/debateEncounterDepthTypes";

function ListBlock({ title, items, tone }: { title: string; items: string[]; tone?: string }) {
  if (!items.length) return null;
  return (
    <section className={`rounded-xl border p-4 text-xs ${tone ?? "border-kelly-text/10 bg-white"}`}>
      <h3 className="text-sm font-bold uppercase text-kelly-navy">{title}</h3>
      <ul className="mt-3 list-inside list-disc space-y-2 text-kelly-muted">
        {items.map((line) => (
          <li key={line.slice(0, 56)} className="text-kelly-text">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function V4EncounterDepthPanel({ depth, compact }: { depth: DebateEncounterDepth; compact?: boolean }) {
  if (!depth.whatToExpectPlain && !depth.howHeWillAttack.length) return null;

  if (compact) {
    return (
      <article className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4 text-xs">
        <p className="text-[10px] font-bold uppercase text-indigo-950">Plain language — what to expect</p>
        <p className="mt-2 leading-relaxed text-indigo-950">{depth.whatToExpectPlain}</p>
        {depth.ifYouGetHungUp[0] ? (
          <p className="mt-2 font-bold text-indigo-900">If stuck: {depth.ifYouGetHungUp[0]}</p>
        ) : null}
      </article>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-900">Plain-language depth — expect · handle · recover</p>
      {depth.whatToExpectPlain ? (
        <article className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-5 text-sm leading-relaxed text-indigo-950">
          <p className="text-[10px] font-bold uppercase">What to expect (in plain terms)</p>
          <p className="mt-2">{depth.whatToExpectPlain}</p>
        </article>
      ) : null}
      <ListBlock title="How he will attack" items={depth.howHeWillAttack} tone="border-rose-200 bg-rose-50/40" />
      <ListBlock title="How to handle it" items={depth.howToHandleIt} tone="border-emerald-200 bg-emerald-50/40" />
      <ListBlock title="If you get hung up" items={depth.ifYouGetHungUp} tone="border-violet-200 bg-violet-50/40" />
      <ListBlock title="Handling adversity" items={depth.handlingAdversity} tone="border-amber-200 bg-amber-50/40" />
      {depth.cultureWarDefense?.length ? (
        <ListBlock title="Culture-war defense" items={depth.cultureWarDefense} tone="border-slate-300 bg-slate-50" />
      ) : null}
    </div>
  );
}

/** Render depth from operator guide fields. */
export function V4GuideDepthBlocks({ guide }: { guide: {
  whatToExpectPlain?: string;
  howHeWillAttack?: string[];
  howToHandleIt?: string[];
  ifYouGetHungUp?: string[];
  handlingAdversity?: string[];
  cultureWarDefense?: string[];
} }) {
  if (!guide.whatToExpectPlain && !(guide.howHeWillAttack?.length)) return null;
  return (
    <V4EncounterDepthPanel
      depth={{
        whatToExpectPlain: guide.whatToExpectPlain ?? "",
        howHeWillAttack: guide.howHeWillAttack ?? [],
        howToHandleIt: guide.howToHandleIt ?? [],
        ifYouGetHungUp: guide.ifYouGetHungUp ?? [],
        handlingAdversity: guide.handlingAdversity ?? [],
        cultureWarDefense: guide.cultureWarDefense,
      }}
    />
  );
}
