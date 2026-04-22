import { siteConfig } from "@/config/site";
import { type MergedHomepageConfig } from "@/lib/content/homepage-merge";
import { HomeJourneyShell } from "@/components/journey/HomeJourneyShell";
import { JourneyBeat } from "@/components/journey/JourneyBeat";
import { HomeGetInvolvedSection } from "@/components/home/sections/HomeGetInvolvedSection";
import { HomeClosingSection } from "@/components/home/sections/HomeClosingSection";
import { HomeWatchPreviewStrip } from "@/components/home/sections/HomeWatchPreviewStrip";
import { HomeDonateFloatingGate } from "@/components/home/HomeDonateFloatingGate";

export type HomeExperienceProps = {
  homepage: MergedHomepageConfig;
};

export function HomeExperience({ homepage }: HomeExperienceProps) {
  const { finalCta } = homepage;
  const closingDonateHref = finalCta.secondaryHref === "/donate" ? siteConfig.donateHref : finalCta.secondaryHref;

  return (
    <>
      <HomeDonateFloatingGate />
      <HomeJourneyShell homepage={homepage}>
        <JourneyBeat
          id="beat-act"
          variant="mist"
          lead={
            <>
              <p className="text-center font-body text-[11px] font-bold uppercase tracking-[0.26em] text-civic-blue">Your move</p>
              <h2 className="mt-4 text-center font-heading text-[clamp(1.65rem,3vw,2.35rem)] font-bold text-civic-ink">
                Help, give, or keep learning—your lane matters
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center font-body text-lg text-civic-slate">
                Pick what fits your life. Every button leads somewhere real.
              </p>
            </>
          }
        >
          <HomeWatchPreviewStrip />
          <HomeGetInvolvedSection />
          <HomeClosingSection
            eyebrow={finalCta.eyebrow}
            title={finalCta.title}
            description={finalCta.description}
            primaryLabel={finalCta.primaryLabel}
            primaryHref={finalCta.primaryHref}
            secondaryLabel={finalCta.secondaryLabel}
            secondaryHref={closingDonateHref}
          />
        </JourneyBeat>
      </HomeJourneyShell>
    </>
  );
}
