import Link from "next/link";
import { notFound } from "next/navigation";

import { FigureObject } from "@/components/macroscopic-life/figures";
import { CHAPTERS, FIGURES, ML_BASE, figureById } from "@/content/macroscopic-life/catalog";
import { isFrozenPublicationFigure, publicationFigure } from "@/content/macroscopic-life/publication-canon";

export function generateStaticParams() {
  return FIGURES.map((figure) => ({ id: figure.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawFigure = figureById(id);
  const figure = rawFigure ? publicationFigure(rawFigure) : undefined;
  return { title: figure ? figure.title : "Figure" };
}

export default async function FigureTheaterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rawFigure = figureById(id);
  if (!rawFigure) notFound();

  const figure = publicationFigure(rawFigure);
  const chapter = CHAPTERS.find((item) => item.number === figure.chapter);
  const index = FIGURES.findIndex((item) => item.id === figure.id);
  const prevRaw = index > 0 ? FIGURES[index - 1] : undefined;
  const nextRaw = index < FIGURES.length - 1 ? FIGURES[index + 1] : undefined;
  const prev = prevRaw ? publicationFigure(prevRaw) : undefined;
  const next = nextRaw ? publicationFigure(nextRaw) : undefined;

  return (
    <div className="ml-page" style={{ maxWidth: "46rem" }}>
      <p className="ml-kicker">
        {isFrozenPublicationFigure(figure.id) ? "Frozen publication figure" : "Website companion diagram"}
      </p>
      <h1 className="ml-display" style={{ fontSize: "2.4rem", margin: "0.4rem 0 1rem" }}>
        {figure.title}
      </h1>
      <FigureObject figure={figure} />
      <p style={{ marginTop: "1rem", color: "var(--ml-mute)" }}>{figure.treatment}</p>
      {figure.id === "fig-16" ? (
        <div className="ml-card" style={{ marginTop: "1rem" }}>
          <p className="ml-line">LOCAL SIGNALS CAN BE REAL WITHOUT CONTAINING A PICTURE OF THE WHOLE.</p>
          <p className="ml-line">EPISTEMIC HUMILITY IS NOT POSITIVE EVIDENCE.</p>
          <p className="ml-line">MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.</p>
        </div>
      ) : null}
      <p style={{ marginTop: "0.8rem" }}>
        {chapter ? <Link href={`${ML_BASE}/book/${chapter.slug}`}>Read Chapter {chapter.number}</Link> : null}
      </p>
      <div className="ml-pager">
        {prev ? <Link href={`${ML_BASE}/figures/${prev.id}`}>Previous · {prev.title}</Link> : <span />}
        {next ? <Link href={`${ML_BASE}/figures/${next.id}`}>Next · {next.title}</Link> : <span />}
      </div>
    </div>
  );
}
