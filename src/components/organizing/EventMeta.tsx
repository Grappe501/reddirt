import type { EventItem } from "@/content/types";
import { formatEventWhen } from "@/lib/format/eventDisplay";
import { cn } from "@/lib/utils";

export function EventMeta({
  event,
  className,
  dense,
}: {
  event: EventItem;
  className?: string;
  dense?: boolean;
}) {
  const when = formatEventWhen(event);
  return (
    <dl
      className={cn(
        "grid gap-3 font-body text-kelly-text/80",
        dense ? "text-sm" : "text-base",
        className,
      )}
    >
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-kelly-text/50">When</dt>
        <dd className="mt-1">
          <span className="block font-semibold text-kelly-text">{when.primary}</span>
          {when.secondary ? <span className="block text-kelly-text/75">{when.secondary}</span> : null}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-kelly-text/50">Where</dt>
        <dd className="mt-1 font-semibold text-kelly-text">{event.locationLabel}</dd>
        {event.addressLine ? (
          <dd className="mt-1 text-kelly-text/75">{event.addressLine}</dd>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-kelly-navy/25 bg-kelly-navy/10 px-3 py-1 text-xs font-semibold text-kelly-text">
          {event.type}
        </span>
        <span className="rounded-full border border-kelly-text/15 bg-kelly-text/[0.04] px-3 py-1 text-xs font-semibold text-kelly-text/80">
          {event.region}
        </span>
        {event.audienceTags?.slice(0, 2).map((t) => (
          <span
            key={t}
            className="rounded-full border border-kelly-success/30 bg-kelly-success/10 px-3 py-1 text-xs font-semibold text-kelly-text"
          >
            {t}
          </span>
        ))}
      </div>
    </dl>
  );
}
