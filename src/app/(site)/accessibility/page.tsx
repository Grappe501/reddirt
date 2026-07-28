import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Accessibility",
  description:
    "Accessibility commitments for the Kelly Grappe for Secretary of State campaign website.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Access"
        title="Accessibility"
        subtitle="This campaign website should be usable by as many Arkansans as possible — including people who use keyboards, screen readers, or reduced-motion preferences."
      />
      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl space-y-6 font-body text-base leading-relaxed text-kelly-slate">
          <p>
            We design public pages with clear headings, visible focus states, click-to-play video (no autoplay of campaign
            statements), and text alternatives for photographs. Transcripts are published when reviewed and ready.
          </p>
          <p>
            If you encounter a barrier on this site, email{" "}
            <a className="font-semibold text-kelly-navy underline" href="mailto:kelly@kellygrappe.com">
              kelly@kellygrappe.com
            </a>{" "}
            with the page URL and a short description. We will work to fix it.
          </p>
          <p>
            Official election and registration services are provided by the State of Arkansas and county clerks—not by
            this campaign. Start at{" "}
            <Link href="/voter-registration" className="font-semibold text-kelly-navy underline">
              voter registration resources
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
