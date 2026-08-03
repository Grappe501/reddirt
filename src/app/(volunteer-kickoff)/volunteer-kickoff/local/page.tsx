import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import { LOCAL_ROLES } from "@/content/volunteer-kickoff/roles";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffLocalPage() {
  return (
    <SlideFrame
      eyebrow="Local involvement"
      title="Build the Campaign Where You Live"
      speaker="Carol Egan"
    >
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        Local volunteers focus on their own city, county, campus, or region—working with leaders like Sue
        Farris to grow county organizations, voter registration, and local engagement.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LOCAL_ROLES.map((role) => (
          <KickoffCard key={role.id} title={role.title}>
            {role.blurb}
          </KickoffCard>
        ))}
      </div>

      <KickoffCtaLink href={`${KICKOFF_BASE}/join/local`}>Join My Local Team</KickoffCtaLink>
    </SlideFrame>
  );
}
