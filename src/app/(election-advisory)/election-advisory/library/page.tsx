import type { Metadata } from "next";
import Link from "next/link";

import { AeacProse } from "@/components/election-advisory/DefinedText";
import { aeacGlossary, aeacGlossaryCategories } from "@/content/election-advisory/glossary";
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Plain-language definitions and deep dives for words on the Arkansas Election Advisory Commission site.",
};

export default async function ElectionAdvisoryLibraryPage() {
  const base = await getAeacBase();
  return (
    <article>
      <p className="aeac-kicker">Plain words · Deep dives</p>
      <h1 className="aeac-display">Commission library</h1>
      <AeacProse
        base={base}
        className="aeac-lede"
        text="Hard words on this site are marked. Hover for a short meaning. Click the word or the bubble to open a deep dive with law, research, and a place to ask the Commission to write more."
      />
      <p className="aeac-prose">
        The reading target is eighth grade. Election work still uses legal and technical words. This library keeps
        those words on-site so a person does not have to leave to understand the charter.
      </p>

      {aeacGlossaryCategories.map((category) => {
        const terms = aeacGlossary.filter((term) => term.category === category.id);
        if (terms.length === 0) return null;
        return (
          <section key={category.id} className="aeac-section">
            <h2>{category.label}</h2>
            <p className="aeac-prose">{category.summary}</p>
            <div className="aeac-grid" style={{ marginTop: "1rem" }}>
              {terms.map((term) => (
                <Link key={term.slug} className="aeac-card-link" href={aeacHref(base, `library/${term.slug}`)}>
                  <h3>{term.term}</h3>
                  <p>{term.shortDefinition}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <div className="aeac-actions">
        <Link className="aeac-btn" href={aeacHref(base, "research")}>
          Research desk
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "concerns")}>
          Share a concern
        </Link>
      </div>
    </article>
  );
}
