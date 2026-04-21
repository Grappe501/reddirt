import Link from "next/link";
import type { ResourceItem } from "@/content/types";
import { cn } from "@/lib/utils";

export function ResourceGrid({ items, className }: { items: ResourceItem[]; className?: string }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {items.map((r) => (
        <li key={r.slug}>
          <article className="flex h-full flex-col justify-between rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-7">
            <div>
              {r.tag ? (
                <span className="inline-flex rounded-full border border-deep-soil/15 bg-deep-soil/[0.04] px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-deep-soil/70">
                  {r.tag}
                </span>
              ) : null}
              <h3 className="mt-3 font-heading text-xl font-bold text-deep-soil">
                <Link href={r.href} className="hover:text-red-dirt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-dirt/40">
                  {r.title}
                </Link>
              </h3>
              <p className="mt-3 font-body text-base leading-relaxed text-deep-soil/75">{r.description}</p>
              {r.comingSoon ? (
                <p className="mt-3 font-body text-sm font-semibold text-deep-soil/60">Deep guide coming soon</p>
              ) : null}
            </div>
            <Link
              href={r.href}
              className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-red-dirt"
            >
              Open
              <span aria-hidden>→</span>
            </Link>
          </article>
        </li>
      ))}
    </ul>
  );
}
