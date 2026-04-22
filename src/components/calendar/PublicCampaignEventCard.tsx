import Link from "next/link";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { buildPublicLocationLine, formatPublicEventWhenRange } from "@/lib/calendar/public-event-format";
import { cn } from "@/lib/utils";

const venuePill: Record<string, string> = {
  virtual: "bg-civic-blue/10 text-civic-ink",
  in_person: "bg-field-green/20 text-deep-soil",
  unspecified: "bg-deep-soil/8 text-deep-soil/80",
};

export function PublicCampaignEventCard({
  event,
  className,
  emphasis = "default",
}: {
  event: PublicCampaignEvent;
  className?: string;
  emphasis?: "default" | "compact";
}) {
  const { dateLine, timeLine } = formatPublicEventWhenRange(
    event.startAt,
    event.endAt,
    event.timezone
  );
  const location = buildPublicLocationLine(event.locationName, event.address, event.venueMode);
  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-4 shadow-sm transition hover:border-red-dirt/20 md:p-5",
        emphasis === "compact" && "p-3 md:p-4",
        className,
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-red-dirt/20 bg-red-dirt/8 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-deep-soil">
            {event.eventTypeLabel}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider",
              venuePill[event.venueMode] ?? venuePill.unspecified,
            )}
          >
            {event.venueMode === "virtual" ? "Virtual" : event.venueMode === "in_person" ? "In person" : "Format TBA"}
          </span>
        </div>
        <h3
          className={cn(
            "mt-3 font-heading font-bold text-deep-soil",
            emphasis === "compact" ? "text-base md:text-lg" : "text-lg md:text-xl",
          )}
        >
          <Link
            href={event.detailHref}
            className="hover:text-red-dirt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-dirt/30"
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-1 font-body text-sm font-semibold text-deep-soil/75">{dateLine}</p>
        <p className="font-mono text-xs text-deep-soil/65">{timeLine}</p>
        {event.county ? (
          <p className="mt-1 text-xs font-semibold text-civic-slate">{event.county.displayName} County</p>
        ) : null}
        {location ? <p className="mt-1 text-sm text-deep-soil/70">{location}</p> : null}
        {event.publicSummary ? (
          <p
            className={cn(
              "mt-2 font-body text-sm leading-relaxed text-deep-soil/80",
              emphasis === "compact" && "line-clamp-3",
            )}
          >
            {event.publicSummary}
          </p>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={event.primaryAction.href}
          className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md bg-red-dirt px-3 py-1.5 font-body text-sm font-semibold text-cream-canvas hover:bg-red-dirt/90"
        >
          {event.primaryAction.label}
        </Link>
        <Link
          href={event.secondaryAction.href}
          className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md border border-red-dirt/30 bg-cream-canvas px-3 py-1.5 font-body text-sm font-semibold text-red-dirt hover:border-red-dirt/50"
        >
          {event.secondaryAction.label}
        </Link>
      </div>
    </article>
  );
}

