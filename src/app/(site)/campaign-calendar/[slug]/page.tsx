import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolvePublicEventPageBySlug, resolvePublicEventTitleForMetadata } from "@/lib/calendar/public-events";
import { buildPublicLocationLine, formatPublicEventWhenRange } from "@/lib/calendar/public-event-format";
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
      description: `Public event · ${siteConfig.shortName} campaign calendar.`,
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
  const { dateLine, timeLine } = formatPublicEventWhenRange(e.startAt, e.endAt, e.timezone);
  const location = buildPublicLocationLine(e.locationName, e.address, e.venueMode);

  return (
    <>
      <FullBleedSection variant="band-blue" padY className="border-b border-kelly-gold/20">
        <ContentContainer>
          <Link href="/campaign-calendar" className="text-xs font-semibold text-kelly-mist/80 hover:text-kelly-gold">
            ← All events
          </Link>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-kelly-gold/90">
            {e.eventTypeLabel} · {e.venueMode === "virtual" ? "Virtual" : e.venueMode === "in_person" ? "In person" : "Format TBA"}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-kelly-mist md:text-4xl">{e.title}</h1>
          <p className="mt-2 font-body text-sm text-kelly-mist/90">{dateLine}</p>
          <p className="mt-0.5 font-mono text-sm text-kelly-mist/85">{timeLine}</p>
        </ContentContainer>
      </FullBleedSection>
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl">
          {e.county ? (
            <p className="text-sm text-kelly-text/80">
              <span className="font-semibold text-kelly-text">County: </span>
              {e.county.displayName}
            </p>
          ) : null}
          {e.publicSummary ? <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/90">{e.publicSummary}</p> : null}
          {location ? (
            <p className="mt-4 text-sm text-kelly-text/80">
              <span className="font-semibold">Where: </span>
              {location}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href={join}
              className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md bg-kelly-gold px-4 py-2 font-body text-sm font-semibold text-kelly-navy hover:brightness-105"
            >
              {e.secondaryAction.label}
            </a>
            <Link
              href="/campaign-calendar"
              className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md border border-kelly-navy/30 bg-kelly-page px-4 py-2 font-body text-sm font-semibold text-kelly-navy"
            >
              See more on the calendar
            </Link>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
