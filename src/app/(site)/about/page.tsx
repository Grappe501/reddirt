import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { MeetKellyTrustIndicators } from "@/components/about/MeetKellyTrustIndicators";
import { aboutLaunchCopy } from "@/content/about/about-launch";
import { getHomepageMeetKellyPhoto, homepagePhotoCountyHref, homepagePhotoObjectPositionClass } from "@/content/media/homepage-campaign-photos";
import { listHomepageAcrossArkansasPhotos } from "@/content/media/homepage-campaign-photos";
import { getVolunteerSignupHref } from "@/config/external-campaign";
import { pageMeta } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const c = aboutLaunchCopy;

export const metadata: Metadata = pageMeta({
  title: "Meet Kelly Grappe",
  description:
    "Kelly Grappe for Arkansas Secretary of State — relevant experience, leadership in practice, and why she seeks this office.",
  path: "/about",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function AboutPage() {
  const meetPhoto = getHomepageMeetKellyPhoto();
  const trailPhotos = listHomepageAcrossArkansasPhotos().slice(0, 4);
  const joinHref = getVolunteerSignupHref();
  const countyHref = meetPhoto ? homepagePhotoCountyHref(meetPhoto) : null;

  return (
    <>
      <PageHero eyebrow={c.hero.eyebrow} title={c.hero.title} subtitle={c.hero.subtitle}>
        <Button href="/priorities" variant="primary">
          Explore Kelly’s Priorities
        </Button>
        <Button href="/about/journey" variant="outline">
          See Kelly Across Arkansas
        </Button>
        <Button href={joinHref} variant="outline">
          Join the Campaign
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" className="!py-6">
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about" />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{c.opening.title}</h2>
          {c.opening.body.map((para) => (
            <p key={para.slice(0, 48)} className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">
              {para}
            </p>
          ))}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
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
              <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{c.experience.title}</h2>
              <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate">{c.experience.intro}</p>
              <div className="mt-8 space-y-8">
                {c.experience.items.map((section) => (
                  <article key={section.title}>
                    <h3 className="font-heading text-xl font-bold text-kelly-navy">{section.title}</h3>
                    <p className="mt-3 font-body text-base leading-relaxed text-kelly-slate">{section.body}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="font-body text-sm font-semibold text-kelly-blue underline decoration-kelly-blue/25 underline-offset-4 hover:decoration-kelly-blue"
                          >
                            {link.label} →
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
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
        <ContentContainer>
          <h2 className="mx-auto max-w-3xl text-center font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {c.leadership.title}
          </h2>
          <ul className="mx-auto mt-10 grid max-w-5xl list-none gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.leadership.items.map((item) => (
              <li key={item.title} className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
                <h3 className="font-heading text-lg font-bold text-kelly-navy">{item.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">{item.body}</p>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{c.acrossArkansas.title}</h2>
            <p className="mt-4 font-body text-lg text-kelly-slate">{c.acrossArkansas.intro}</p>
          </div>
          {trailPhotos.length > 0 ? (
            <ul className="mt-10 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trailPhotos.map((photo) => {
                const href = homepagePhotoCountyHref(photo);
                const place =
                  photo.campaign.city !== "Unknown"
                    ? `${photo.campaign.city}${photo.campaign.county !== "Unknown" ? ` · ${photo.campaign.county} County` : ""}`
                    : photo.campaign.county !== "Unknown"
                      ? `${photo.campaign.county} County`
                      : "Location pending confirmation";
                return (
                  <li key={photo.id} className="overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-sm">
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={photo.src}
                        alt={photo.accessibility.altText}
                        width={photo.basic.width ?? 768}
                        height={photo.basic.height ?? 1024}
                        className={cn("h-full w-full object-cover", homepagePhotoObjectPositionClass(photo))}
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-3">
                      <p className="font-body text-[11px] font-bold uppercase tracking-wide text-kelly-gold">{place}</p>
                      <p className="font-body text-xs leading-relaxed text-kelly-slate">{photo.accessibility.caption}</p>
                      {href ? (
                        <Link href={href} className="mt-2 inline-flex text-xs font-bold text-kelly-blue underline-offset-2 hover:underline">
                          {photo.campaign.county} County →
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href={c.acrossArkansas.cta.href} variant="primary">
              {c.acrossArkansas.cta.label}
            </Button>
            <Button href={c.acrossArkansas.photosCta.href} variant="outline">
              {c.acrossArkansas.photosCta.label}
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{c.bringToOffice.title}</h2>
          <ul className="mt-8 space-y-6">
            {c.bringToOffice.items.map((item) => (
              <li key={item.title}>
                <h3 className="font-heading text-xl font-bold text-kelly-navy">{item.title}</h3>
                <p className="mt-2 font-body text-base leading-relaxed text-kelly-slate">{item.body}</p>
              </li>
            ))}
          </ul>
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
                variant={cta.href === "/get-involved" || cta.href === "/priorities" ? "primary" : "outline"}
                className={
                  cta.href === "/get-involved" || cta.href === "/priorities"
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
