import Link from "next/link";
import { notFound } from "next/navigation";

import { FigureById } from "@/components/macroscopic-life/figures";
import { MarkdownBody } from "@/components/macroscopic-life/MarkdownBody";
import {
  adjacentChapters,
  ACTS,
  CHAPTERS,
  ML_BASE,
  chapterBySlug,
} from "@/content/macroscopic-life/catalog";
import { sourcesForChapter } from "@/content/macroscopic-life/sources";
import { loadChapterMarkdown } from "@/lib/macroscopic-life/load-manuscript";

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = chapterBySlug(slug);
  return { title: chapter ? `Chapter ${chapter.number} — ${chapter.title}` : "Chapter" };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chapter = chapterBySlug(slug);
  if (!chapter) notFound();
  const markdown = loadChapterMarkdown(chapter);
  const sourceRecord = sourcesForChapter(chapter.number);
  const act = ACTS.find((item) => item.id === chapter.act);
  const { prev, next } = adjacentChapters(chapter.slug);
  const primaryFigure = chapter.figureIds[0];
  const actChapters = CHAPTERS.filter((item) => item.act === chapter.act);
  const isActStart = actChapters[0]?.slug === chapter.slug;
  const isActEnd = actChapters[actChapters.length - 1]?.slug === chapter.slug;
  const nextAct = next ? ACTS.find((item) => item.id === next.act) : undefined;

  return (
    <div className="ml-page">
      {isActStart ? (
        <section className="ml-card" style={{ marginBottom: "1.5rem" }}>
          <p className="ml-kicker">Act {act?.roman}</p>
          <h2 className="ml-display" style={{ fontSize: "1.65rem", margin: "0.35rem 0 0.5rem" }}>
            {act?.title}
          </h2>
          <p style={{ color: "var(--ml-mute)", maxWidth: "46rem" }}>{act?.feeling}</p>
        </section>
      ) : null}

      <div className="ml-reader">
        <aside className="ml-index">
          <p className="ml-kicker">Act {act?.roman}</p>
          {CHAPTERS.map((item) => (
            <Link key={item.slug} href={`${ML_BASE}/book/${item.slug}`} data-active={item.slug === chapter.slug ? "true" : "false"}>
              {String(item.number).padStart(2, "0")} {item.title}
            </Link>
          ))}
        </aside>

        <article>
          <p className="ml-kicker">Chapter {String(chapter.number).padStart(2, "0")} · {act?.title}</p>
          <h1 className="ml-display" style={{ fontSize: "2.4rem", margin: "0.35rem 0 1rem" }}>{chapter.title}</h1>
          <p className="ml-line">{chapter.displayLine}</p>

          {sourceRecord ? (
            <p style={{ margin: "0.8rem 0 1.2rem", fontSize: "0.86rem" }}>
              <Link href={`${ML_BASE}/sources#chapter-${chapter.number}`}>Scientific sources & cautions for this chapter</Link>
            </p>
          ) : null}

          {chapter.number === 14 ? (
            <section className="ml-card" style={{ margin: "1.4rem 0 1.8rem" }}>
              <p className="ml-kicker">The book changes modes here</p>
              <h2 className="ml-display" style={{ fontSize: "1.45rem", margin: "0.35rem 0 0.65rem" }}>Exploration becomes protocol.</h2>
              <p style={{ color: "var(--ml-mute)" }}>
                Up to this point we have been building distinctions and mechanisms. The hypothesis is now specific enough to face protocol: define the candidate, specify measurements in advance, perturb it, and make the stronger model compete against serious alternatives.
              </p>
              <p style={{ marginTop: "0.8rem" }}>
                <Link href={`${ML_BASE}/tests`}>Open the Eleven Tests</Link>{" · "}<Link href={`${ML_BASE}/models`}>Compare Models A–D</Link>
              </p>
            </section>
          ) : null}

          <MarkdownBody markdown={markdown} />

          {sourceRecord ? (
            <section className="ml-card" style={{ marginTop: "2rem" }}>
              <p className="ml-kicker">Scientific foundation</p>
              <h2 className="ml-display" style={{ fontSize: "1.35rem", margin: "0.35rem 0 0.6rem" }}>{sourceRecord.label}</h2>
              <p style={{ color: "var(--ml-mute)" }}>{sourceRecord.coverage.join(" · ")}</p>
              <p style={{ marginTop: "0.8rem" }}><Link href={`${ML_BASE}/sources#chapter-${chapter.number}`}>Inspect sources, cautions, and representative anchors</Link></p>
            </section>
          ) : null}

          {isActEnd && nextAct ? (
            <section className="ml-card" style={{ marginTop: "2rem" }}>
              <p className="ml-kicker">Act {act?.roman} complete</p>
              <h2 className="ml-display" style={{ fontSize: "1.45rem", margin: "0.35rem 0 0.6rem" }}>Next: Act {nextAct.roman} · {nextAct.title}</h2>
              <p style={{ color: "var(--ml-mute)" }}>{nextAct.feeling}</p>
            </section>
          ) : null}

          {chapter.number >= 12 ? (
            <section className="ml-card" style={{ marginTop: "1.2rem" }}>
              <p className="ml-kicker">Scientific companion</p>
              <p style={{ margin: 0 }}><Link href={`${ML_BASE}/models`}>Models A–D</Link>{" · "}<Link href={`${ML_BASE}/tests`}>Eleven Tests</Link>{" · "}<Link href={`${ML_BASE}/sources`}>Sources</Link>{" · "}<Link href={`${ML_BASE}/method`}>Method</Link></p>
            </section>
          ) : null}

          <div className="ml-pager">
            {prev ? <Link href={`${ML_BASE}/book/${prev.slug}`}>Previous · {prev.title}</Link> : <Link href={`${ML_BASE}/book`}>Act atlas</Link>}
            {next ? <Link href={`${ML_BASE}/book/${next.slug}`}>Next · {next.title}</Link> : <Link href={`${ML_BASE}/tests`}>Eleven Tests</Link>}
          </div>
        </article>

        <aside>
          {primaryFigure ? <FigureById id={primaryFigure} href={`${ML_BASE}/figures/${primaryFigure}`} /> : null}
          {chapter.figureIds.length > 1 ? (
            <p style={{ marginTop: "0.8rem", fontSize: "0.82rem" }}>Also in this chapter:{" "}{chapter.figureIds.slice(1).map((id) => <Link key={id} href={`${ML_BASE}/figures/${id}`} style={{ marginRight: "0.7rem" }}>{id}</Link>)}</p>
          ) : null}
          <p style={{ marginTop: "1rem", fontSize: "0.82rem", color: "var(--ml-mute)" }}>Figures travel with an evidence class, takeaway, and brake. A figure is explanatory material, not additional evidence beyond the cited scientific record.</p>
          {sourceRecord ? <p style={{ marginTop: "0.8rem", fontSize: "0.82rem" }}><Link href={`${ML_BASE}/sources#chapter-${chapter.number}`}>Source atlas · Ch. {chapter.number}</Link></p> : null}
        </aside>
      </div>
    </div>
  );
}
