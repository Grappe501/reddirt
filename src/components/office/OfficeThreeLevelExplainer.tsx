import Link from "next/link";
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
      "How each responsibility affects voters, small businesses, nonprofits, notaries, and local communities—stakes before slogans.",
  },
  {
    level: 3,
    title: OFFICE_LAYER_EYEBROWS[3],
    body:
      "Only verified credentials: career record, civic leadership, and small-business experience you can check—no inflated claims.",
  },
] as const;

export function OfficeThreeLevelExplainer() {
  return (
    <section aria-labelledby="office-three-levels" className="scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-kelly-gold">How to read this section</p>
        <h2 id="office-three-levels" className="mt-3 font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
          Three levels: competence before persuasion
        </h2>
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/85">
          Most candidates ask for your vote. Few explain what this office actually does. Start with civic education; go
          deeper only if you want to.
        </p>
      </div>
      <ol className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
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
      <p className="mx-auto mt-8 max-w-2xl text-center font-body text-sm text-kelly-muted">
        Content status tracked in{" "}
        <Link href="/about" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
          Meet Kelly
        </Link>{" "}
        and{" "}
        <code className="text-xs">docs/website/PUBLIC_CONTENT_APPROVAL_QUEUE.md</code>.
      </p>
    </section>
  );
}
