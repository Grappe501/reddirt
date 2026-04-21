import type { DocumentBlock } from "@/content/shared/document";
import { cn } from "@/lib/utils";

export function DocumentBody({ blocks, className }: { blocks: DocumentBlock[]; className?: string }) {
  return (
    <div className={cn("space-y-8", className)}>
      {blocks.map((b, i) => {
        if (b.type === "paragraph") {
          return (
            <p key={i} className="font-body text-lg leading-relaxed text-deep-soil/85">
              {b.text}
            </p>
          );
        }
        if (b.type === "heading") {
          return (
            <h2 key={i} className="font-heading text-2xl font-bold text-deep-soil lg:text-3xl">
              {b.text}
            </h2>
          );
        }
        return (
          <figure
            key={i}
            className="rounded-card border-l-4 border-red-dirt bg-deep-soil/[0.03] py-6 pl-6 pr-6 md:pl-8"
          >
            <blockquote className="font-heading text-xl font-bold leading-snug text-deep-soil lg:text-2xl">
              “{b.text}”
            </blockquote>
            {b.attribution ? (
              <figcaption className="mt-4 font-body text-xs font-semibold uppercase tracking-[0.18em] text-deep-soil/55">
                {b.attribution}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
