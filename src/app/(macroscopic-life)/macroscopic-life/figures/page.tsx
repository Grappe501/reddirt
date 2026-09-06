import Link from "next/link";

import { PublicationFigure } from "@/components/macroscopic-life/PublicationFigure";
import { CHAPTERS, FIGURES, ML_BASE } from "@/content/macroscopic-life/catalog";
import { isFrozenPublicationFigure, publicationFigure } from "@/content/macroscopic-life/publication-canon";

export const metadata = { title: "Figures" };

export default function FiguresIndexPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">Publication figures + website companions</p>
      <h1 className="ml-display" style={{ fontSize: "2.6rem", margin: "0.4rem 0 0.8rem" }}>
        Figures 2–16 are the frozen publication sequence.
      </h1>
      <p style={{ color: "var(--ml-mute)", maxWidth: "42rem", marginBottom: "1rem" }}>
        Figure 1 is an opening thought-experiment diagram. Figures 17–18 are website companion diagrams.
        They are useful, but they do not alter the frozen Figure 2–16 publication canon.
      </p>
      <p style={{ color: "var(--ml-mute)", maxWidth: "42rem", marginBottom: "1.5rem" }}>
        Final artwork can replace the visual base only after review. Evidence class, takeaway, scientific brake,
        and canonical labels remain deterministic. Until then, the existing React/SVG diagram remains live.
      </p>
      <div className="ml-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))" }}>
        {FIGURES.map((rawFigure) => {
          const figure = publicationFigure(rawFigure);
          return (
            <div key={figure.id}>
              <p className="ml-kicker" style={{ marginBottom: "0.35rem" }}>
                {isFrozenPublicationFigure(figure.id) ? "Frozen publication figure" : "Companion diagram"}
              </p>
              <PublicationFigure id={figure.id} href={`${ML_BASE}/figures/${figure.id}`} />
              <p style={{ marginTop: "0.45rem" }}>
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
