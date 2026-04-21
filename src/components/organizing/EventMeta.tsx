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
        "grid gap-3 font-body text-deep-soil/80",
        dense ? "text-sm" : "text-base",
        className,
      )}
    >
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-deep-soil/50">When</dt>
        <dd className="mt-1">
          <span className="block font-semibold text-deep-soil">{when.primary}</span>
          {when.secondary ? <span className="block text-deep-soil/75">{when.secondary}</span> : null}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wider text-deep-soil/50">Where</dt>
        <dd className="mt-1 font-semibold text-deep-soil">{event.locationLabel}</dd>
        {event.addressLine ? (
          <dd className="mt-1 text-deep-soil/75">{event.addressLine}</dd>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-red-dirt/25 bg-red-dirt/10 px-3 py-1 text-xs font-semibold text-deep-soil">
          {event.type}
        </span>
        <span className="rounded-full border border-deep-soil/15 bg-deep-soil/[0.04] px-3 py-1 text-xs font-semibold text-deep-soil/80">
          {event.region}
        </span>
        {event.audienceTags?.slice(0, 2).map((t) => (
          <span
            key={t}
            className="rounded-full border border-field-green/30 bg-field-green/10 px-3 py-1 text-xs font-semibold text-deep-soil"
          >
            {t}
          </span>
        ))}
      </div>
    </dl>
  );
}
