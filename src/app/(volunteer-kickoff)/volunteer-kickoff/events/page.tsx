import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffEventsPage() {
  return (
    <SlideFrame
      eyebrow="Local event model"
      title="Help Bring the Campaign to Your Community"
      speaker="Steve"
    >
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
