import type { Metadata } from "next";
import Link from "next/link";

import { COUNTY_PARTY_LEADERSHIP_MODEL } from "@/lib/campaign-ops/county-democrats-dashboard-plan";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";
import { VOLUNTEER_OS_DEMO_TEAM_SLUG } from "@/lib/team-naming";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  const name = reg?.displayName ?? "County";
  return {
    title: `${name} Democratic Party · Overview`,
    description: `County party organizing dashboard for ${name} — monthly meetings, P5, precinct teams.`,
  };
}

export default async function CountyDemocratsOverviewPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.06] p-6">
        <p className="font-heading text-sm font-bold text-kelly-navy">County party operating rhythm</p>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">
          The center of gravity is a <span className="font-semibold">consistent monthly county party meeting</span>: grow attendance,
          invite new people, launch volunteer teams, expand Power of 5 networks, register voters, and stand up downstream precinct and
          city triads. Lane leads use the same tools as geographic campaign teams (events, social, P5/VR, youth and women&apos;s
          outreach modules).
        </p>
      </div>

      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">{COUNTY_PARTY_LEADERSHIP_MODEL.title}</h2>
        <div className="mt-4 rounded-xl border border-kelly-text/10 bg-white p-4 font-mono text-xs leading-relaxed text-kelly-deep">
          {COUNTY_PARTY_LEADERSHIP_MODEL.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <p className="mt-4 font-body text-sm text-kelly-text/80">
          Chairs coordinate with the campaign Field team on messaging and legal guardrails. Triad discipline: three coordinators per
          precinct team (Events · Social · Power of 5 / VR).
        </p>
      </div>

      <p className="font-body text-sm text-kelly-text/75">
        Statewide volunteer triad (demo):{" "}
        <Link href={`/dashboard/team/${VOLUNTEER_OS_DEMO_TEAM_SLUG}`} className="font-semibold text-kelly-blue underline">
          open team workspace
        </Link>
        . County hub:{" "}
        <Link href="/volunteer/resources/county-party-launch-kit" className="font-semibold text-kelly-blue underline">
          County Party Launch Kit
        </Link>
        .
      </p>

      {reg ? (
        <p className="font-body text-xs text-kelly-text/55">
          Registry: {reg.displayName} · FIPS {reg.fips} · slug <span className="font-mono">{reg.slug}</span>
        </p>
      ) : null}
    </div>
  );
}
