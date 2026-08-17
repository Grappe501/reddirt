import type { Metadata } from "next";
import Link from "next/link";

import { CountyPartyOfficerRoster } from "@/components/election-plan/CountyPartyOfficerRoster";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";
import { getDpaOfficerOrgsForLocation } from "@/lib/election-plan/load-dpa-county-officers";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} · Events` };
}

export default async function CountyDemocratsEventsPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  const officerOrgs = getDpaOfficerOrgsForLocation({ countySlug });
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">Events</h2>
      {officerOrgs.length > 0 ? (
        <CountyPartyOfficerRoster
          orgs={officerOrgs}
          variant="contacts"
          theme="dashboard"
          title="Who books and hosts county party events"
        />
      ) : null}
      <p className="font-body text-sm text-kelly-text/85">
        County party programs beyond the monthly meeting — tabling, neighborhood meetups, registration drives, and joint programs
        with allied organizations. Coordinate dates with the <span className="font-semibold">Monthly meeting</span> tab so the
        county calendar stays coherent for {reg?.displayName ?? "your county"}.
      </p>
      <p className="font-body text-sm text-kelly-text/75">
        <Link href={`/dashboard/community/county-democrats/${countySlug}/monthly-meeting`} className="font-semibold text-kelly-blue underline">
          Schedule monthly meeting
        </Link>
      </p>
    </div>
  );
}
