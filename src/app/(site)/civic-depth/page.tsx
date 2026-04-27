import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { CivicBeatSections } from "@/components/home/CivicBeatSections";
import { JourneyBeat } from "@/components/journey/JourneyBeat";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { pageMeta } from "@/lib/seo/metadata";
import { EditorialCampaignPhoto } from "@/components/about/EditorialCampaignPhoto";
import { trailPhotosForSlot } from "@/content/media/campaign-trail-assignments";

export const metadata: Metadata = pageMeta({
  title: "Civic depth",
  description:
    "Ballot access, proof of organization, and partnerships with schools and the Arkansas Education Association to strengthen civic education and voter resources—grounded in what the Secretary of State’s office can support.",
  path: "/civic-depth",
});

export default async function CivicDepthPage() {
  const homepage = await getMergedHomepageConfig();
  const [civicTrail] = trailPhotosForSlot("civicDepth");

  return (
    <>
      <PageHero
        eyebrow="Civic depth"
        title="Democracy tools and proof of organization"
        subtitle="Drill into ballot access and the systems that should serve every county—and how this campaign explains the office in plain language."
      />

      {civicTrail ? (
        <FullBleedSection variant="subtle" className="!pt-0" aria-label="Campaign trail photography">
          <ContentContainer wide className="py-8 md:py-10">
            <EditorialCampaignPhoto
              variant="breakout"
              photo={civicTrail}
              kicker="Civic Arkansas"
              caption="Democracy isn’t only the ballot box—it’s classrooms, breakrooms, and county lines where people learn the process together."
            />
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <FullBleedSection variant="subtle" padY aria-labelledby="participation-initiative-heading">
        <ContentContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="font-body text-xs font-bold uppercase text-kelly-navy">Future office vision</p>
              <h2
                id="participation-initiative-heading"
                className="mt-3 font-heading text-2xl font-bold text-kelly-text md:text-3xl"
              >
                Arkansas Civic Participation Initiative
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/75">
                The Secretary of State’s office should not only process elections. It should help build a culture
                of participation: practical, nonpartisan, local, and easy to understand.
              </p>
              <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/75">
                That includes working with the Arkansas Education Association and Arkansas’s public school community to
                put stronger civic learning alongside trusted voter resources—using the State Capitol, when law and
                schedules allow, as a public place to welcome young people into the process: how elections work, how
                to register, and how to make a plan to vote. Educators set instruction; the office can help with clarity
                and access.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              <article className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-kelly-text">AEA, schools, and community partners</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">
                  Colleges, libraries, the Arkansas Education Association, public school leaders, and local hosts can help
                  turn public information into real participation and earlier civic connection for students.
                </p>
              </article>
              <article className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-kelly-text">Voter education that travels</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">
                  Clear resources should explain registration, ballot questions, results, audits, and where official
                  answers live.
                </p>
              </article>
              <article className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-kelly-text">Arkansas history as the anchor</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">
                  Civic education should draw from the Arkansas Constitution, direct-democracy history, public archives,
                  civil-rights history, and rural organizing traditions.
                </p>
              </article>
              <article className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-kelly-text">Election service pipeline</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">
                  Civic education should connect willing Arkansans to volunteer roles, poll worker pathways, and
                  respectful local service.
                </p>
              </article>
              <article className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-kelly-text">Voluntary civic challenges</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">
                  Campuses, counties, and community groups could opt into positive participation challenges that reward
                  registration checks, voter plans, and local civic service.
                </p>
              </article>
              <article className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-kelly-text">Leadership development</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">
                  Future voters, candidates, election workers, and community educators all need a front door into the
                  process.
                </p>
              </article>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <JourneyBeat id="civic-spine" variant="light" className="scroll-mt-24 border-t-0 !py-6 lg:!py-10">
        <CivicBeatSections homepage={homepage} />
      </JourneyBeat>
    </>
  );
}
