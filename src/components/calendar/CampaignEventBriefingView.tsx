import type { ReactNode } from "react";
import Link from "next/link";

import type { CampaignEventBriefing } from "@/lib/calendar/campaign-event-briefing-types";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { formatPublicEventWhenRange } from "@/lib/calendar/public-event-format";
import { getJoinCampaignHref } from "@/config/external-campaign";

type Props = {
  briefing: CampaignEventBriefing;
  publicEvent?: PublicCampaignEvent | null;
};

function BriefSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="border-b border-kelly-text/10 pb-1 font-heading text-sm font-bold uppercase tracking-wider text-kelly-navy">
        {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-kelly-text/90">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <p>
      <span className="font-semibold text-kelly-text">{label}: </span>
      {value}
    </p>
  );
}

function ListBlock({ items, empty }: { items: string[]; empty?: string }) {
  if (!items.length) {
    return empty ? <p className="text-kelly-text/60">{empty}</p> : null;
  }
  return (
    <ul className="list-inside list-disc space-y-0.5 text-kelly-text/85">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function categoryBadge(category: CampaignEventBriefing["calendarCategory"]) {
  const map: Record<string, string> = {
    locked: "Leadership locked",
    scheduled: "Scheduled",
    proposed: "Proposed",
    plan: "20-week plan",
    published: "Published",
    unknown: "Calendar",
  };
  return map[category] ?? category;
}

export function CampaignEventBriefingView({ briefing, publicEvent }: Props) {
  const join = getJoinCampaignHref();
  const start = briefing.when.startAt;
  const end = briefing.when.endAt;
  const { dateLine, timeLine } = formatPublicEventWhenRange(
    new Date(start),
    new Date(end),
    briefing.when.timezone,
  );

  const gaps = briefing.dataGaps.length ? briefing.dataGaps : null;
  const open = briefing.openItems.length ? briefing.openItems : null;

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-wrap gap-2">
        <span className="rounded bg-kelly-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-kelly-navy">
          {briefing.what.eventType}
        </span>
        <span className="rounded bg-kelly-gold/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-kelly-navy">
          {categoryBadge(briefing.calendarCategory)}
        </span>
        {briefing.verificationStatus ? (
          <span className="rounded border border-kelly-text/15 px-2 py-0.5 text-[10px] font-semibold text-kelly-text/70">
            {briefing.verificationStatus}
          </span>
        ) : null}
        {!briefing.when.timeKnown ? (
          <span className="rounded border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
            Time TBD
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BriefSection title="Who">
          <Field label="Audience" value={briefing.who.audience} />
          <Field label="Host" value={briefing.who.host} />
          <Field label="Organizers" value={briefing.who.organizers} />
          <Field label="Expected attendance" value={briefing.who.expectedAttendance} />
        </BriefSection>

        <BriefSection title="What">
          <Field label="Event" value={briefing.what.title} />
          <Field label="Type" value={briefing.what.eventType} />
          {briefing.what.description ? <p>{briefing.what.description}</p> : null}
        </BriefSection>

        <BriefSection title="When">
          <p className="font-semibold text-kelly-text">{dateLine}</p>
          <p className="font-mono text-kelly-text/80">{timeLine}</p>
          {briefing.when.dateEnd && briefing.when.dateEnd !== briefing.when.startAt.slice(0, 10) ? (
            <Field label="Multi-day through" value={briefing.when.dateEnd} />
          ) : null}
        </BriefSection>

        <BriefSection title="Where">
          <Field label="Venue" value={briefing.where.venue} />
          <Field label="Address" value={briefing.where.address} />
          <Field label="City" value={briefing.where.city} />
          {briefing.where.county ? (
            <p>
              <span className="font-semibold text-kelly-text">County: </span>
              {briefing.where.countySlug ? (
                <Link href={`/counties/${briefing.where.countySlug}`} className="text-kelly-navy underline">
                  {briefing.where.county}
                </Link>
              ) : (
                briefing.where.county
              )}
            </p>
          ) : null}
        </BriefSection>

        <BriefSection title="Why we're going" className="md:col-span-2">
          <Field label="Campaign rationale" value={briefing.why.campaignRationale} />
          <Field label="Strategic goal" value={briefing.why.strategicGoal} />
          <div>
            <p className="font-semibold text-kelly-text">Lane focus</p>
            <ListBlock items={briefing.why.laneFocus} />
          </div>
        </BriefSection>
      </div>

      <BriefSection title="Campaign goal">
        <Field label="Primary" value={briefing.campaignGoal.primary} />
        <div>
          <p className="font-semibold text-kelly-text">Success metrics</p>
          <ListBlock items={briefing.campaignGoal.successMetrics} />
        </div>
        <Field label="Volunteer ask" value={briefing.campaignGoal.volunteerAsk} />
        {briefing.campaignGoal.registrationGoal ? (
          <p>
            <span className="font-semibold text-kelly-text">Registration: </span>
            <Link href="/election-plan/registration-goals" className="text-kelly-navy underline">
              County breakdown →
            </Link>
          </p>
        ) : null}
      </BriefSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <BriefSection title="Kelly's role">
          <Field label="Assignment" value={briefing.kelly.assignment} />
          <Field label="Role on site" value={briefing.kelly.role} />
          <Field label="Visibility" value={briefing.kelly.visibility} />
          <Field label="Booth / stage" value={briefing.kelly.boothOrStage} />
          <div>
            <p className="font-semibold text-kelly-text">Talking points</p>
            <ListBlock items={briefing.kelly.talkingPoints} />
          </div>
        </BriefSection>

        <BriefSection title="Local contact">
          <Field label="Name" value={briefing.localContact.name} />
          <Field label="Role" value={briefing.localContact.role} />
          <Field label="Phone" value={briefing.localContact.phone} />
          <Field label="Email" value={briefing.localContact.email} />
          <Field label="Notes" value={briefing.localContact.notes} />
        </BriefSection>
      </div>

      <BriefSection title="Trip · lodging · outside the event">
        <Field label="Departure base" value={briefing.trip.departureBase} />
        <Field label="Travel class" value={briefing.trip.travelClass} />
        {briefing.trip.driveMinutes != null ? (
          <Field label="Drive time" value={`~${briefing.trip.driveMinutes} min from Rose Bud`} />
        ) : null}
        {briefing.trip.overnight != null ? (
          <Field label="Overnight" value={briefing.trip.overnight ? "Yes — plan lodging" : "Day trip"} />
        ) : null}
        <Field label="Lodging" value={briefing.trip.lodging} />
        <Field label="Companions" value={briefing.trip.companions} />
        <div>
          <p className="font-semibold text-kelly-text">Plans outside the event</p>
          <ListBlock items={briefing.trip.outsideEventPlans} empty="None logged yet." />
        </div>
      </BriefSection>

      <BriefSection title="Run of show">
        {briefing.runOfShow.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-kelly-text/15 text-[10px] uppercase tracking-wider text-kelly-text/55">
                  <th className="py-1.5 pr-3 font-bold">Time</th>
                  <th className="py-1.5 pr-3 font-bold">Activity</th>
                  <th className="py-1.5 pr-3 font-bold">Owner</th>
                  <th className="py-1.5 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {briefing.runOfShow.map((row, i) => (
                  <tr key={`${row.time}-${i}`} className="border-b border-kelly-text/8">
                    <td className="py-2 pr-3 font-mono text-kelly-text/75">{row.time ?? "—"}</td>
                    <td className="py-2 pr-3">{row.activity}</td>
                    <td className="py-2 pr-3 text-kelly-text/75">{row.owner ?? "—"}</td>
                    <td className="py-2 text-kelly-text/70">{row.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-kelly-text/60">Run of show not built yet.</p>
        )}
      </BriefSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <BriefSection title="Online intel">
          {briefing.onlineIntel.lastResearched ? (
            <p className="text-xs text-kelly-text/55">Last researched: {briefing.onlineIntel.lastResearched}</p>
          ) : null}
          {briefing.onlineIntel.officialSiteNotes ? <p>{briefing.onlineIntel.officialSiteNotes}</p> : null}
          {briefing.onlineIntel.sources.length ? (
            <ul className="space-y-2">
              {briefing.onlineIntel.sources.map((s) => (
                <li key={s.label} className="rounded border border-kelly-text/10 bg-kelly-page/40 p-2">
                  {s.url ? (
                    <a href={s.url} className="font-semibold text-kelly-navy underline" target="_blank" rel="noreferrer">
                      {s.label}
                    </a>
                  ) : (
                    <span className="font-semibold text-kelly-text">{s.label}</span>
                  )}
                  {s.snippet ? <p className="mt-1 text-xs text-kelly-text/75">{s.snippet}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-kelly-text/60">No online sources linked yet.</p>
          )}
        </BriefSection>

        <BriefSection title="Logistics · volunteers · story">
          <Field label="Parking" value={briefing.logistics.parking} />
          <Field label="Load-in" value={briefing.logistics.loadIn} />
          <Field label="AV" value={briefing.logistics.avNeeds} />
          <Field label="Merch & signage" value={briefing.logistics.merchAndSignage} />
          <Field label="Dress code" value={briefing.logistics.dressCode} />
          <Field label="Volunteer lead" value={briefing.volunteer.lead} />
          {briefing.volunteer.shifts.length ? (
            <div>
              <p className="font-semibold text-kelly-text">Shift types</p>
              <ListBlock items={briefing.volunteer.shifts} />
            </div>
          ) : null}
          <Field label="Mobilize" value={briefing.volunteer.mobilizeNotes} />
          <Field label="Story capture" value={briefing.story.capturePlan} />
          <Field label="Substack angle" value={briefing.story.substackAngle} />
        </BriefSection>
      </div>

      {(open || gaps) && (
        <div className="grid gap-4 md:grid-cols-2">
          {open ? (
            <div className="rounded-md border border-amber-200/80 bg-amber-50/90 p-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">Open items</h2>
              <ListBlock items={open} />
            </div>
          ) : null}
          {gaps ? (
            <div className="rounded-md border border-kelly-text/15 bg-kelly-page/60 p-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-kelly-text/70">Data gaps to fill</h2>
              <ListBlock items={gaps} />
            </div>
          ) : null}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-kelly-text/10 pt-6">
        <a
          href={join}
          className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md bg-kelly-gold px-4 py-2 font-body text-sm font-semibold text-kelly-navy hover:brightness-105"
        >
          {publicEvent?.secondaryAction.label ?? "Volunteer"}
        </a>
        <Link
          href="/campaign-calendar"
          className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md border border-kelly-navy/30 bg-kelly-page px-4 py-2 font-body text-sm font-semibold text-kelly-navy"
        >
          All events
        </Link>
        <Link
          href="/election-plan/lanes-overview"
          className="inline-flex min-h-[2.5rem] items-center justify-center rounded-md border border-kelly-navy/30 bg-kelly-page px-4 py-2 font-body text-sm font-semibold text-kelly-navy"
        >
          Lanes overview
        </Link>
      </div>
    </div>
  );
}
