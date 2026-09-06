import Link from "next/link";

import { ACTS, CHAPTERS, ML_BASE } from "@/content/macroscopic-life/catalog";
import { loadFrontMatter } from "@/lib/macroscopic-life/load-manuscript";
import { MarkdownBody } from "@/components/macroscopic-life/MarkdownBody";

export const metadata = { title: "Book One" };

export default function BookAtlasPage() {
  const frontMatter = loadFrontMatter();
  return (
    <div className="ml-page">
      <p className="ml-kicker">Act atlas</p>
      <h1 className="ml-display" style={{ fontSize: "2.6rem", margin: "0.4rem 0 1.2rem" }}>
        Sixteen chapters. Five windows.
      </h1>
      <MarkdownBody markdown={frontMatter} />
      <div className="ml-grid" style={{ marginTop: "2rem" }}>
        {ACTS.map((act) => (
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
    </div>
  );
}
