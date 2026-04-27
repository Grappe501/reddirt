import Link from "next/link";
import { cn } from "@/lib/utils";

type StoryCardProps = {
  title: string;
  excerpt: string;
  href: string;
  meta?: string;
  ctaLabel?: string;
  className?: string;
  /** Optional cover — placeholder SVGs or future photography */
  imageSrc?: string;
  imageAlt?: string;
  featured?: boolean;
  /** Off-site link (e.g. Substack); opens in a new tab. */
  external?: boolean;
};

export function StoryCard({
  title,
  excerpt,
  href,
  meta,
  ctaLabel = "Read story",
  className,
  imageSrc,
  imageAlt,
  featured,
  external,
}: StoryCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border border-kelly-text/10 bg-kelly-page shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-kelly-navy/25 hover:shadow-[var(--shadow-card)]",
        featured && "md:min-h-[320px]",
        className,
      )}
    >
      {imageSrc ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-kelly-text/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt ?? ""}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-kelly-text/35 via-transparent to-kelly-navy/10 mix-blend-multiply"
            aria-hidden
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6 md:p-7">
        {meta ? (
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-slate">
            {meta}
          </p>
        ) : null}
        <h3
          className={cn(
            "mt-3 font-heading font-bold text-kelly-text group-hover:text-kelly-navy",
            featured ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl",
          )}
        >
          <Link
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 font-body text-base leading-relaxed text-kelly-text/75">{excerpt}</p>
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="mt-6 inline-flex font-body text-sm font-semibold text-kelly-navy underline-offset-4 hover:underline"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

