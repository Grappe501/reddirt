import { KickoffCard, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";

const method = ["Arrive", "Listen", "Participate", "Build", "Return", "Organize"];

export default function KickoffStrategyPage() {
  return (
    <SlideFrame
      eyebrow="Operation Arkansas"
      title="County by County. Community by Community."
      speaker="Steve"
    >
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        Arkansas will not be won from the top down. We are building this campaign community by community,
        county by county, and person by person.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <KickoffCard title="Before Labor Day" accent>
          Establish a campaign presence in all 75 counties.
        </KickoffCard>
        <KickoffCard title="After Labor Day" accent>
          Launch the statewide community tour—and our September 17 GOTV kickoff rally.
        </KickoffCard>
        <KickoffCard title="Final Month" accent>
          Activate canvassing, Strike Teams, outreach, and GOTV.
        </KickoffCard>
      </div>

      <KickoffCard title="September 17 — Grassroots & Guitar Strings" accent>
        <p>
          Campaign Get Out the Vote Kickoff with David Adam Byrnes in Sherwood. Goal: 500 attendees. We
          need a dedicated planning team starting tonight—about one month to execute.
        </p>
      </KickoffCard>

      <div>
        <p className="mb-3 font-heading text-sm font-bold uppercase tracking-[0.14em] text-[var(--kelly-official-navy)]">
          How we show up
        </p>
        <div className="flex flex-wrap gap-2">
          {method.map((step, i) => (
            <span
              key={step}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-[var(--kelly-official-navy)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--color-border-subtle)]"
            >
              <span className="text-[var(--kelly-official-gold)]">{i + 1}</span>
              {step}
            </span>
          ))}
        </div>
      </div>

      <p className="max-w-3xl text-xl font-semibold text-[var(--kelly-official-navy)]">
        Kelly and I can’t do this alone anymore. That’s why you’re here tonight.
      </p>
    </SlideFrame>
  );
}
