import Link from "next/link";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { buildPublicLocationLine, formatPublicEventWhenRange } from "@/lib/calendar/public-event-format";
import { cn } from "@/lib/utils";

const venuePill: Record<string, string> = {
  virtual: "bg-kelly-blue/10 text-kelly-ink",
  in_person: "bg-kelly-success/20 text-kelly-text",
  unspecified: "bg-kelly-text/8 text-kelly-text/80",
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
        "flex h-full flex-col justify-between rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-4 shadow-sm transition hover:border-kelly-navy/20 md:p-5",
        emphasis === "compact" && "p-3 md:p-4",
        className,
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-kelly-navy/20 bg-kelly-navy/8 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text">
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
            "mt-3 font-heading font-bold text-kelly-text",
            emphasis === "compact" ? "text-base md:text-lg" : "text-lg md:text-xl",
          )}
        >
          <Link
            href={event.detailHref}
            className="hover:text-kelly-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/30"
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-1 font-body text-sm font-semibold text-kelly-text/75">{dateLine}</p>
        <p className="font-mono text-xs text-kelly-text/65">{timeLine}</p>
        {event.county ? (
          <p className="mt-1 text-xs font-semibold text-kelly-slate">{event.county.displayName} County</p>
        ) : null}
        {location ? <p className="mt-1 text-sm text-kelly-text/70">{location}</p> : null}
        {event.publicSummary ? (
          <p
            className={cn(
              "mt-2 font-body text-sm leading-relaxed text-kelly-text/80",
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
          className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md bg-kelly-gold px-3 py-1.5 font-body text-sm font-semibold text-kelly-navy hover:brightness-105"
        >
          {event.primaryAction.label}
        </Link>
        <Link
          href={event.secondaryAction.href}
          className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md border border-kelly-navy/30 bg-kelly-page px-3 py-1.5 font-body text-sm font-semibold text-kelly-navy hover:border-kelly-navy/50"
        >
          {event.secondaryAction.label}
        </Link>
      </div>
    </article>
  );
}

