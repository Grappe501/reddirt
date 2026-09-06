import Link from "next/link";

import { ACTS, CHAPTERS, ML_BASE } from "@/content/macroscopic-life/catalog";
import { loadFrontMatter } from "@/lib/macroscopic-life/load-manuscript";
import { MarkdownBody } from "@/components/macroscopic-life/MarkdownBody";

export const metadata = { title: "Book One" };

export default function BookAtlasPage() {
  const frontMatter = loadFrontMatter();
  return (
    <div className="ml-page">
      <p className="ml-kicker">Five nested windows</p>
      <h1 className="ml-display ml-page-title">Enter at the scale you can stand.</h1>
      <div className="ml-atlas-intro">
        <MarkdownBody markdown={frontMatter} />
      </div>
      <div className="ml-windows">
        {ACTS.map((act) => {
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
    </div>
  );
}
