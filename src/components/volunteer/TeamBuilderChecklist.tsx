const ITEMS = [
  "We know our geography.",
  "We know our level: county, city, precinct, neighborhood, or community.",
  "We have someone covering Events.",
  "We have someone covering Social Media.",
  "We have someone covering Power of 5 / Voter Registration.",
  "We know who the upstream campaign contact is.",
  "We know where to send updates.",
  "We know our first weekly tasks.",
  "We know what downstream team we want to help build next.",
] as const;

export function TeamBuilderChecklist() {
  return (
    <div className="rounded-2xl border border-kelly-gold/30 bg-kelly-gold/5 p-6 md:p-8 print:border-kelly-text/20">
      <p className="font-heading text-sm font-bold text-kelly-navy">Before your team launches</p>
      <ul className="mt-4 space-y-3 font-body text-sm leading-relaxed text-kelly-text/90">
        {ITEMS.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-0.5 shrink-0 font-mono text-kelly-gold" aria-hidden>
              □
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
