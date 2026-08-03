import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffWelcomePage() {
  return (
    <SlideFrame
      eyebrow="Statewide Volunteer Leadership Kickoff"
      title="75 Counties. One Arkansas. One Team."
      speaker="Steve"
    >
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)] sm:text-xl">
        Kelly and Steve have spent the last nine months building trust, traveling the state, and listening
        to Arkansans. Tonight, we begin the next phase.
      </p>

      <div className="grid gap-4 rounded-[var(--radius-premium)] bg-[var(--kelly-official-navy)] p-6 text-[var(--text-on-navy)] sm:p-8">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-[var(--kelly-official-gold)]">
          Tonight’s purpose
        </p>
        <p className="text-lg leading-relaxed sm:text-xl">
          Tonight isn’t about listening to another campaign meeting. Tonight is about building the team
          that’s going to take this campaign into every corner of Arkansas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KickoffCard title="Organize 75 counties">
          Build a grassroots presence in every county before Labor Day.
        </KickoffCard>
        <KickoffCard title="Launch the tour">
          Start a sustained statewide community tour after Labor Day.
        </KickoffCard>
        <KickoffCard title="Staff the teams">
          Fill volunteer, outreach, logistics, communications, and GOTV lanes.
        </KickoffCard>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <KickoffCtaLink href={`${KICKOFF_BASE}/why`}>Begin the Presentation</KickoffCtaLink>
        <KickoffCtaLink href={`${KICKOFF_BASE}/join`} variant="secondary">
          Volunteer Now
        </KickoffCtaLink>
        <KickoffCtaLink href={`${KICKOFF_BASE}?mode=follow`} variant="outline">
          Follow Along on My Device
        </KickoffCtaLink>
      </div>
    </SlideFrame>
  );
}
