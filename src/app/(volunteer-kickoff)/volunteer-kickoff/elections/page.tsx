import { KickoffCard, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";

export default function KickoffElectionsPage() {
  return (
    <SlideFrame
      eyebrow="Elections & citizen power"
      title="Secure Elections. Accessible Elections. Local Trust."
      speaker="Kelly"
    >
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        Arkansas county clerks and election commissioners are first-rate public servants. As Secretary of
        State, Kelly’s job is to strengthen systems, support local officials, and ensure every eligible
        Arkansan can participate.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <KickoffCard title="Support Local Election Officials">
          Resources, training, and dependable systems for county clerks and election commissioners.
        </KickoffCard>
        <KickoffCard title="Protect Voter Access">
          Voting should be available and accessible to every eligible citizen.
        </KickoffCard>
        <KickoffCard title="Build Confidence Through Transparency">
          Meet communities with concerns. Show how safeguards work. Address legitimate problems.
        </KickoffCard>
        <KickoffCard title="Defend Citizen Power">
          Protect election access, initiative and referendum, local decision-making, and accountability.
        </KickoffCard>
      </div>
    </SlideFrame>
  );
}
