import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Privacy",
  description:
    "How the Kelly Grappe for Arkansas Secretary of State campaign site handles information you share.",
  path: "/privacy",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy"
        subtitle="How we handle information you share through this site. This is not legal advice."
        contentClassName="!pt-6 !pb-8 sm:!pt-8 sm:!pb-10"
      />
      <FullBleedSection padY className="!py-10 sm:!py-14">
        <ContentContainer className="max-w-prose space-y-5 font-body text-base leading-relaxed text-kelly-text/85">
          <p>
            <strong>Status.</strong> The campaign intends to describe what information may be collected through this
            website (for example, when you submit forms, sign up to volunteer, or contact us), how it is used, how long
            it may be kept, and your choices. A complete privacy policy will be posted here when it is ready.
          </p>
          <p>
            <strong>Forms.</strong> Intake is processed through our campaign systems. Do not include sensitive
            information you are not comfortable sharing with the campaign. Commercial automated submissions may be
            discarded.
          </p>
          <p>
            <strong>Updates.</strong> When a final policy is adopted, it will be posted here with an updated effective
            date. Questions may be directed through{" "}
            <a className="font-semibold text-kelly-slate underline" href="/get-involved">
              Get involved
            </a>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
