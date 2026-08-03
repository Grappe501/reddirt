import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import { STRIKE_REGIONS } from "@/content/volunteer-kickoff/roles";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffStrikeTeamPage() {
  return (
    <SlideFrame
      eyebrow="Traveling Strike Teams"
      title="Five Teams. Every Saturday. Communities Across Arkansas."
      speaker="Steve"
    >
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        Each Saturday, a regional Strike Team can deploy to a priority community ahead of an important
        campaign visit—cookout, music, door hangers, canvassing, and volunteer recruitment.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STRIKE_REGIONS.map((region) => (
          <div
            key={region.id}
            className="rounded-[var(--radius-premium)] bg-[var(--kelly-official-navy)] px-4 py-6 text-center font-heading text-lg font-bold text-[var(--kelly-official-gold)]"
          >
            {region.label}
          </div>
        ))}
      </div>

      <KickoffCard title="Goal" accent>
        Five operational Strike Teams by October 1.
      </KickoffCard>

      <KickoffCtaLink href={`${KICKOFF_BASE}/join/campaign?team=strike_team`}>
        Join a Strike Team
      </KickoffCtaLink>
    </SlideFrame>
  );
}
