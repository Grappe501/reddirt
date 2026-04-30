import type { Metadata } from "next";
import Link from "next/link";
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
    "Clear, honest ask—running statewide takes real resources. Give what you can, or volunteer and Bring 5. No guilt.",
  path: "/donate",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

const howFunds: string[] = ["Travel", "Materials", "Voter education", "Organizing", "Digital tools"];

export default function DonatePage() {
  const donate = siteConfig.donateHref;
  const isProcessor = /^https?:\/\//i.test(donate);

  return (
    <>
      <PageHero
        eyebrow="Support the campaign"
        title="Donate"
        subtitle="A clear, honest ask: running statewide requires real resources. If giving fits your budget, it helps the practical work—alongside neighbors who volunteer and bring five."
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
          Bring 5
        </Button>
      </PageHero>

      <FullBleedSection padY aria-labelledby="why-donate-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="why-donate-heading"
            align="left"
            eyebrow="Why"
            title="Running statewide requires real resources"
            subtitle="Seventy-five counties, field time, and voter education do not run on goodwill alone—money covers the plain costs so people can show up."
          />
          <p className="mt-6 font-body text-base leading-relaxed text-kelly-text/85">
            Giving never replaces trust; it helps pay for gas, print, tools, and staff time so the campaign can be present
            where Arkansans already gather.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="how-donate-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="how-donate-heading"
            align="left"
            eyebrow="How"
            title="Funds support"
            subtitle="Big picture—line items change with the calendar; we are not posting dollar figures we have not verified."
          />
          <ul className="mt-8 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            {howFunds.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 font-body text-sm text-kelly-text/65">
            For itemized or treasurer reporting, contact the committee—this page stays general on purpose.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="what-donate-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="what-donate-heading"
            align="left"
            eyebrow="What"
            title="If you give"
            subtitle="No “right” amount—only what fits."
          />
          <ul className="mt-8 list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
            <li>Give what you can.</li>
            <li>Monthly helps when it works for you—steady beats one-off spikes for planning.</li>
            <li>
              Pair your gift with{" "}
              <Link className="font-semibold text-kelly-navy underline" href="/get-involved/bring-5">
                Bring 5
              </Link>{" "}
              — money plus introductions scales the right way.
            </li>
          </ul>
          <p className="mt-8 font-body text-base leading-relaxed text-kelly-text/85">
            <span className="font-semibold text-kelly-text">If you cannot give, volunteer or bring five.</span>{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/get-involved#volunteer">
              Volunteer
            </Link>
            {" · "}
            <Link className="font-semibold text-kelly-navy underline" href="/get-involved/bring-5">
              Bring 5
            </Link>
            — you are not a backup; you are how counties move.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="cta-donate-heading">
        <ContentContainer className="max-w-3xl">
          <h2 id="cta-donate-heading" className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
            Take the next step
          </h2>
          <p className="mt-3 font-body text-sm text-kelly-text/75">
            Donations go through the committee’s secure page—the same processor linked from{" "}
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
              Bring 5
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
