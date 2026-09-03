import Link from "next/link";
import type { EventItem } from "@/content/types";
import { publicEventMarkChips } from "@/lib/events/event-marks";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";

const PILL =
  "inline-flex rounded-full border border-kelly-navy bg-white px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-navy";

export function EventMarksChips({
  event,
  className,
}: {
  event: EventItem;
  className?: string;
}) {
  const chips = publicEventMarkChips(event);
  if (!chips.length) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="What to know about this stop">
      {chips.map((chip) => {
        if (chip.href) {
          const ext = isExternalHref(chip.href);
          return (
            <li key={chip.key}>
              <Link
                href={chip.href}
                className={PILL}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noopener noreferrer" : undefined}
              >
                {chip.label}
              </Link>
            </li>
          );
        }
        return (
          <li key={chip.key}>
            <span className={PILL}>{chip.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
