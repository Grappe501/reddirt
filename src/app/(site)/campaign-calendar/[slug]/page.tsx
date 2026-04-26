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
          <h1 className="font-heading text-2xl font-bold text-deep-soil">Calendar temporarily unavailable</h1>
          <p className="mt-2 font-body text-deep-soil/80">
            This calendar can&apos;t load right now. Please try again in a moment. If you&apos;re on the team and need
            access, make sure the campaign database is running and refresh the page.
          </p>
          <Link href="/campaign-calendar" className="mt-6 inline-block font-semibold text-red-dirt underline">
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
        <FullBleedSection variant="civic-blue" padY className="border-b border-civic-gold/20">
          <ContentContainer>
            <Link
              href="/campaign-calendar"
              className="text-xs font-semibold text-civic-mist/80 hover:text-sunlight-gold"
            >
              ← All events
            </Link>
            <h1 className="mt-3 font-heading text-2xl font-bold text-civic-mist">Event no longer on the schedule</h1>
            <p className="mt-2 text-sm text-civic-mist/90">
              {r.title} was removed from the public schedule. Check the current calendar for what&rsquo;s on next.
            </p>
          </ContentContainer>
        </FullBleedSection>
        <FullBleedSection padY>
          <ContentContainer>
            <p className="text-sm text-deep-soil/75">
              Need something else?{" "}
              <Link href={join} className="font-semibold text-red-dirt hover:underline">
                Get involved with the campaign
              </Link>{" "}
              or return to the{" "}
              <Link href="/campaign-calendar" className="font-semibold text-red-dirt hover:underline">
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
      <FullBleedSection variant="civic-blue" padY className="border-b border-civic-gold/20">
        <ContentContainer>
          <Link href="/campaign-calendar" className="text-xs font-semibold text-civic-mist/80 hover:text-sunlight-gold">
            ← All events
          </Link>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-sunlight-gold/90">
            {e.eventTypeLabel} · {e.venueMode === "virtual" ? "Virtual" : e.venueMode === "in_person" ? "In person" : "Format TBA"}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-civic-mist md:text-4xl">{e.title}</h1>
          <p className="mt-2 font-body text-sm text-civic-mist/90">{dateLine}</p>
          <p className="mt-0.5 font-mono text-sm text-civic-mist/85">{timeLine}</p>
        </ContentContainer>
      </FullBleedSection>
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl">
          {e.county ? (
            <p className="text-sm text-deep-soil/80">
              <span className="font-semibold text-deep-soil">County: </span>
              {e.county.displayName}
            </p>
          ) : null}
          {e.publicSummary ? <p className="mt-4 font-body text-base leading-relaxed text-deep-soil/90">{e.publicSummary}</p> : null}
          {location ? (
            <p className="mt-4 text-sm text-deep-soil/80">
              <span className="font-semibold">Where: </span>
              {location}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href={join}
              className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md bg-red-dirt px-4 py-2 font-body text-sm font-semibold text-cream-canvas hover:bg-red-dirt/90"
            >
              {e.secondaryAction.label}
            </a>
            <Link
              href="/campaign-calendar"
              className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md border border-red-dirt/30 bg-cream-canvas px-4 py-2 font-body text-sm font-semibold text-red-dirt"
            >
              See more on the calendar
            </Link>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
