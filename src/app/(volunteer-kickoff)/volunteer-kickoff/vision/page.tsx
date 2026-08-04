import { KickoffCard, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";

const commitments = [
  "Nobody will outwork us.",
  "Every Arkansas community matters.",
  "Opposing voices belong at the table.",
  "Personal attacks do not bring people together.",
  "Public officials must still be held accountable.",
  "State government should work for citizens rather than restrict them.",
  "Decisions should be made as close to the local community as possible.",
];

export default function KickoffVisionPage() {
  return (
    <SlideFrame eyebrow="Kelly’s vision" title="Trust Comes Before Politics" speaker="Kelly">
      <div className="grid gap-3 sm:grid-cols-3">
        {["Listen.", "Trust.", "Serve."].map((word) => (
          <div
            key={word}
            className="rounded-[var(--radius-premium)] bg-[var(--kelly-official-navy)] px-4 py-8 text-center font-heading text-3xl font-bold text-[var(--kelly-official-gold)] sm:text-4xl"
          >
            {word}
          </div>
        ))}
      </div>

      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        People do not listen to a candidate until they trust the person. That is why this campaign began
        by traveling, listening, showing up, and spending meaningful time in communities—especially rural
        communities statewide candidates often overlook.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {commitments.map((item) => (
          <KickoffCard key={item}>
            <p className="font-semibold text-[var(--kelly-official-navy)]">{item}</p>
          </KickoffCard>
        ))}
      </div>

      <p className="max-w-3xl text-xl font-semibold leading-snug text-[var(--kelly-official-navy)]">
        “Government works best when it listens. My goal isn’t simply to win an election—it’s to earn the
        trust of Arkansas.”
      </p>
    </SlideFrame>
  );
}
