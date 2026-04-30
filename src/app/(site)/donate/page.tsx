import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { DASS_ARKANSAS_2026 } from "@/config/campaign-partners";
import { siteConfig } from "@/config/site";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Donate",
  description:
    "Giving matters—but people-power comes first. Chip in to help fund travel, materials, voter education, and organizing across all 75 Arkansas counties.",
  path: "/donate",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

const howFunds: string[] = [
  "Miles across Arkansas",
  "Printed materials",
  "Voter education",
  "County organizing",
  "Event support",
  "Digital tools",
  "Video and story production",
  "Follow-up systems",
  "Reaching low-propensity voters",
];

export default function DonatePage() {
  const donate = siteConfig.donateHref;
  const isProcessor = /^https?:\/\//i.test(donate);

  return (
    <>
      <PageHero
        eyebrow="Fund the field"
        title="Donate"
        subtitle="This campaign needs resources because reaching all 75 counties costs real money—travel, materials, voter education, organizing tools, events, digital infrastructure, and follow-up. Giving helps the practical work happen."
      >
        {isProcessor ? (
          <Button href={donate} variant="primary">
            Donate
          </Button>
        ) : (
          <Button href="/get-involved#volunteer" variant="primary">
            Volunteer
          </Button>
        )}
        {isProcessor ? (
          <Button href="/get-involved#volunteer" variant="outline">
            Volunteer
          </Button>
        ) : (
          <Button href="/get-involved" variant="outline">
            Get Involved
          </Button>
        )}
        <Button href="/get-involved/bring-5" variant="outline">
          Bring 5 Friends
        </Button>
      </PageHero>

      <FullBleedSection padY aria-labelledby="why-donate-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="why-donate-heading"
            align="left"
            eyebrow="Why"
            title="Show up everywhere, not just on screens"
            subtitle="We are building a statewide campaign that meets people in their counties—parades, fairs, listening rooms, and neighbor conversations—not only in feeds and inboxes."
          />
          <p className="mt-6 font-body text-base leading-relaxed text-kelly-text/85">
            Money does not replace trust; it helps a trust-first campaign afford to be present where Arkansans already
            gather. That is the honest trade: your contribution helps cover the unglamorous costs that make visibility
            and follow-through possible.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="how-donate-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="how-donate-heading"
            align="left"
            eyebrow="How"
            title="What your gift supports"
            subtitle="No single donation wins or loses a race—campaigns run on repeated, unflashy work. Here is where funding typically goes."
          />
          <ul className="mt-8 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            {howFunds.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 font-body text-sm text-kelly-text/65">
            Schedules and needs shift across the calendar—we are not publishing itemized budgets here, and we are not
            attaching dollar claims we have not verified. Ask the committee or treasurer for formal reporting if you need
            it.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="what-donate-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="what-donate-heading"
            align="left"
            eyebrow="What"
            title="If you are able to give"
            subtitle="We are glad you are here either way."
          />
          <ul className="mt-8 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>Give what you can—there is no “right” amount.</li>
            <li>Monthly help matters when it fits your budget; steady fuel beats one-time spikes for planning.</li>
            <li>Pair a donation with bringing five friends—money plus introductions is how teams scale cleanly.</li>
          </ul>
          <p className="mt-8 font-body text-base leading-relaxed text-kelly-text/85">
            <span className="font-semibold text-kelly-text">Donate is powerful, but people-power is the center.</span> If
            you cannot give right now, volunteer, host a conversation, or walk the{" "}
            <a className="font-semibold text-kelly-navy underline" href="/get-involved/bring-5">
              Bring 5 Friends
            </a>{" "}
            path—you are not a backup plan; you are the point.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="cta-donate-heading">
        <ContentContainer className="max-w-3xl">
          <h2 id="cta-donate-heading" className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
            Ready when you are
          </h2>
          <p className="mt-3 font-body text-sm text-kelly-text/75">
            You will complete a donation on the committee’s secure fundraising page—the same trusted processor linked
            from{" "}
            <a
              className="font-semibold text-kelly-navy underline"
              href="https://www.kellygrappe.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              KellyGrappe.com
            </a>
            .
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {isProcessor ? (
              <Button href={donate} variant="primary" className="min-h-[48px]">
                Donate
              </Button>
            ) : null}
            <Button href="/get-involved#volunteer" variant={isProcessor ? "outline" : "primary"} className="min-h-[48px]">
              Volunteer
            </Button>
            <Button href="/get-involved/bring-5" variant="outline" className="min-h-[48px]">
              Bring 5 Friends
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl rounded-card border border-kelly-text/10 bg-white/60 px-6 py-7 shadow-sm md:px-8">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">National map</p>
          <h2 className="mt-2 font-heading text-lg font-bold text-kelly-text md:text-xl">
            {DASS_ARKANSAS_2026.orgName}
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/80 md:text-base">
            DASS spotlights the Arkansas Secretary of State race on its 2026 state page—useful context for anyone following
            pro-voter, pro-democracy work nationwide.
          </p>
          <a
            href={DASS_ARKANSAS_2026.href}
            className="mt-4 inline-flex font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {DASS_ARKANSAS_2026.linkLabel} (demsofstate.org) ↗
          </a>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-2xl space-y-4 font-body text-base leading-relaxed text-kelly-text/80">
          <p>
            Contributions are processed securely through the same trusted link used on{" "}
            <a
              className="font-semibold text-kelly-navy underline"
              href="https://www.kellygrappe.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              KellyGrappe.com
            </a>
            .
          </p>
          <p className="text-sm text-kelly-text/60">
            Paid for by the committee—details appear in the footer on every page.
          </p>
          <p className="text-sm text-kelly-text/50">{siteConfig.name}</p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
