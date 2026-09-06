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
      <h1 className="ml-display" style={{ fontSize: "2.6rem", margin: "0.4rem 0 0.7rem" }}>
        Sixteen chapters. Five acts. One question that must be allowed to fail.
      </h1>
      <p className="ml-line" style={{ maxWidth: "48rem", marginBottom: "1.5rem" }}>
        Can individuality emerge at a scale above us — and what evidence would force us to say yes?
      </p>

      <section className="ml-card" style={{ marginBottom: "2rem" }}>
        <p className="ml-kicker">Current scientific verdict</p>
        <h2 className="ml-display" style={{ fontSize: "1.55rem", margin: "0.4rem 0 0.7rem" }}>
          Macroscopic organization is real. Higher-order individuality is not established.
        </h2>
        <p style={{ color: "var(--ml-mute)", maxWidth: "50rem" }}>
          Civilization is an unusually integrated macroscopic organization and cognitive ecology. On the
          evidence reviewed in Book One, the stronger higher-order-individual model is not required.
          <strong> Current winner: Model C.</strong>
        </p>
        <p style={{ marginTop: "0.8rem" }}>
          <Link href={`${ML_BASE}/models`}>Compare Models A–D</Link>
          {" · "}
          <Link href={`${ML_BASE}/tests`}>Open the Eleven Tests</Link>
        </p>
      </section>

      <MarkdownBody markdown={frontMatter} />

      <div className="ml-grid" style={{ marginTop: "2rem" }}>
        {PUBLICATION_ACTS.map((act) => (
          <section key={act.id} className="ml-card">
            <p className="ml-kicker">Act {act.roman}</p>
            <h2 className="ml-display" style={{ fontSize: "1.6rem", margin: "0.35rem 0 0.5rem" }}>
              {act.title}
            </h2>
            <p style={{ color: "var(--ml-mute)", marginBottom: "0.8rem" }}>{act.feeling}</p>
            {CHAPTERS.filter((chapter) => chapter.act === act.id).map((chapter) => (
              <p key={chapter.slug} style={{ margin: "0.35rem 0" }}>
                <Link href={`${ML_BASE}/book/${chapter.slug}`}>
                  {String(chapter.number).padStart(2, "0")} {chapter.title}
                </Link>
              </p>
            ))}
          </section>
        ))}
      </div>

      <section className="ml-card" style={{ marginTop: "2rem" }}>
        <p className="ml-kicker">The method</p>
        <h2 className="ml-display" style={{ fontSize: "1.55rem", margin: "0.4rem 0 0.7rem" }}>
          The microbe is the doorway. The tests are the contribution.
        </h2>
        <p style={{ color: "var(--ml-mute)", maxWidth: "52rem" }}>
          The Eleven Tests are a proposed synthesis for model comparison in this project, not a consensus
          definition of life or biological individuality. They are designed to make the stronger hypothesis
          compete against serious lower-level alternatives and risk failure.
        </p>
        <p className="ml-line" style={{ marginTop: "1rem" }}>
          Measure. Perturb. Compare models. Allow failure.
        </p>
      </section>
    </div>
  );
}
