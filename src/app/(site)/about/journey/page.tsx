import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { CampaignVideoFeature } from "@/components/media/CampaignVideoFeature";
import { acrossArkansasJourneyCopy } from "@/content/about/across-arkansas-journey";
import {
  homepagePhotoCountyHref,
  listHomepageAcrossArkansasPhotos,
  listHomepageCampaignPhotos,
} from "@/content/media/homepage-campaign-photos";
import { getHomepageAcrossArkansasVideo } from "@/content/media/homepage-campaign-videos";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const c = acrossArkansasJourneyCopy;

export const metadata: Metadata = pageMeta({
  title: "Kelly Across Arkansas",
  description:
    "Campaign trail evidence for Kelly Grappe — featured video, confirmed photography, and invitations to meet or invite Kelly. No invented county coverage.",
  path: "/about/journey",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default async function AboutJourneyPage() {
  const video = getHomepageAcrossArkansasVideo();
  const stills = listHomepageAcrossArkansasPhotos();
  const morePhotos = listHomepageCampaignPhotos().filter((p) => !stills.some((s) => s.id === p.id)).slice(0, 3);

  return (
    <>
      <MediaPageHero
        slotKey="journey.hero"
        layout="bleed"
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        subtitle={c.hero.subtitle}
      >
        <Button href="/about" variant="outlineOnDark">
          Read About Kelly’s Experience
        </Button>
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
      </MediaPageHero>

      <FullBleedSection variant="subtle" className="!py-6">
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about/journey" />
          <p className="mt-8 font-body text-lg leading-relaxed text-kelly-slate">{c.intro}</p>
          <p className="mt-6 font-body text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-gold">
            {c.evidenceVerbs.join(" · ")}
          </p>
        </ContentContainer>
      </FullBleedSection>

      {video ? (
        <FullBleedSection padY>
          <ContentContainer>
            <CampaignVideoFeature
              media={video}
              eyebrow="Featured trail story"
              introduction={c.videoIntroduction}
              headingId="journey-video-heading"
              preferShortTitle
            />
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <FullBleedSection variant="subtle" padY>
        <ContentContainer>
          <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{c.photographyHeading}</h2>
          <p className="mt-3 max-w-3xl font-body text-kelly-slate">{c.photographyIntro}</p>
          <ul className="mt-10 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...stills, ...morePhotos].map((photo) => {
              const href = homepagePhotoCountyHref(photo);
              const placeBits = [
                photo.campaign.city !== "Unknown" ? photo.campaign.city : null,
                photo.campaign.county !== "Unknown" ? `${photo.campaign.county} County` : null,
              ].filter(Boolean);
              return (
                <li key={photo.id} className="flex flex-col overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-sm">
                  <div className="relative aspect-[4/5] bg-kelly-fog">
                    <Image
                      src={photo.src}
                      alt={photo.accessibility.altText}
                      width={photo.basic.width ?? 768}
                      height={photo.basic.height ?? 1024}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="font-body text-[11px] font-bold uppercase tracking-wide text-kelly-gold">
                      {placeBits.length > 0 ? placeBits.join(" · ") : "From the trail"}
                    </p>
                    <p className="mt-2 font-body text-sm text-kelly-slate">{photo.accessibility.caption}</p>
                    {href ? (
                      <Link
                        href={href}
                        className="mt-auto pt-3 text-sm font-bold text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 hover:decoration-kelly-blue"
                      >
                        {photo.campaign.county} County →
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{c.invite.title}</h2>
          <p className="mt-4 font-body text-lg text-kelly-slate">{c.invite.body}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={c.invite.primary.href} variant="primary">
              {c.invite.primary.label}
            </Button>
            <Button href={c.invite.secondary.href} variant="outline">
              {c.invite.secondary.label}
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink">{c.closing.title}</h2>
          <p className="mt-4 font-body text-kelly-slate">{c.closing.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {c.closing.ctas.map((cta) => (
              <Button key={cta.href} href={cta.href} variant="outline">
                {cta.label}
              </Button>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
