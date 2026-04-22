import { HomeJourneyShell } from "@/components/journey/HomeJourneyShell";
import { HomeGetInvolvedSection } from "@/components/home/sections/HomeGetInvolvedSection";
import { HomeDonateFloatingGate } from "@/components/home/HomeDonateFloatingGate";
import { type MergedHomepageConfig } from "@/lib/content/homepage-merge";

export type HomeExperienceProps = {
  homepage: MergedHomepageConfig;
};

export function HomeExperience({ homepage }: HomeExperienceProps) {
  return (
    <>
      <HomeDonateFloatingGate />
      <HomeJourneyShell
        homepage={homepage}
        afterGateway={
          <div key="home-after-gateway">
            {/* Old `/#hear-kelly` bookmarks land near Step in after the watch strip was removed */}
            <div id="hear-kelly" hidden aria-hidden="true" />
            <section
              id="beat-act"
              data-journey-beat="beat-act"
              className="scroll-mt-[5.5rem] border-t border-civic-ink/[0.06]"
              aria-label="Get involved"
            >
              <HomeGetInvolvedSection />
            </section>
          </div>
        }
      />
    </>
  );
}
