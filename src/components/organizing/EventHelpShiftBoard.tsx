import { Button } from "@/components/ui/Button";
import type { PublicMobilizeBoard, PublicMobilizeShift } from "@/lib/integrations/mobilize";

function groupByLocation(shifts: PublicMobilizeShift[]): Array<{ location: string; items: PublicMobilizeShift[] }> {
  const map = new Map<string, PublicMobilizeShift[]>();
  for (const shift of shifts) {
    const key = shift.locationLabel;
    const list = map.get(key) ?? [];
    list.push(shift);
    map.set(key, list);
  }
  return [...map.entries()].map(([location, items]) => ({ location, items }));
}

export function EventHelpShiftBoard({ board }: { board: PublicMobilizeBoard }) {
  if (board.shifts.length === 0) {
    return (
      <div className="rounded-card border border-kelly-ink/15 bg-white px-6 py-10 text-center md:px-10">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-kelly-ink">
          Shifts will appear here as they are posted
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-kelly-slate">
          When a volunteer signup is live on Mobilize, it shows up on this page by city. Until then, raise your hand
          and we will match you to the next stop.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/get-involved#volunteer" variant="primary">
            Volunteer signup
          </Button>
          <Button href="/events" variant="outline">
            Campaign calendar
          </Button>
        </div>
      </div>
    );
  }

  const groups = groupByLocation(board.shifts);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.location} aria-labelledby={`loc-${group.location}`}>
          <h2 id={`loc-${group.location}`} className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            {group.location}
          </h2>
          <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
            {group.items.map((shift) => (
              <li key={shift.id}>
                <a
                  href={shift.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-card border border-kelly-navy/15 bg-white px-5 py-5 shadow-sm transition hover:border-kelly-navy/40 hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
                >
                  <p className="font-heading text-lg font-bold text-kelly-ink">{shift.title}</p>
                  <p className="mt-2 font-body text-sm text-kelly-slate">{shift.whenLabel}</p>
                  <p className="mt-4 font-body text-sm font-semibold text-kelly-navy">Sign up on Mobilize →</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
