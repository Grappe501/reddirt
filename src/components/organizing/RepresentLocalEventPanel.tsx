import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { representLocalEventVolunteerHref } from "@/config/navigation";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  className?: string;
};

/**
 * Call-to-action block for volunteers who can table or speak for the campaign
 * at third-party local events (fairs, festivals, civic meetings, etc.).
 */
export function RepresentLocalEventPanel({ id, className }: Props) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-xl border border-kelly-success/25 bg-kelly-success/[0.08] p-6 shadow-sm md:p-8",
        className,
      )}
    >
      <h3 className="font-heading text-lg font-bold text-kelly-text md:text-xl">
        Represent the campaign where you are
      </h3>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80 md:text-base">
        If there is a fair, festival, party meeting, or civic gathering in your town, you can help table, greet, or
        hand out information. We will get you materials and a clear job for the day.
      </p>
      <ul className="mt-4 list-disc space-y-1.5 pl-5 font-body text-sm text-kelly-text/75 md:text-base">
        <li>
          Prefer to host at home?{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/host-a-gathering">
            Host a gathering
          </Link>
          .
        </li>
        <li>
          Know a stop we should attend?{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/events#suggest">
            Suggest an event
          </Link>
          {" "}or browse{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/events">
            the calendar
          </Link>
          .
        </li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={representLocalEventVolunteerHref} variant="primary">
          Pick an event shift
        </Button>
        <Button href="/events" variant="outline">
          Events
        </Button>
        <Button href="/events#suggest" variant="outline">
          Suggest an event
        </Button>
      </div>
    </div>
  );
}
