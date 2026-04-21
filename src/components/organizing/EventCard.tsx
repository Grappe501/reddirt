import Link from "next/link";
import type { EventItem } from "@/content/types";
import { formatEventWhen } from "@/lib/format/eventDisplay";
import { cn } from "@/lib/utils";

export function EventCard({ event, className }: { event: EventItem; className?: string }) {
  const when = formatEventWhen(event);
  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-7",
        className,
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-red-dirt/25 bg-red-dirt/10 px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-deep-soil">
            {event.type}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider",
              event.status === "upcoming"
                ? "border border-field-green/35 bg-field-green/12 text-deep-soil"
                : "border border-deep-soil/15 bg-deep-soil/[0.05] text-deep-soil/70",
            )}
          >
            {event.status === "upcoming" ? "Upcoming" : "Past"}
          </span>
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold text-deep-soil lg:text-2xl">
          <Link href={`/events/${event.slug}`} className="hover:text-red-dirt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-dirt/40">
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 font-body text-sm font-semibold text-deep-soil/70">{when.primary}</p>
        <p className="mt-1 font-body text-sm text-deep-soil/60">{event.locationLabel}</p>
        <p className="mt-4 font-body text-base leading-relaxed text-deep-soil/75">{event.summary}</p>
      </div>
      <Link
        href={`/events/${event.slug}`}
        className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-red-dirt"
      >
        View details
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
