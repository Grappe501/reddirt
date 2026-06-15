import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolvePublicEventPageBySlug, resolvePublicEventTitleForMetadata } from "@/lib/calendar/public-events";
import { resolveCampaignEventBriefing } from "@/lib/calendar/load-campaign-event-briefing";
import { formatPublicEventWhenRange } from "@/lib/calendar/public-event-format";
import { CampaignEventBriefingView } from "@/components/calendar/CampaignEventBriefingView";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { pageMeta } from "@/lib/seo/metadata";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { siteConfig } from "@/config/site";
import { isPrismaDatabaseUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const t = await resolvePublicEventTitleForMetadata(slug);
    if (!t) return { title: "Event" };
    return pageMeta({
      title: t,
      description: `Field briefing · ${siteConfig.shortName} campaign calendar — who, what, when, where, and why.`,
      path: `/campaign-calendar/${slug}`,
    });
  } catch (e) {
    if (isPrismaDatabaseUnavailable(e)) return { title: "Campaign calendar" };
    throw e;
  }
}

export default async function CampaignCalendarDetailPage({ params }: Props) {
  const { slug } = await params;
  let r: Awaited<ReturnType<typeof resolvePublicEventPageBySlug>>;
  try {
    r = await resolvePublicEventPageBySlug(slug);
  } catch (e) {
    if (!isPrismaDatabaseUnavailable(e)) throw e;
    logPrismaDatabaseUnavailable("campaign-calendar/[slug]/resolvePublicEventPageBySlug", e);
    return (
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl">
          <h1 className="font-heading text-2xl font-bold text-kelly-text">Calendar temporarily unavailable</h1>
          <p className="mt-2 font-body text-kelly-text/80">
            This calendar can&apos;t load right now—please try again in a moment. If you&apos;re on the campaign team, confirm the
            live events service is available, then refresh.
          </p>
          <Link href="/campaign-calendar" className="mt-6 inline-block font-semibold text-kelly-navy underline">
            ← Back to calendar
          </Link>
        </ContentContainer>
      </FullBleedSection>
    );
  }
  if (!r) notFound();
  const join = getJoinCampaignHref();

  if (r.kind === "canceled") {
    return (
      <>
        <FullBleedSection variant="band-blue" padY className="border-b border-kelly-gold/20">
          <ContentContainer>
            <Link
              href="/campaign-calendar"
              className="text-xs font-semibold text-kelly-mist/80 hover:text-kelly-gold"
            >
              ← All events
            </Link>
            <h1 className="mt-3 font-heading text-2xl font-bold text-kelly-mist">Event no longer on the schedule</h1>
            <p className="mt-2 text-sm text-kelly-mist/90">
              {r.title} was removed from the public schedule. Check the current calendar for what&rsquo;s on next.
            </p>
          </ContentContainer>
        </FullBleedSection>
        <FullBleedSection padY>
          <ContentContainer>
            <p className="text-sm text-kelly-text/75">
              Need something else?{" "}
              <Link href={join} className="font-semibold text-kelly-navy hover:underline">
                Get involved with the campaign
              </Link>{" "}
              or return to the{" "}
              <Link href="/campaign-calendar" className="font-semibold text-kelly-navy hover:underline">
                full public calendar
              </Link>
              .
            </p>
          </ContentContainer>
        </FullBleedSection>
      </>
    );
  }

  const e = r.event;
  const briefing = resolveCampaignEventBriefing(slug, e);
  const { dateLine, timeLine } = formatPublicEventWhenRange(e.startAt, e.endAt, e.timezone);
  const title = briefing?.what.title ?? e.title;

  return (
    <>
      <FullBleedSection variant="band-blue" padY className="border-b border-kelly-gold/20">
        <ContentContainer>
          <Link href="/campaign-calendar" className="text-xs font-semibold text-kelly-mist/80 hover:text-kelly-gold">
            ← All events
          </Link>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-kelly-gold/90">
            Field briefing · {e.eventTypeLabel}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-kelly-mist md:text-4xl">{title}</h1>
          <p className="mt-2 font-body text-sm text-kelly-mist/90">{dateLine}</p>
          <p className="mt-0.5 font-mono text-sm text-kelly-mist/85">{timeLine}</p>
        </ContentContainer>
      </FullBleedSection>
      <FullBleedSection padY>
        <ContentContainer className="max-w-5xl">
          {briefing ? (
            <CampaignEventBriefingView briefing={briefing} publicEvent={e} />
          ) : (
            <p className="text-sm text-kelly-text/75">Briefing not available for this event.</p>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
