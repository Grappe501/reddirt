import type { EventItem } from "@/content/types";

type Letter = { key: string; letter: string; label: string };

export function eventOpsLetters(event: EventItem): Letter[] {
  const marks = event.marks;
  if (!marks) return [];
  const letters: Letter[] = [];
  if (marks.mobilize === "needed" || marks.mobilize === "live") {
    letters.push({
      key: "m",
      letter: "M",
      label: marks.mobilize === "live" ? "Mobilize is live" : "Needs a Mobilize event",
    });
  }
  if (marks.volunteers === "needed" || marks.volunteers === "shifts_open") {
    letters.push({
      key: "v",
      letter: "V",
      label: marks.volunteers === "shifts_open" ? "Volunteer shifts open" : "Needs volunteers",
    });
  }
  if (marks.driver === "needed" || marks.driver === "assigned") {
    letters.push({
      key: "d",
      letter: "D",
      label: marks.driver === "assigned" ? "Driver assigned" : "Needs a driver",
    });
  }
  if (marks.tabling === "yes" || marks.tabling === "planned") {
    letters.push({
      key: "t",
      letter: "T",
      label: marks.tabling === "yes" ? "Campaign table" : "Table planned",
    });
  }
  return letters;
}

export function EventOpsLetters({ event }: { event: EventItem }) {
  const letters = eventOpsLetters(event);
  if (!letters.length) return null;
  return (
    <ul
      className="absolute right-2 top-2 flex gap-1"
      aria-label="Campaign ops needed"
    >
      {letters.map((item) => (
        <li key={item.key}>
          <span
            title={item.label}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-kelly-navy bg-kelly-navy font-body text-[11px] font-bold text-white"
          >
            {item.letter}
          </span>
          <span className="sr-only">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
