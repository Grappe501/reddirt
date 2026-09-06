import Link from "next/link";
import { notFound } from "next/navigation";

import { FigureObject } from "@/components/macroscopic-life/figures";
import { CHAPTERS, FIGURES, ML_BASE, figureById } from "@/content/macroscopic-life/catalog";

export function generateStaticParams() {
  return FIGURES.map((figure) => ({ id: figure.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const figure = figureById(id);
  return { title: figure ? figure.title : "Figure" };
}

export default async function FigureTheaterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const figure = figureById(id);
  if (!figure) notFound();
  const chapter = CHAPTERS.find((item) => item.number === figure.chapter);
  const index = FIGURES.findIndex((item) => item.id === figure.id);
  const prev = index > 0 ? FIGURES[index - 1] : undefined;
  const next = index < FIGURES.length - 1 ? FIGURES[index + 1] : undefined;

  return (
    <div className="ml-page ml-theater">
      <p className="ml-kicker">Figure theater</p>
      <h1 className="ml-display ml-page-title">{figure.title}</h1>
      <FigureObject figure={figure} />
      <p className="ml-treatment">{figure.treatment}</p>
      <p className="ml-also">
        {chapter ? (
          <Link href={`${ML_BASE}/book/${chapter.slug}`}>Read Chapter {chapter.number}</Link>
        ) : null}
      </p>
      <div className="ml-pager">
        {prev ? <Link href={`${ML_BASE}/figures/${prev.id}`}>Previous · {prev.title}</Link> : <span />}
        {next ? <Link href={`${ML_BASE}/figures/${next.id}`}>Next · {next.title}</Link> : <span />}
      </div>
    </div>
  );
}
