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
  const act = ACTS.find((item) => item.id === chapter.act);
  const { prev, next } = adjacentChapters(chapter.slug);
  const primaryFigure = chapter.figureIds[0];

  return (
    <div className="ml-page">
      <div className="ml-reader">
        <aside className="ml-index">
          <p className="ml-kicker">Act {act?.roman}</p>
          {CHAPTERS.map((item) => (
            <Link
              key={item.slug}
              href={`${ML_BASE}/book/${item.slug}`}
              data-active={item.slug === chapter.slug ? "true" : "false"}
            >
              {String(item.number).padStart(2, "0")} {item.title}
            </Link>
          ))}
        </aside>
        <article>
          <p className="ml-kicker">
            Chapter {String(chapter.number).padStart(2, "0")} · {act?.title}
          </p>
          <h1 className="ml-display" style={{ fontSize: "2.4rem", margin: "0.35rem 0 1rem" }}>
            {chapter.title}
          </h1>
          <p className="ml-line">{chapter.displayLine}</p>
          <MarkdownBody markdown={markdown} />
          <div className="ml-pager">
            {prev ? (
              <Link href={`${ML_BASE}/book/${prev.slug}`}>
                Previous · {prev.title}
              </Link>
            ) : (
              <Link href={`${ML_BASE}/book`}>Act atlas</Link>
            )}
            {next ? (
              <Link href={`${ML_BASE}/book/${next.slug}`}>Next · {next.title}</Link>
            ) : (
              <Link href={`${ML_BASE}/tests`}>Eleven Tests</Link>
            )}
          </div>
        </article>
        <aside>
          {primaryFigure ? (
            <FigureById id={primaryFigure} href={`${ML_BASE}/figures/${primaryFigure}`} />
          ) : null}
          {chapter.figureIds.length > 1 ? (
            <p style={{ marginTop: "0.8rem", fontSize: "0.82rem" }}>
              Also in this chapter:{" "}
              {chapter.figureIds.slice(1).map((id) => (
                <Link key={id} href={`${ML_BASE}/figures/${id}`} style={{ marginRight: "0.7rem" }}>
                  {id}
                </Link>
              ))}
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
