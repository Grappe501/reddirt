import Link from "next/link";

import { BIBLIOGRAPHY, bibliographyForChapter } from "@/content/macroscopic-life/bibliography";
import { CHAPTERS, ML_BASE } from "@/content/macroscopic-life/catalog";
import { CHAPTER_SOURCES } from "@/content/macroscopic-life/sources";

export const metadata = { title: "Sources" };

export default function SourcesPage() {
  return (
    <div className="ml-page">
      <p className="ml-kicker">Scientific foundation</p>
      <h1 className="ml-display ml-page-title">Source atlas</h1>
      <p className="ml-line" style={{ maxWidth: "50rem" }}>
        The book separates established science, inference, analogy, and project synthesis. This atlas shows the literature burden underneath each chapter without turning the reader text into a wall of citations.
      </p>
      <p style={{ color: "var(--ml-mute)", maxWidth: "50rem", marginBottom: "1.8rem" }}>
        This is the shared digital/print scholarly layer. Entries marked as queued still require final publisher-style metadata verification; the research control files remain authoritative until that normalization is complete.
      </p>

      <div className="ml-grid">
        {CHAPTER_SOURCES.map((source) => {
          const chapter = CHAPTERS.find((item) => item.number === source.chapter);
          const bibliography = bibliographyForChapter(source.chapter);
          return (
            <article key={source.chapter} className="ml-card" id={`chapter-${source.chapter}`}>
              <p className="ml-kicker">Chapter {String(source.chapter).padStart(2, "0")}</p>
              <h2 className="ml-display" style={{ fontSize: "1.45rem", margin: "0.35rem 0 0.6rem" }}>{source.label}</h2>
              {chapter ? <p><Link href={`${ML_BASE}/book/${chapter.slug}`}>{chapter.title}</Link></p> : null}

              <p className="ml-kicker" style={{ marginTop: "1rem" }}>Coverage</p>
              <ul>{source.coverage.map((item) => <li key={item}>{item}</li>)}</ul>

              <p className="ml-kicker" style={{ marginTop: "1rem" }}>Scientific cautions</p>
              <ul>{source.cautions.map((item) => <li key={item}>{item}</li>)}</ul>

              {bibliography.length ? (
                <>
                  <p className="ml-kicker" style={{ marginTop: "1rem" }}>Publication bibliography anchors</p>
                  {bibliography.map((entry) => (
                    <div key={entry.id} style={{ marginBottom: "0.8rem" }}>
                      <p style={{ margin: 0 }}>{entry.href ? <a href={entry.href} target="_blank" rel="noreferrer">{entry.citation}</a> : entry.citation}</p>
                      {entry.note ? <p style={{ margin: "0.2rem 0 0", color: "var(--ml-mute)", fontSize: "0.8rem" }}>{entry.note}</p> : null}
                    </div>
                  ))}
                </>
              ) : source.references?.length ? (
                <>
                  <p className="ml-kicker" style={{ marginTop: "1rem" }}>Representative anchors</p>
                  {source.references.map((reference) => <p key={reference.label} style={{ margin: "0.35rem 0" }}>{reference.href ? <a href={reference.href} target="_blank" rel="noreferrer">{reference.label}</a> : reference.label}</p>)}
                </>
              ) : null}

              <p style={{ color: "var(--ml-mute)", fontSize: "0.8rem", marginTop: "1rem" }}>Research control: {source.controlFile}</p>
            </article>
          );
        })}
      </div>

      <section style={{ marginTop: "3rem" }} id="bibliography">
        <p className="ml-kicker">Book One</p>
        <h2 className="ml-display" style={{ fontSize: "2rem", margin: "0.35rem 0 1rem" }}>Working publication bibliography</h2>
        <p style={{ color: "var(--ml-mute)", maxWidth: "50rem", marginBottom: "1.4rem" }}>
          This list contains normalized or normalization-in-progress anchors already admitted to the publication apparatus. Missing fields are intentionally labeled rather than guessed.
        </p>
        {BIBLIOGRAPHY.map((entry) => (
          <div key={entry.id} className="ml-card" style={{ marginBottom: "0.8rem" }}>
            <p style={{ margin: 0 }}>{entry.href ? <a href={entry.href} target="_blank" rel="noreferrer">{entry.citation}</a> : entry.citation}</p>
            <p style={{ color: "var(--ml-mute)", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>Chapters {entry.chapters.join(", ")}{entry.note ? ` · ${entry.note}` : ""}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
