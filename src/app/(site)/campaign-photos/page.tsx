import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import {
  homepagePhotoCountyHref,
  listHomepageCampaignPhotos,
} from "@/content/media/homepage-campaign-photos";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Campaign Photos",
  description:
    "Editorially curated campaign trail photographs for Kelly Grappe — confirmed locations only when known.",
  path: "/campaign-photos",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function CampaignPhotosPage() {
  const photos = listHomepageCampaignPhotos();

  return (
    <>
      <PageHero
        eyebrow="Campaign moments"
        title="Campaign Photos"
        subtitle="A curated set of trail stills — listening, canvassing, and community stops. This is not an unfiltered archive dump."
      >
        <Button href="/about/journey" variant="primary">
          See Kelly Across Arkansas
        </Button>
        <Button href="/about" variant="outline">
          Read Kelly’s Story
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer>
          {photos.length === 0 ? (
            <p className="mx-auto max-w-xl text-center font-body text-kelly-slate">
              Approved campaign photographs will appear here as they are curated.
            </p>
          ) : (
            <ul className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => {
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
                        {placeBits.length > 0 ? placeBits.join(" · ") : "Location pending confirmation"}
                      </p>
                      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-slate">
                        {photo.accessibility.caption}
                      </p>
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
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
