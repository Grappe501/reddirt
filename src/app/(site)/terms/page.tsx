import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Terms of use",
  description:
    "Terms for using the Kelly Grappe for Arkansas Secretary of State campaign website—draft for counsel review.",
  path: "/terms",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal · draft"
        title="Terms of use"
        subtitle="A placeholder structure for how visitors may use this site. Counsel review is required before relying on this text."
      />
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl space-y-6 font-body text-base leading-relaxed text-kelly-text/85">
          <p>
            <strong>Status.</strong> The campaign will publish full terms of use after review. In general, you agree
            to use the site lawfully, not to attempt to disrupt it, and not to misrepresent your identity on forms or
            in messages.
          </p>
          <p>
            <strong>No warranty.</strong> Public information is provided for voter education. It is not a substitute
            for official Secretary of State materials, the Arkansas code, or advice from a lawyer.
          </p>
          <p>
            <strong>Changes.</strong> Terms may be updated; the current version will remain on this page with a
            revision note when final.
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
