import type { Metadata } from "next";
import Link from "next/link";

import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} · Precinct teams` };
}

const DEMO_ROWS = [
  { precinct: "Ward 1 / Box 12", captain: "Open", triad: "Needed", volunteers: "2 ready to place" },
  { precinct: "Ward 2 / Box 04", captain: "A. M. (confirmed)", triad: "Events gap", volunteers: "—" },
  { precinct: "Rural northeast", captain: "Open", triad: "Full launch", volunteers: "Triad identified" },
] as const;

export default async function CountyDemocratsPrecinctPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Precinct team builder</h2>
        <p className="mt-3 font-body text-sm text-kelly-text/85">
          Identify open precincts, existing captains, triads needed, and volunteers ready to place for{" "}
          {reg?.displayName ?? "your county"}. Each active precinct uses the same <span className="font-semibold">3-person</span>{" "}
          model: Events · Social · Power of 5 / VR. Data below is illustrative until volunteer placement tools feed this view.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-kelly-text/10 bg-white shadow-sm">
        <table className="w-full min-w-[640px] border-collapse font-body text-sm">
          <thead>
            <tr className="border-b border-kelly-text/10 bg-kelly-fog/40 text-left text-xs font-bold uppercase text-kelly-text/60">
              <th className="px-4 py-3">Precinct / box</th>
              <th className="px-4 py-3">Captain</th>
              <th className="px-4 py-3">Triad status</th>
              <th className="px-4 py-3">Volunteers to place</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ROWS.map((r) => (
              <tr key={r.precinct} className="border-b border-kelly-text/10 text-kelly-text/85">
                <td className="px-4 py-3 font-semibold text-kelly-navy">{r.precinct}</td>
                <td className="px-4 py-3">{r.captain}</td>
                <td className="px-4 py-3">{r.triad}</td>
                <td className="px-4 py-3">{r.volunteers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-body text-sm text-kelly-text/75">
        Downstream placement:{" "}
        <Link href="/volunteer/resources/email-templates" className="font-semibold text-kelly-blue underline">
          Email templates
        </Link>{" "}
        · triad training:{" "}
        <Link href="/volunteer/resources/team-launch-kit" className="font-semibold text-kelly-blue underline">
          Team Launch Kit
        </Link>
        .
      </p>
    </div>
  );
}
