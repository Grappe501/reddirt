import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { BIOGRAPHY_CHAPTERS } from "@/content/biography/biography-config";
import { BiographyPillarSection } from "@/components/biography/BiographyPillarSection";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Biography — Kelly Grappe",
  description:
    "Literary biography in chapters—formation, leadership and family, grassroots Arkansas, and systems that earn trust—each pillar opens into full manuscript deep dives.",
  path: "/biography",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function BiographyHubPage() {
  return (
    <>
      <PageHero
        eyebrow="Long-form story"
        title="Biography"
        subtitle="Four narrative arcs organize the mini-novel—tap a pillar for scope, then read straight through with chapter links below."
      >
        <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-kelly-text/20 px-5 py-2 text-sm font-semibold text-kelly-text hover:bg-kelly-text/5">
          Meet Kelly overview
        </Link>
      </PageHero>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <BiographyPillarSection variant="hub" />

          <h2 className="font-heading mt-12 text-xl font-bold text-kelly-text md:text-2xl">Full manuscript — chapter navigation</h2>
          <p className="mt-2 font-body text-sm text-kelly-text/75">
            Deep dives are gated for rollout; links remain the stable reading order.
          </p>

          <ol className="mt-6 list-decimal space-y-4 pl-6 font-body text-kelly-text/90">
            {BIOGRAPHY_CHAPTERS.map((c) => (
              <li key={c.slug}>
                <Link href={`/about/deep-dive/${c.slug}`} className="font-semibold text-kelly-text underline-offset-4 hover:underline">
                  {c.shortTitle ?? c.title}
                </Link>
              </li>
            ))}
          </ol>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
