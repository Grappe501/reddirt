import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffYouthPage() {
  return (
    <SlideFrame
      eyebrow="Arkansas Youth Coalition"
      title="Building the Next Generation of Arkansas Leadership"
      speaker="Chance Bradford"
    >
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        Young Arkansans ages 16–24 organizing for civic engagement, voter registration, campus and
        community presence, and direct interaction with policymakers.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <KickoffCard title="Friday — Arkadelphia Retreat">
          Leadership and organizing retreat for young Arkansans.
        </KickoffCard>
        <KickoffCard title="Saturday Morning — Hope">
          Hope Watermelon Festival: festival work, voter engagement, bright green shirts.
        </KickoffCard>
        <KickoffCard title="Saturday Evening — Clark County">
          Clinton Day Dinner: navigate a political gathering and build relationships.
        </KickoffCard>
      </div>

      <KickoffCard title="Special thanks">
        <p>
          <strong>Dr. Judy Harrison</strong> and <strong>Kevin Heifner</strong> — for making the
          Arkadelphia retreat possible.
        </p>
      </KickoffCard>

      <div className="flex flex-wrap gap-3">
        <KickoffCtaLink href={`${KICKOFF_BASE}/join/youth`}>Join the Youth Coalition</KickoffCtaLink>
        <KickoffCtaLink href={`${KICKOFF_BASE}/join/youth?intent=refer`} variant="secondary">
          Refer a Young Person
        </KickoffCtaLink>
        <KickoffCtaLink href={`${KICKOFF_BASE}/join/youth?intent=help`} variant="outline">
          Help the Youth Coalition
        </KickoffCtaLink>
      </div>
    </SlideFrame>
  );
}
