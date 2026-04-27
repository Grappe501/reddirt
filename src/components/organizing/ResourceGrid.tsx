import Link from "next/link";
import type { ResourceItem } from "@/content/types";
import { volunteerPath } from "@/content/resources/toolkit";
import { cn } from "@/lib/utils";

export function ResourceGrid({ items, className }: { items: ResourceItem[]; className?: string }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {items.map((r) => {
        const volunteerHref = volunteerPath(r.slug);
        return (
          <li key={r.slug}>
            <article className="flex h-full flex-col justify-between rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-7">
              <div>
                {r.tag ? (
                  <span className="inline-flex rounded-full border border-kelly-text/15 bg-kelly-text/[0.04] px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text/70">
                    {r.tag}
                  </span>
                ) : null}
                <h3 className="mt-3 font-heading text-xl font-bold text-kelly-text">
                  <Link
                    href={r.href}
                    className="hover:text-kelly-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40"
                  >
                    {r.title}
                  </Link>
                </h3>
                <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/75">{r.description}</p>
                {r.comingSoon ? (
                  <p className="mt-3 font-body text-sm font-semibold text-kelly-text/60">Deep guide coming soon</p>
                ) : null}
              </div>
              <div className="mt-6 flex flex-col gap-2 border-t border-kelly-text/10 pt-4">
                <Link
                  href={r.href}
                  className="inline-flex w-fit items-center gap-2 font-body text-sm font-semibold text-kelly-text hover:text-kelly-navy"
                >
                  Read full guide
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href={volunteerHref}
                  className="inline-flex w-fit items-center gap-2 font-body text-sm font-semibold text-kelly-navy"
                >
                  Volunteer for this
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
