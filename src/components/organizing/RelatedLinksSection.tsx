import Link from "next/link";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { cn } from "@/lib/utils";

export type RelatedLink = { label: string; href: string; description?: string };

type RelatedLinksSectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  links: RelatedLink[];
  className?: string;
};

export function RelatedLinksSection({ id, title, subtitle, links, className }: RelatedLinksSectionProps) {
  return (
    <section className={cn("space-y-8", className)} aria-labelledby={id ? `${id}-heading` : undefined}>
      <SectionHeading id={id ? `${id}-heading` : undefined} title={title} subtitle={subtitle} />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-kelly-navy/30"
            >
              <span className="font-heading text-lg font-bold text-kelly-text">{l.label}</span>
              {l.description ? (
                <span className="mt-2 block font-body text-sm text-kelly-text/70">{l.description}</span>
              ) : null}
              <span className="mt-3 inline-flex items-center gap-2 font-body text-sm font-semibold text-kelly-navy">
                Go
                <span aria-hidden>→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
