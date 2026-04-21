import Link from "next/link";
import { cn } from "@/lib/utils";

type ResourceCardProps = {
  title: string;
  description: string;
  href: string;
  tag?: string;
  ctaLabel?: string;
  className?: string;
};

export function ResourceCard({
  title,
  description,
  href,
  tag,
  ctaLabel = "Open resource",
  className,
}: ResourceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-card border border-deep-soil/10 bg-cream-canvas p-6 shadow-[var(--shadow-soft)] transition duration-normal hover:-translate-y-0.5 hover:border-field-green/40 hover:shadow-[var(--shadow-card)] md:p-7",
        className,
      )}
    >
      {tag ? (
        <span className="inline-flex w-fit rounded-full bg-field-green/15 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wider text-field-green">
          {tag}
        </span>
      ) : null}
      <h3 className="mt-3 font-heading text-lg font-bold text-deep-soil group-hover:text-red-dirt lg:text-xl">
        {title}
      </h3>
      <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-deep-soil/75 md:text-base">
        {description}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 font-body text-sm font-semibold text-red-dirt">
        {ctaLabel}
        <span aria-hidden className="transition group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
