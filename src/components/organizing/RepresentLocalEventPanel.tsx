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
        "rounded-xl border border-field-green/25 bg-field-green/[0.08] p-6 shadow-sm md:p-8",
        className,
      )}
    >
      <h3 className="font-heading text-lg font-bold text-deep-soil md:text-xl">
        Represent the campaign where you are
      </h3>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-deep-soil/80 md:text-base">
        Volunteers often ask for something concrete. If there is a fair, festival, party meeting, or civic gathering
        in your town, we want to know—and we want you if you can show up with integrity, handouts, and a listening
        posture. Tell us your county, what is on the calendar, and how you can help.
      </p>
      <ul className="mt-4 list-disc space-y-1.5 pl-5 font-body text-sm text-deep-soil/75 md:text-base">
        <li>We route you to approved messaging and tabling basics—no improvisation required on rules or ballot talk.</li>
        <li>
          Not your thing? You can still{" "}
          <Link className="font-semibold text-red-dirt underline" href="/host-a-gathering">
            host a gathering
          </Link>
          ,{" "}
          <Link className="font-semibold text-red-dirt underline" href="/events#suggest">
            suggest a public event
          </Link>
          , or browse{" "}
          <Link className="font-semibold text-red-dirt underline" href="/events">
            what is scheduled
          </Link>
          .
        </li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={representLocalEventVolunteerHref} variant="primary">
          Volunteer to represent locally
        </Button>
        <Button href="/events" variant="outline">
          Events hub
        </Button>
        <Button href="/events#suggest" variant="outline">
          Suggest an event
        </Button>
      </div>
    </div>
  );
}
