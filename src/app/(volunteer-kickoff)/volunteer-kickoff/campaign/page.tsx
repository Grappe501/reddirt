import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import { CAMPAIGN_TEAMS } from "@/content/volunteer-kickoff/roles";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffCampaignPage() {
  return (
    <SlideFrame
      eyebrow="Statewide campaign involvement"
      title="Help Operate the Statewide Campaign"
      speaker="Steve"
    >
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        For volunteers willing to work across county lines or help run campaign operations. As each team
        is introduced, sign up immediately if it fits.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CAMPAIGN_TEAMS.map((team) => (
          <KickoffCard key={team.id} title={team.title} accent={team.priority}>
            <p>{team.blurb}</p>
            {team.recognize ? (
              <p className="text-sm font-semibold text-[var(--kelly-official-navy)]">
                Recognize: {team.recognize}
              </p>
            ) : null}
            {team.priority ? (
              <p className="text-sm font-bold uppercase tracking-wide text-[var(--kelly-official-gold)]">
                Priority opening
              </p>
            ) : null}
          </KickoffCard>
        ))}
      </div>

      <KickoffCtaLink href={`${KICKOFF_BASE}/join/campaign`}>Join a Campaign Team</KickoffCtaLink>
    </SlideFrame>
  );
}
