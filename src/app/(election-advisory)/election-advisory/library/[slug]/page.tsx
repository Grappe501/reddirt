import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConcernForm } from "@/components/election-advisory/ConcernForm";
import { AeacProse, DefinedText } from "@/components/election-advisory/DefinedText";
import { electionAdvisoryTopicLabels } from "@/content/election-advisory/catalog";
import { aeacGlossary, getAeacGlossaryTerm } from "@/content/election-advisory/glossary";
import { aeacHref } from "@/lib/election-advisory/public-origin";
import { getAeacBase } from "@/lib/election-advisory/public-origin-server";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return aeacGlossary.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getAeacGlossaryTerm(slug);
  if (!term) return { title: "Library" };
  return { title: term.term, description: term.shortDefinition };
}

export default async function ElectionAdvisoryLibraryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = getAeacGlossaryTerm(slug);
  if (!term) notFound();
  const base = await getAeacBase();
  const related = term.relatedSlugs.map((item) => getAeacGlossaryTerm(item)).filter(Boolean);

  return (
    <article>
      <p className="aeac-kicker">Deep dive</p>
      <h1 className="aeac-display">{term.term}</h1>
      <p className="aeac-lede">
        <DefinedText text={term.shortDefinition} base={base} />
      </p>
      <AeacProse base={base} text={term.whyItMatters} />

      {term.sections.map((section) => (
        <section key={section.heading} className="aeac-section">
          <h2>{section.heading}</h2>
          <AeacProse base={base} text={section.body} />
        </section>
      ))}

      {term.relatedTopics.length > 0 ? (
        <section className="aeac-section">
          <h2>Charge topics this touches</h2>
          <ul className="aeac-prose">
            {term.relatedTopics.map((topic) => (
              <li key={topic}>
                <Link href={`${aeacHref(base, "charge")}#${topic}`}>{electionAdvisoryTopicLabels[topic]}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {term.sources.length > 0 ? (
        <section className="aeac-section">
          <h2>Law, research, and official desks</h2>
          <ul className="aeac-prose">
            {term.sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} rel="noreferrer" target="_blank">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="aeac-section">
          <h2>Related words</h2>
          <div className="aeac-grid">
            {related.map((item) =>
              item ? (
                <Link key={item.slug} className="aeac-card-link" href={aeacHref(base, `library/${item.slug}`)}>
                  <h3>{item.term}</h3>
                  <p>{item.shortDefinition}</p>
                </Link>
              ) : null,
            )}
          </div>
        </section>
      ) : null}

      <section className="aeac-section">
        <h2>Ask the Commission to go deeper</h2>
        <AeacProse
          base={base}
          text="If this page is missing a statute, a county example, or a data table, send it. The request becomes part of the Commission intake — the same queue as a public concern."
        />
        <ConcernForm
          initialTopics={term.relatedTopics.length ? term.relatedTopics.slice(0, 8) : ["other"]}
          initialConcern={`Please expand the deep dive for “${term.term}” (${term.slug}). I want more Arkansas law, county practice, or research on: `}
          sourcePage={`/election-advisory/library/${term.slug}`}
          sourceComponent={`aeac-library-${term.slug}`}
          submitLabel="Request a deeper page"
        />
      </section>

      <div className="aeac-actions">
        <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "library")}>
          All library words
        </Link>
        <Link className="aeac-btn aeac-btn-ghost" href={aeacHref(base, "research")}>
          Research desk
        </Link>
      </div>
    </article>
  );
}
