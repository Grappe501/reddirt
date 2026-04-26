import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Privacy",
  description:
    "How the Kelly Grappe for Arkansas Secretary of State campaign site handles information you share—draft for counsel review.",
  path: "/privacy",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal · draft"
        title="Privacy"
        subtitle="This page is a public-facing structure for campaign counsel to finalize. Do not treat it as legal advice."
      />
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl space-y-6 font-body text-base leading-relaxed text-deep-soil/85">
          <p>
            <strong>Status.</strong> The campaign intends to describe what information may be collected through this
            website (for example, when you submit forms, sign up to volunteer, or contact us), how it is used, how long
            it may be kept, and your choices. Exact language requires review and approval by{" "}
            <strong>campaign counsel</strong> and the <strong>treasurer</strong>.
          </p>
          <p>
            <strong>Forms.</strong> Intake is processed through our campaign systems. Do not include sensitive
            information you are not comfortable sharing with the campaign. Commercial automated submissions may be
            discarded.
          </p>
          <p>
            <strong>Updates.</strong> When a final policy is adopted, it will be posted here with an updated effective
            date. Questions may be directed through{" "}
            <a className="font-semibold text-civic-slate underline" href="/get-involved">
              Get involved
            </a>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
