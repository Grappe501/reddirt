import Link from "next/link";

import { CHAPTERS, ML_BASE } from "@/content/macroscopic-life/catalog";
import { PUBLICATION_ACTS } from "@/content/macroscopic-life/publication-canon";
import { loadFrontMatter } from "@/lib/macroscopic-life/load-manuscript";
import { MarkdownBody } from "@/components/macroscopic-life/MarkdownBody";

export const metadata = { title: "Book One" };

export default function BookAtlasPage() {
  const frontMatter = loadFrontMatter();

  return (
    <div className="ml-page">
      <p className="ml-kicker">Book One · Controlled reader</p>
      <h1 className="ml-display ml-page-title">Enter at the scale you can stand.</h1>
      <p className="ml-line">
        Sixteen chapters. Five acts. One question that must be allowed to fail.
      </p>
      <section className="ml-card" style={{ marginBottom: "2rem" }}>
        <p className="ml-kicker">Current scientific verdict</p>
        <h2 className="ml-display ml-card-title">
          Macroscopic organization is real. Higher-order individuality is not established.
        </h2>
        <p className="ml-lede" style={{ marginBottom: "0.8rem" }}>
          Civilization is an unusually integrated macroscopic organization and cognitive ecology. On the
          evidence reviewed in Book One, the stronger higher-order-individual model is not required.
          Current winner: Model C.
        </p>
        <p>
          <Link href={`${ML_BASE}/models`}>Compare Models A–D</Link>
          {" · "}
          <Link href={`${ML_BASE}/tests`}>Open the Eleven Tests</Link>
          {" · "}
          <Link href={`${ML_BASE}/sources`}>Source atlas</Link>
        </p>
      </section>
      <div className="ml-atlas-intro">
        <MarkdownBody markdown={frontMatter} />
      </div>
      <div className="ml-windows">
        {PUBLICATION_ACTS.map((act) => {
          const chapters = CHAPTERS.filter((chapter) => chapter.act === act.id);
          return (
            <Link
              key={act.id}
              href={`${ML_BASE}/book/${chapters[0]?.slug ?? ""}`}
              className="ml-window"
              data-act={act.id}
            >
              <p className="ml-kicker">Act {act.roman}</p>
              <strong>{act.title}</strong>
              <em>{act.feeling}</em>
              <ol>
                {chapters.map((chapter) => (
                  <li key={chapter.slug}>
                    <span>{String(chapter.number).padStart(2, "0")}</span> {chapter.title}
                  </li>
                ))}
              </ol>
            </Link>
          );
        })}
      </div>
      <section className="ml-card" style={{ marginTop: "2rem" }}>
        <p className="ml-kicker">The method</p>
        <h2 className="ml-display ml-card-title">
          The microbe is the doorway. The tests are the contribution.
        </h2>
        <p className="ml-lede" style={{ marginBottom: 0 }}>
          The Eleven Tests are a proposed synthesis for model comparison in this project, not a consensus
          definition of life or biological individuality. They are designed to make the stronger hypothesis
          compete against serious lower-level alternatives and risk failure.
        </p>
        <p className="ml-line" style={{ marginTop: "1rem", marginBottom: 0 }}>
          Measure. Perturb. Compare models. Allow failure.
        </p>
      </section>
    </div>
  );
}
