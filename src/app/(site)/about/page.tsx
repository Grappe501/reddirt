import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { MeetKellyTrustIndicators } from "@/components/about/MeetKellyTrustIndicators";
import { aboutLaunchCopy } from "@/content/about/about-launch";
import {
  getHomepageMeetKellyPhoto,
  homepagePhotoCountyHref,
  homepagePhotoObjectPositionClass,
} from "@/content/media/homepage-campaign-photos";
import { getJoinCampaignHref, getVolunteerSignupHref } from "@/config/external-campaign";
import { pageMeta } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const c = aboutLaunchCopy;

export const metadata: Metadata = pageMeta({
  title: "Meet Kelly Grappe",
  description:
    "Kelly Grappe for Arkansas Secretary of State — operations leadership, rural Arkansas, family, and why she is running.",
  path: "/about",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

function ProseBlock({ title, paragraphs }: { title: string; paragraphs: readonly string[] }) {
  return (
    <>
      <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{title}</h2>
      {paragraphs.map((para) => (
        <p key={para.slice(0, 56)} className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">
          {para}
        </p>
      ))}
    </>
  );
}

export default async function AboutPage() {
  const meetPhoto = getHomepageMeetKellyPhoto();
  const joinHref = getJoinCampaignHref();
  const volunteerHref = getVolunteerSignupHref();
  const countyHref = meetPhoto ? homepagePhotoCountyHref(meetPhoto) : null;

  return (
    <>
      <MediaPageHero
        slotKey="about.hero"
        layout="split"
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        subtitle={c.hero.subtitle}
      >
        <Button href="/priorities" variant="primary">
          See My Plan
        </Button>
        <Button href="/about/why-im-running" variant="outlineOnDark">
          Why I’m running
        </Button>
        <Button href={joinHref} variant="outlineOnDark">
          Get Involved
        </Button>
        <Button href={volunteerHref} variant="outlineOnDark">
          Volunteer
        </Button>
      </MediaPageHero>

      <FullBleedSection variant="subtle" className="!py-6">
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about" />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
            {meetPhoto ? (
              <figure className="overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-sm">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={meetPhoto.src}
                    alt={meetPhoto.accessibility.altText}
                    width={meetPhoto.basic.width ?? 768}
                    height={meetPhoto.basic.height ?? 1024}
                    className={cn("h-full w-full object-cover", homepagePhotoObjectPositionClass(meetPhoto))}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
                <figcaption className="border-t border-kelly-ink/10 px-4 py-3.5 font-body text-sm leading-relaxed text-kelly-slate">
                  {meetPhoto.accessibility.caption}
                  {countyHref ? (
                    <>
                      {" "}
                      <Link href={countyHref} className="font-bold text-kelly-blue underline-offset-4 hover:underline">
                        {meetPhoto.campaign.county} County
                      </Link>
                    </>
                  ) : null}
                </figcaption>
              </figure>
            ) : null}

            <div>
              <ProseBlock title={c.opening.title} paragraphs={c.opening.body} />
              <div className="mt-8">
                <Button href={c.experienceCta.href} variant="primary">
                  {c.experienceCta.label}
                </Button>
              </div>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <ProseBlock title={c.family.title} paragraphs={c.family.paragraphs} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <ProseBlock title={c.familyPath.title} paragraphs={c.familyPath.paragraphs} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <ProseBlock title={c.rural.title} paragraphs={c.rural.paragraphs} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{c.whySos.title}</h2>
          {c.whySos.body.map((para) => (
            <p key={para.slice(0, 40)} className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">
              {para}
            </p>
          ))}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={c.whySos.cta.href} variant="primary">
              {c.whySos.cta.label}
            </Button>
            <Button href={c.whySos.officeCta.href} variant="outline">
              {c.whySos.officeCta.label}
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{c.acrossArkansas.title}</h2>
          <p className="mt-4 font-body text-lg text-kelly-slate">{c.acrossArkansas.intro}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={c.acrossArkansas.cta.href} variant="primary">
              {c.acrossArkansas.cta.label}
            </Button>
            <Button href={c.acrossArkansas.photosCta.href} variant="outline">
              {c.acrossArkansas.photosCta.label}
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer wide>
          <div className="mx-auto max-w-4xl">
            <MeetKellyTrustIndicators />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="primary-band" padY>
        <ContentContainer className="max-w-3xl text-center text-white">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">{c.closing.title}</h2>
          <p className="mt-4 font-body text-lg text-white/90">{c.closing.body}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            {c.closing.ctas.map((cta) => (
              <Button
                key={cta.href}
                href={cta.href === "/get-involved" ? joinHref : cta.href}
                variant={cta.href === "/priorities" ? "primary" : "outline"}
                className={
                  cta.href === "/priorities"
                    ? "bg-kelly-gold text-kelly-navy hover:bg-kelly-gold-soft"
                    : "border-white/40 text-white hover:bg-white/10"
                }
              >
                {cta.label}
              </Button>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
