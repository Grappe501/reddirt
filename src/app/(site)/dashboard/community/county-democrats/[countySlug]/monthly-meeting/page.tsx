import type { Metadata } from "next";
import Link from "next/link";

import { CountyMonthlyMeetingForm } from "@/components/dashboard/community/county-democrats/CountyMonthlyMeetingForm";
import { countyDemocratsHref } from "@/lib/campaign-ops/county-democrats-dashboard-plan";
import { COUNTY_PARTY_MONTHLY_WORKFLOW_TEMPLATE_KEY } from "@/lib/campaign-ops/county-party-meeting-intent";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} Democratic Party · Monthly meeting` };
}

export default async function CountyDemocratsMonthlyMeetingPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  const name = reg?.displayName ?? countySlug;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Monthly county party meeting</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          Track date/time, venue, agenda, featured speakers, RSVP and new-attendee goals, volunteer assignments, and follow-up tasks.
          Creating a meeting below (when the database is configured) writes a <span className="font-semibold">CampaignEvent</span>{" "}
          on the internal calendar with <span className="font-mono text-xs">campaignIntent = county_party_monthly</span>, then runs
          the <span className="font-mono text-xs">{COUNTY_PARTY_MONTHLY_WORKFLOW_TEMPLATE_KEY}</span>{" "}
          <span className="font-semibold">EVENT_CREATED</span> workflow: Power of 5 invitations → RSVP follow-up → post-meeting
          volunteer identification.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/80">
          <li>
            <span className="font-semibold">Needed now:</span> Invite your Power of 5 to the county meeting.
          </li>
          <li>
            <span className="font-semibold">Coming up:</span> Follow up with anyone who has not responded.
          </li>
          <li>
            <span className="font-semibold">Next after that:</span> Report attendance and identify new volunteers.
          </li>
        </ul>
      </div>

      <CountyMonthlyMeetingForm countySlug={countySlug} countyDisplayName={name} />

      <div className="rounded-xl border border-kelly-text/10 bg-white p-5 font-body text-sm text-kelly-text/85">
        <p className="font-semibold text-kelly-navy">Calendar &amp; automation integration points</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <span className="font-semibold">Campaign calendar:</span> events appear in Calendar HQ / workbench once created.
          </li>
          <li>
            <span className="font-semibold">Email Automation + Action Orchestration:</span> map invitation and reminder sequences to
            the generated <span className="font-semibold">CampaignTask</span> rows (and <span className="font-semibold">EmailWorkflowItem</span>{" "}
            when operators wire templates).
          </li>
          <li>
            <span className="font-semibold">RSVP workflows:</span> existing <span className="font-mono text-xs">event_signup</span> template runs on
            registrations when public RSVP is enabled for the event.
          </li>
        </ul>
        <p className="mt-3 text-xs text-kelly-text/60">
          Staff: create or edit events in{" "}
          <Link href="/admin/events" className="font-semibold text-kelly-blue underline">
            Admin → Events
          </Link>{" "}
          · operations board tasks in{" "}
          <Link href="/admin/workbench" className="font-semibold text-kelly-blue underline">
            workbench
          </Link>
          .
        </p>
      </div>

      <p className="font-body text-sm text-kelly-text/75">
        <Link href={countyDemocratsHref(countySlug, "rollup")} className="font-semibold text-kelly-blue underline">
          Rollup tab
        </Link>{" "}
        for meeting KPIs (demo strip until county metrics sync).
      </p>
    </div>
  );
}
