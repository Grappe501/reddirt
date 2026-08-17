import type { Metadata } from "next";
import Link from "next/link";

import { CountyMonthlyMeetingForm } from "@/components/dashboard/community/county-democrats/CountyMonthlyMeetingForm";
import { CountyPartyOfficerRoster } from "@/components/election-plan/CountyPartyOfficerRoster";
import { countyDemocratsHref } from "@/lib/campaign-ops/county-democrats-dashboard-plan";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";
import { getDpaOfficerOrgsForLocation } from "@/lib/election-plan/load-dpa-county-officers";

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
  const officerOrgs = getDpaOfficerOrgsForLocation({ countySlug });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Monthly county party meeting</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          Track date, time, venue, agenda, speakers, RSVP goals, volunteer assignments, and follow-up for {name}.
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

      {officerOrgs.length > 0 ? (
        <CountyPartyOfficerRoster
          orgs={officerOrgs}
          variant="contacts"
          theme="dashboard"
          title="County officers for this meeting"
        />
      ) : null}

      <CountyMonthlyMeetingForm countySlug={countySlug} countyDisplayName={name} />

      <p className="font-body text-sm text-kelly-text/75">
        <Link href={countyDemocratsHref(countySlug, "rollup")} className="font-semibold text-kelly-blue underline">
          Rollup tab
        </Link>{" "}
        for meeting progress.
      </p>
    </div>
  );
}
