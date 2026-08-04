import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import { GRASSROOTS_GUITAR_STRINGS } from "@/content/volunteer-kickoff/calendar";
import { CAMPAIGN_TEAMS } from "@/content/volunteer-kickoff/roles";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffCampaignPage() {
  const priorityTeams = CAMPAIGN_TEAMS.filter((t) => t.priority);
  const otherTeams = CAMPAIGN_TEAMS.filter((t) => !t.priority);

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

      {priorityTeams.length ? (
        <div className="space-y-3">
          <p className="font-heading text-xs font-bold uppercase tracking-[0.14em] text-[var(--kelly-official-gold)]">
            Start here tonight
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {priorityTeams.map((team) => (
              <KickoffCard key={team.id} title={team.title} accent>
                <p>{team.blurb}</p>
                {team.recognize ? (
                  <p className="text-sm font-semibold text-[var(--kelly-official-navy)]">
                    Recognize: {team.recognize}
                  </p>
                ) : null}
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--kelly-official-gold)]">
                  Priority opening
                </p>
                {team.id === "grassroots_guitar_strings" ? (
                  <a
                    href={`${KICKOFF_BASE}/join/campaign?team=${GRASSROOTS_GUITAR_STRINGS.joinHrefTeam}`}
                    className="inline-flex pt-1 font-bold text-[var(--kelly-official-navy)] underline-offset-2 hover:underline"
                  >
                    Sign up for Sept 17 planning →
                  </a>
                ) : null}
              </KickoffCard>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {otherTeams.map((team) => (
          <KickoffCard key={team.id} title={team.title}>
            <p>{team.blurb}</p>
            {team.recognize ? (
              <p className="text-sm font-semibold text-[var(--kelly-official-navy)]">
                Recognize: {team.recognize}
              </p>
            ) : null}
          </KickoffCard>
        ))}
      </div>

      <KickoffCtaLink href={`${KICKOFF_BASE}/join/campaign`}>Join a Campaign Team</KickoffCtaLink>
    </SlideFrame>
  );
}
