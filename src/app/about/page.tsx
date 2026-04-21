import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/blocks/CTASection";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "About Kelly",
  description:
    "Kelly Grappe is running for Arkansas Secretary of State to protect public trust—with fair elections, transparent administration, and service that respects every county.",
  path: "/about",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Meet Kelly"
        title="A Secretary of State who serves the people"
        subtitle="This campaign is about public service—not party theater. I’m asking for your trust to administer elections and state systems fairly, clearly, and without favoritism."
      >
        <Button href="/get-involved" variant="primary">
          Get involved
        </Button>
        <Button href="/priorities" variant="outline">
          Office priorities
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY aria-labelledby="about-body">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="about-body"
            align="left"
            eyebrow="Why I’m running"
            title="People over politics. Always."
            subtitle="The Secretary of State’s office touches every voter, business, and community in Arkansas. It should feel steady, accessible, and accountable—no matter your party."
            className="max-w-2xl"
          />
          <div className="mt-10 space-y-6 font-body text-lg leading-relaxed text-deep-soil/85">
            <p>
              Leadership in this role isn’t about headlines or ideology. It’s about doing the detailed work of
              administration: supporting county officials, communicating in plain language, and upholding the law as
              written.
            </p>
            <p>
              I’m a Democrat who believes we earn statewide office by showing up for the whole state—including voters
              who will never agree with me on everything. If you lead a Republican club, a Democratic committee, or a
              civic league and want a substantive conversation about this office, I want to be there.
            </p>
            <p className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 text-base text-deep-soil/80 shadow-[var(--shadow-soft)]">
              Questions? Email{" "}
              <a href="mailto:kelly@kellygrappe.com" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
                kelly@kellygrappe.com
              </a>{" "}
              or reach out through{" "}
              <a href="/get-involved" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
                Get involved
              </a>
              . Press and compliance details will expand here as the committee filing is finalized.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Transparency"
        title="Paid-for-by and compliance"
        description="Election disclaimers, treasurer contact, and filing links belong here for FEC and state compliance—replace placeholders with committee-specific language before launch."
        variant="soil"
      >
        <Button href="/get-involved" variant="primary" className="bg-cream-canvas text-deep-soil hover:bg-cream-canvas/90">
          Contact the campaign
        </Button>
      </CTASection>
    </>
  );
}
