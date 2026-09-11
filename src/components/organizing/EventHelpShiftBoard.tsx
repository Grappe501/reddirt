import { Button } from "@/components/ui/Button";
import type { PublicMobilizeBoard, PublicMobilizeShift, PublicMobilizeShiftKind } from "@/lib/integrations/mobilize";

function groupByCity(shifts: PublicMobilizeShift[]): Array<{ city: string; items: PublicMobilizeShift[] }> {
  const map = new Map<string, PublicMobilizeShift[]>();
  for (const shift of shifts) {
    const list = map.get(shift.city) ?? [];
    list.push(shift);
    map.set(shift.city, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([city, items]) => ({ city, items }));
}

function ShiftCard({ shift, cta }: { shift: PublicMobilizeShift; cta: string }) {
  return (
    <a
      href={shift.signupUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-card border border-kelly-navy/15 bg-white px-5 py-5 shadow-sm transition hover:border-kelly-navy/40 hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
    >
      <p className="font-heading text-2xl font-bold leading-tight tracking-tight text-kelly-ink md:text-3xl">
        {shift.city}
      </p>
      <p className="mt-2 font-heading text-xl font-bold leading-snug text-kelly-navy md:text-2xl">
        {shift.dateHeadline}
      </p>
      <p className="mt-1 font-heading text-lg font-semibold text-kelly-text">{shift.timeHeadline}</p>
      {shift.venue ? <p className="mt-2 font-body text-sm font-semibold text-kelly-text/80">{shift.venue}</p> : null}
      <p className="mt-4 font-heading text-lg font-bold text-kelly-text">{shift.title}</p>
      <p className="mt-4 font-body text-sm font-semibold text-kelly-navy">{cta} →</p>
    </a>
  );
}

function ShiftSection({
  heading,
  intro,
  kind,
  shifts,
  cta,
}: {
  heading: string;
  intro: string;
  kind: PublicMobilizeShiftKind;
  shifts: PublicMobilizeShift[];
  cta: string;
}) {
  const items = shifts.filter((s) => s.kind === kind);
  if (items.length === 0) return null;
  const groups = groupByCity(items);
  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl">{heading}</h2>
        <p className="mt-2 max-w-2xl font-body text-base leading-relaxed text-kelly-slate">{intro}</p>
      </div>
      {groups.map((group) => (
        <div key={`${kind}-${group.city}`}>
          <h3 className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">{group.city}</h3>
          <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
            {group.items.map((shift) => (
              <li key={shift.id}>
                <ShiftCard shift={shift} cta={cta} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export function EventHelpShiftBoard({ board }: { board: PublicMobilizeBoard }) {
  if (board.shifts.length === 0) {
    return (
      <div className="rounded-card border border-kelly-ink/15 bg-white px-6 py-10 text-center md:px-10">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-kelly-ink">
          {board.error ? "Mobilize is taking a minute" : "Shifts will appear here as they are posted"}
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-kelly-slate">
          Live volunteer signups live on Mobilize. Open the campaign list, or raise your hand and we will match you to
          the next stop.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={board.feedUrl} variant="primary">
            Open Mobilize shifts
          </Button>
          <Button href="/get-involved#volunteer" variant="outline">
            Volunteer signup
          </Button>
          <Button href="/events" variant="outline">
            Campaign calendar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <ShiftSection
        heading="Volunteer shifts"
        intro="Pick a city. Each card opens the Mobilize signup for that shift."
        kind="help"
        shifts={board.shifts}
        cta="Sign up to help on Mobilize"
      />
      <ShiftSection
        heading="Attend an event"
        intro="Want to be in the room? RSVP on Mobilize so the host has a count."
        kind="attend"
        shifts={board.shifts}
        cta="RSVP on Mobilize"
      />
      <p className="font-body text-sm text-kelly-slate">
        More shifts post on{" "}
        <a className="font-semibold text-kelly-navy underline" href={board.feedUrl} target="_blank" rel="noopener noreferrer">
          the campaign Mobilize page
        </a>
        . They show up here automatically.
      </p>
    </div>
  );
}
