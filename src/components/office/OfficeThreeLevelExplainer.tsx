import { OFFICE_LAYER_EYEBROWS } from "@/content/office/office-layer-labels";

const levels = [
  {
    level: 1,
    title: OFFICE_LAYER_EYEBROWS[1],
    body:
      "What does the Secretary of State actually do? Plain-language overviews for elections, business filings, notaries, public records, and Capitol stewardship—no campaign messaging.",
  },
  {
    level: 2,
    title: OFFICE_LAYER_EYEBROWS[2],
    body:
      "How each responsibility affects voters, small businesses, and local communities—and only verified credentials on what Kelly brings: career record, civic leadership, and experience you can check.",
  },
] as const;

export function OfficeThreeLevelExplainer() {
  return (
    <section aria-labelledby="office-two-levels" className="scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-kelly-gold">How to read this section</p>
        <h2 id="office-two-levels" className="mt-3 font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
          Two levels: competence before persuasion
        </h2>
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/85">
          Most candidates ask for your vote. Few explain what this office actually does. Start with civic education; go
          deeper only if you want to.
        </p>
      </div>
      <ol className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
        {levels.map((item) => (
          <li
            key={item.level}
            className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
          >
            <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-muted">Level {item.level}</p>
            <h3 className="mt-2 font-heading text-lg font-bold text-kelly-text">{item.title}</h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/82">{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
