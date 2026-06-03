import type { V3DebatePrepSection } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
import type { V3MarkdownSection } from "@/lib/intelligence/v3/markdownSections";

export function V3DebatePrepSectionList({ sections }: { sections: V3DebatePrepSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.id} className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{section.title}</h2>
          {section.paragraphs.length > 0 ? (
            <div className="mt-2 space-y-2 text-xs leading-relaxed text-kelly-muted">
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
          ) : null}
          {section.bullets.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
              {section.bullets.map((bullet) => (
                <li key={bullet.slice(0, 64)}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

export function V3MarkdownSectionList({ sections, title }: { sections: V3MarkdownSection[]; title?: string }) {
  if (sections.length === 0) {
    return <p className="text-xs text-kelly-muted">No research sections loaded for this surface.</p>;
  }
  return (
    <div className="space-y-4">
      {title ? <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{title}</h2> : null}
      {sections.map((section) => (
        <section key={section.heading} className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-violet-900">{section.heading}</h3>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="mt-2 text-xs text-kelly-muted">
              {p}
            </p>
          ))}
          {section.bullets.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
              {section.bullets.map((b) => (
                <li key={b.slice(0, 64)}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
