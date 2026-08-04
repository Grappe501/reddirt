import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import { GRASSROOTS_GUITAR_STRINGS } from "@/content/volunteer-kickoff/calendar";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffEventsPage() {
  return (
    <SlideFrame
      eyebrow="Local event model"
      title="Help Bring the Campaign to Your Community"
      speaker="Steve"
    >
      <div className="rounded-[var(--radius-premium-lg)] border border-[var(--kelly-official-gold)]/50 bg-[var(--kelly-official-navy)] p-6 text-[var(--text-on-navy)] shadow-[var(--shadow-premium-navy)] sm:p-8">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[var(--kelly-official-gold)]">
          Priority rally · {GRASSROOTS_GUITAR_STRINGS.shortDate}
        </p>
        <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
          {GRASSROOTS_GUITAR_STRINGS.title}
        </h2>
        <p className="mt-1 text-lg text-[var(--kelly-official-gold)]">
          {GRASSROOTS_GUITAR_STRINGS.subtitle}
        </p>
        <p className="mt-4 max-w-3xl leading-relaxed text-[var(--text-subtle-on-navy)]">
          Featuring <strong className="text-white">{GRASSROOTS_GUITAR_STRINGS.featuredArtist}</strong> ·{" "}
          {GRASSROOTS_GUITAR_STRINGS.city}, {GRASSROOTS_GUITAR_STRINGS.county} County · Goal:{" "}
          <strong className="text-white">{GRASSROOTS_GUITAR_STRINGS.attendanceGoal} people</strong>
        </p>
        <p className="mt-3 max-w-3xl text-[var(--text-subtle-on-navy)]">
          {GRASSROOTS_GUITAR_STRINGS.detail} Co-chairs: {GRASSROOTS_GUITAR_STRINGS.coChairs.join(" · ")}.
        </p>
        <div className="mt-6">
          <KickoffCtaLink
            href={`${KICKOFF_BASE}/join/campaign?team=${GRASSROOTS_GUITAR_STRINGS.joinHrefTeam}`}
          >
            Join the Planning Team
          </KickoffCtaLink>
        </div>
      </div>

      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        Partner with mayoral, council, JP, clerk, House, and Senate candidates—plus county parties and
        community organizations—to bring Kelly where people already gather.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <KickoffCard title="Local Candidate Rally" accent>
          <p>
            Feature the local candidate. Kelly appears as a guest speaker—rally, meet-and-greet, cookout,
            festival gathering, neighborhood event, or volunteer launch.
          </p>
        </KickoffCard>
        <KickoffCard title="Community Town Hall" accent>
          <p>
            Locally organized conversations focused on community needs. Multiple candidates may join where
            campaign-finance and sponsorship rules permit.
          </p>
        </KickoffCard>
      </div>

      <p>
        Local teams help identify the host, venue, audience, partners, media, and volunteer needs before
        Kelly arrives.
      </p>

      <KickoffCtaLink href={`${KICKOFF_BASE}/join/local?role=event_host`}>Propose an Event</KickoffCtaLink>
    </SlideFrame>
  );
}
