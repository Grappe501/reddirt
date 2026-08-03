import { KickoffCard, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";

export default function KickoffWhyPage() {
  return (
    <SlideFrame
      eyebrow="Why we are here"
      title="The Campaign Has Reached a Turning Point"
      speaker="Steve"
    >
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        Until now, Kelly and Steve have managed nearly every part of the campaign while building
        relationships across Arkansas. The foundation is in place.
      </p>
      <p className="max-w-3xl">
        Now we need leaders who will help operate, expand, and carry the campaign into every county.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <KickoffCard title="Inspire">
          Share why this campaign listens first—and why every community matters.
        </KickoffCard>
        <KickoffCard title="Inform">
          Show Operation Arkansas, the Youth Coalition, and how the work is organized.
        </KickoffCard>
        <KickoffCard title="Recruit">
          Fill local teams and statewide campaign roles during this meeting.
        </KickoffCard>
        <KickoffCard title="Commit">
          Leave with a team, one recruit ask, and one action this week.
        </KickoffCard>
      </div>

      <p className="max-w-3xl border-l-4 border-[var(--kelly-official-gold)] pl-4 text-lg font-semibold text-[var(--kelly-official-navy)]">
        Tonight is not only a campaign update. It is an invitation to help build the team that will take
        us through Election Day.
      </p>
    </SlideFrame>
  );
}
