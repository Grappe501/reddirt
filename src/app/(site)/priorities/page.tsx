import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/blocks/CTASection";
import { ContentPendingBadge } from "@/components/content/ContentPendingBadge";
import { pageMeta } from "@/lib/seo/metadata";
import { OFFICE_PRIORITY_FRAMEWORK } from "@/content/website/content-integrity";
import { getHostOrVisitRequestHref } from "@/lib/county/official-links";

export const metadata: Metadata = pageMeta({
  title: "Office priorities",
  description:
    "Framework for Secretary of State priorities—elections, business services, transparency, and civic participation. Detailed positions pending campaign approval.",
  path: "/priorities",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function PrioritiesPage() {
  return (
    <>
      <PageHero
        tone="plan"
        eyebrow="Issues / office priorities"
        title="What this office should deliver for Arkansas"
        subtitle="The Secretary of State administers elections, business filings, public records, and Capitol stewardship—not broad legislative platforms. Detailed policy copy on this page stays in framework form until campaign leadership approves final language."
      >
        <Button href="/understand" variant="primary">
          Understand the office
        </Button>
        <Button href="/about/why-kelly" variant="outlineOnDark">
          Why Kelly
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY aria-labelledby="framework-heading">
        <ContentContainer>
          <SectionHeading
            id="framework-heading"
            eyebrow="Framework"
            title="Office priority areas"
            subtitle="Each section below is a structure only—no invented positions. Campaign-approved detail will replace placeholders."
          />
          <ul className="mt-10 grid list-none gap-5 p-0 md:grid-cols-2">
            {OFFICE_PRIORITY_FRAMEWORK.map((pillar) => (
              <li
                key={pillar.id}
                className="rounded-card border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-heading text-lg font-bold text-kelly-text">{pillar.title}</h3>
                  <ContentPendingBadge />
                </div>
                <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/80">{pillar.body}</p>
                <p className="mt-3 font-body text-xs text-kelly-muted">{pillar.status}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl font-body text-sm text-kelly-muted">
            For neutral explainers of what the office already does today, see{" "}
            <Link href="/office/elections" className="font-semibold text-kelly-navy underline">
              Elections
            </Link>
            ,{" "}
            <Link href="/office/business" className="font-semibold text-kelly-navy underline">
              Business
            </Link>
            ,{" "}
            <Link href="/office/records" className="font-semibold text-kelly-navy underline">
              Records
            </Link>
            , and{" "}
            <Link href="/office/capitol" className="font-semibold text-kelly-navy underline">
              Capitol
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="not-heading">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="not-heading"
            align="left"
            eyebrow="Clarity"
            title="What you will not find here"
            subtitle="Healthcare, K–12 policy, and broad economic platforms belong in races where those decisions are made—not in a constitutional office site."
          />
          <ul className="mt-8 space-y-3 font-body text-base leading-relaxed text-kelly-text/80">
            <li>No pretend authority over issues outside the Secretary of State’s statutory role.</li>
            <li>No unsourced statistics, endorsements, or opponent claims on this page.</li>
            <li>No county visit counts unless tied to verified campaign data with source-aware language.</li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Next step"
        title="Invite Kelly or get involved"
        description="Request a visit, volunteer, or stay connected—real actions only."
        variant="primary-band"
      >
        <Button href={getHostOrVisitRequestHref()} variant="secondary">
          Invite Kelly
        </Button>
        <Button href="/get-involved" variant="outline" className="border-kelly-page/50 text-kelly-page hover:bg-kelly-page/10">
          Get involved
        </Button>
      </CTASection>
    </>
  );
}
