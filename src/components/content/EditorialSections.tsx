import type { EditorialSection } from "@/content/editorial/types";
import { cn } from "@/lib/utils";

export function EditorialSections({
  sections,
  className,
}: {
  sections: EditorialSection[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-12", className)}>
      {sections.map((s, i) => {
        if (s.type === "prose") {
          return (
            <section key={i} className="space-y-4">
              {s.title ? (
                <h2 className="font-heading text-2xl font-bold text-deep-soil lg:text-3xl">{s.title}</h2>
              ) : null}
              {s.paragraphs.map((p, j) => (
                <p key={j} className="font-body text-lg leading-relaxed text-deep-soil/85">
                  {p}
                </p>
              ))}
            </section>
          );
        }
        if (s.type === "list") {
          return (
            <section key={i} className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-8">
              {s.title ? (
                <h2 className="font-heading text-xl font-bold text-deep-soil">{s.title}</h2>
              ) : null}
              <ul className={cn("mt-4 space-y-3", s.title && "mt-4")}>
                {s.items.map((item, j) => (
                  <li key={j} className="flex gap-3 font-body text-base leading-relaxed text-deep-soil/85">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        }
        if (s.type === "quote") {
          return (
            <figure
              key={i}
              className="rounded-card border-l-4 border-field-green bg-field-green/10 py-6 pl-6 pr-6 md:pl-8"
            >
              <blockquote className="font-heading text-xl font-bold leading-snug text-deep-soil lg:text-2xl">
                “{s.quote}”
              </blockquote>
              {s.attribution ? (
                <figcaption className="mt-4 font-body text-xs font-semibold uppercase tracking-[0.18em] text-deep-soil/55">
                  {s.attribution}
                </figcaption>
              ) : null}
            </figure>
          );
        }
        return (
          <aside
            key={i}
            className="rounded-card border border-red-dirt/25 bg-red-dirt/10 p-6 md:p-8"
          >
            <h2 className="font-heading text-lg font-bold text-deep-soil">{s.title}</h2>
            <p className="mt-3 font-body text-base leading-relaxed text-deep-soil/85">{s.body}</p>
          </aside>
        );
      })}
    </div>
  );
}
