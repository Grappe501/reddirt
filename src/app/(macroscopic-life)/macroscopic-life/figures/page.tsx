import Link from "next/link";

import { FigureById } from "@/components/macroscopic-life/figures";
import { CHAPTERS, FIGURES, ML_BASE } from "@/content/macroscopic-life/catalog";

export const metadata = { title: "Figures" };

export default function FiguresIndexPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">First-edition core</p>
      <h1 className="ml-display" style={{ fontSize: "2.6rem", margin: "0.4rem 0 0.8rem" }}>
        Eighteen figures. Each one is a scientific object.
      </h1>
      <p style={{ color: "var(--ml-mute)", maxWidth: "36rem", marginBottom: "1.5rem" }}>
        Image, evidence class, takeaway, and brake travel together. If the brake cannot fit, the
        figure is not allowed to leave this page.
      </p>
      <div className="ml-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(17rem, 1fr))" }}>
        {FIGURES.map((figure) => (
          <div key={figure.id}>
            <FigureById id={figure.id} href={`${ML_BASE}/figures/${figure.id}`} />
            <p style={{ marginTop: "0.45rem" }}>
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
