import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Campaign updates",
  description:
    "Where to find official Kelly Grappe campaign updates, trail notes, press coverage, and events — without filler cards.",
  path: "/updates",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

const channels = [
  {
    title: "From the Road",
    body: "Campaign-authored trail notes and field posts when verified and published.",
    href: "/from-the-road",
    label: "Read trail updates",
    kind: "Campaign-authored",
  },
  {
    title: "Press coverage",
    body: "External press and coverage collected for the public site — clearly separate from campaign-authored posts.",
    href: "/press-coverage",
    label: "View press coverage",
    kind: "External press",
  },
  {
    title: "Events",
    body: "Published campaign events only — verified before they appear on the calendar.",
    href: "/events",
    label: "Events calendar",
    kind: "Event listings",
  },
  {
    title: "Kelly’s Substack",
    body: "Longer written updates from the campaign when published on Substack.",
    href: "https://kellygrappesos.substack.com",
    label: "Read the Campaign Update",
    kind: "Campaign-authored",
    external: true,
  },
] as const;

export default function CampaignUpdatesPage() {
  return (
    <>
      <PageHero
        eyebrow="News · Official"
        title="Campaign Updates"
        subtitle="A durable map to real updates. We would rather show one substantial channel than invent filler cards."
      >
        <Button href="/from-the-road" variant="primary">
          From the Road
        </Button>
        <Button href="/press-coverage" variant="outline">
          Press coverage
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer>
          <p className="mx-auto max-w-3xl font-body text-base leading-relaxed text-kelly-slate">
            This page does not fabricate announcements. Use the channels below for campaign-authored updates, external
            press, and event listings. When a single featured campaign update is curated for this surface, it will appear
            here with title, date, summary, and next action.
          </p>
          <ul className="mx-auto mt-10 grid max-w-4xl list-none gap-5 md:grid-cols-2">
            {channels.map((channel) => (
              <li key={channel.href} className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
                <p className="font-body text-[11px] font-bold uppercase tracking-wide text-kelly-gold">{channel.kind}</p>
                <h2 className="mt-2 font-heading text-xl font-bold text-kelly-ink">{channel.title}</h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">{channel.body}</p>
                {"external" in channel && channel.external ? (
                  <a
                    href={channel.href}
                    className="mt-4 inline-flex text-sm font-bold text-kelly-blue underline-offset-4 hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {channel.label} →
                  </a>
                ) : (
                  <Link
                    href={channel.href}
                    className="mt-4 inline-flex text-sm font-bold text-kelly-blue underline-offset-4 hover:underline"
                  >
                    {channel.label} →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
