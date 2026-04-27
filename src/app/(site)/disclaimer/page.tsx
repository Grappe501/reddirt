import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { pageMeta } from "@/lib/seo/metadata";
import { CAMPAIGN_POLICY_V1 } from "@/lib/campaign-engine/policy";

export const metadata: Metadata = pageMeta({
  title: "Disclaimer",
  description:
    "Campaign disclaimer: not the official Secretary of State site, not legal advice, and paid-for information.",
  path: "/disclaimer",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function DisclaimerPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Disclaimer"
        subtitle="This is a campaign website, not a government agency site."
      />
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl space-y-6 font-body text-base leading-relaxed text-kelly-text/85">
          <p>
            <strong>Not a government site.</strong> This site is paid for and operated by the Kelly Grappe for
            Secretary of State campaign. It is not the website of the Arkansas Secretary of State’s office, the
            State of Arkansas, or any public agency unless explicitly stated in a specific document.
          </p>
          <p>
            <strong>Paid for.</strong> {CAMPAIGN_POLICY_V1.disclaimers.pageFooterPaidForLine}. Additional FEC-style
            disclosures may appear on individual pages, mailers, or ads as required.
          </p>
          <p>
            <strong>Not legal advice.</strong> Nothing here is legal advice. For election rules, filing deadlines, and
            official forms, use the current publications of the{" "}
            <a
              className="font-semibold text-kelly-slate underline"
              href="https://www.sos.arkansas.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Arkansas Secretary of State
            </a>{" "}
            and other official sources.
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
