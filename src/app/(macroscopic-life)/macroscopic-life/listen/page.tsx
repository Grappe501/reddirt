import Link from "next/link";

import { CHAPTERS, ML_BASE } from "@/content/macroscopic-life/catalog";
import { loadOpening } from "@/lib/macroscopic-life/load-manuscript";
import { MarkdownBody } from "@/components/macroscopic-life/MarkdownBody";

export const metadata = { title: "Listen" };

export default function ListenPage() {
  const opening = loadOpening();
  return (
    <div className="ml-page" style={{ maxWidth: "42rem" }}>
      <p className="ml-kicker">Spoken rhythm</p>
      <h1 className="ml-display" style={{ fontSize: "2.5rem", margin: "0.4rem 0 1rem" }}>
        Read it aloud from the openings
      </h1>
      <p style={{ color: "var(--ml-mute)", marginBottom: "1.4rem" }}>
        The book was line-edited for spoken rhythm. This page is the opening plus the display line
        from every chapter — the skim layer a listener should be able to reconstruct.
      </p>
      <MarkdownBody markdown={opening} />
      <ol style={{ paddingLeft: "1.2rem" }}>
        {CHAPTERS.map((chapter) => (
          <li key={chapter.slug} style={{ margin: "1rem 0" }}>
            <Link href={`${ML_BASE}/book/${chapter.slug}`}>
              Chapter {chapter.number}. {chapter.title}.
            </Link>{" "}
            {chapter.displayLine}
          </li>
        ))}
      </ol>
    </div>
  );
}
