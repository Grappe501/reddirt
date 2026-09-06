import Link from "next/link";

import { CHAPTERS, ML_BASE } from "@/content/macroscopic-life/catalog";
import { loadOpening } from "@/lib/macroscopic-life/load-manuscript";
import { MarkdownBody } from "@/components/macroscopic-life/MarkdownBody";

export const metadata = { title: "Listen" };

export default function ListenPage() {
  const opening = loadOpening();
  return (
    <div className="ml-page ml-listen">
      <p className="ml-kicker">Spoken rhythm</p>
      <h1 className="ml-display ml-page-title">Hear the skim layer first</h1>
      <p className="ml-lede">
        If you only keep the opening and the sixteen display lines, you should still reconstruct this:
        organization can be real without a new organism.
      </p>
      <MarkdownBody markdown={opening} />
      <ol className="ml-recite">
        {CHAPTERS.map((chapter) => (
          <li key={chapter.slug}>
            <Link href={`${ML_BASE}/book/${chapter.slug}`}>
              Chapter {chapter.number}. {chapter.title}.
            </Link>
            <p className="ml-line">{chapter.displayLine}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
