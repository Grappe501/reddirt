import Link from "next/link";

import { PublicationFigure } from "@/components/macroscopic-life/PublicationFigure";
import { CHAPTERS, FIGURES, ML_BASE } from "@/content/macroscopic-life/catalog";
import { isFrozenPublicationFigure, publicationFigure } from "@/content/macroscopic-life/publication-canon";

export const metadata = { title: "Figures" };

export default function FiguresIndexPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">Publication figures + website companions</p>
      <h1 className="ml-display ml-page-title">Eighteen figures. Each one is a scientific object.</h1>
      <p className="ml-lede">
        Figures 2–16 are the frozen publication sequence. Figure 1 is an opening thought-experiment.
        Figures 17–18 are website companions. Image, evidence class, takeaway, and brake travel together.
        Final artwork can replace the visual base only after review.
      </p>
      <div className="ml-figure-grid">
        {FIGURES.map((rawFigure) => {
          const figure = publicationFigure(rawFigure);
          return (
            <div key={figure.id} className="ml-figure-cell">
              <p className="ml-kicker" style={{ marginBottom: "0.35rem" }}>
                {isFrozenPublicationFigure(figure.id) ? "Frozen publication figure" : "Companion diagram"}
              </p>
              <PublicationFigure id={figure.id} href={`${ML_BASE}/figures/${figure.id}`} />
              <p className="ml-also">
                <Link href={`${ML_BASE}/book/${CHAPTERS.find((chapter) => chapter.number === figure.chapter)?.slug ?? ""}`}>
                  Chapter {figure.chapter}
                </Link>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
