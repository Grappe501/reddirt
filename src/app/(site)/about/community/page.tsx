import type { Metadata } from "next";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { ContentPendingBadge } from "@/components/content/ContentPendingBadge";
import { MeetKellyDirectDemocracyCallout } from "@/components/about/MeetKellyDirectDemocracyCallout";
import { directDemocracyHubHref } from "@/config/direct-democracy-links";
import { meetKellyCommunityCopy } from "@/content/about/meet-kelly-pages";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const c = meetKellyCommunityCopy;

export const metadata: Metadata = pageMeta({
  title: "Community & civic leadership",
  description:
    "Kelly Grappe's community leadership—Stand Up Arkansas, grassroots petition work, and Forevermost Farms. Verified links only; initiative claims await campaign approval.",
  path: "/about/community",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default async function AboutCommunityPage() {
  return (
    <>
      <MediaPageHero
        slotKey="community.hero"
        layout="split"
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        subtitle={c.hero.subtitle}
      >
        <Button href={directDemocracyHubHref} variant="primary">
          Direct democracy hub
        </Button>
        <Button href="/about" variant="outlineOnDark">
          Meet Kelly overview
        </Button>
        <Button href="/about/journey" variant="outlineOnDark">
          Her journey
        </Button>
      </MediaPageHero>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about/community" />
          <div className="mt-10">
            <MeetKellyDirectDemocracyCallout />
          </div>
          <div className="mt-10 space-y-8">
            {c.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-heading text-xl font-bold text-kelly-text">{section.title}</h2>
                  {section.status === "VERIFIED" ? null : <ContentPendingBadge variant="pending" />}
                </div>
                <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/85">{section.body}</p>
                <div className="mt-4">
                  <a
                    href={section.href}
                    target={section.href.startsWith("http") ? "_blank" : undefined}
                    rel={section.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="font-body text-sm font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
                  >
                    {section.hrefLabel} →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
