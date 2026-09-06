import Link from "next/link";

import { FigureById } from "@/components/macroscopic-life/figures";
import { CHAPTERS, FIGURES, ML_BASE } from "@/content/macroscopic-life/catalog";

export const metadata = { title: "Figures" };

export default function FiguresIndexPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">First-edition core</p>
      <h1 className="ml-display ml-page-title">Eighteen figures. Each one is a scientific object.</h1>
      <p className="ml-lede">
        Image, evidence class, takeaway, and brake travel together. If the brake cannot fit, the
        figure is not allowed to leave this page.
      </p>
      <div className="ml-figure-grid">
        {FIGURES.map((figure) => (
          <div key={figure.id} className="ml-figure-cell">
            <FigureById id={figure.id} href={`${ML_BASE}/figures/${figure.id}`} />
            <p className="ml-also">
              <Link href={`${ML_BASE}/book/${CHAPTERS.find((chapter) => chapter.number === figure.chapter)?.slug ?? ""}`}>
                Chapter {figure.chapter}
              </Link>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
