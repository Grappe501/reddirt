import type { Metadata } from "next";
import Link from "next/link";

import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} · Women's Outreach` };
}

export default async function CountyDemocratsWomensPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">Women&apos;s Outreach</h2>
      <p className="font-body text-sm text-kelly-text/85">
        Women-led networks, family-friendly scheduling, and listening sessions for {reg?.displayName ?? "your county"}. Coordinate with
        Events on timing and venues; use Women&apos;s lane KPI patterns from the statewide dashboard when reporting rollups.
      </p>
      <p className="font-body text-sm text-kelly-text/75">
        <Link href="/volunteer/resources/messaging" className="font-semibold text-kelly-blue underline">
          Messaging library
        </Link>
      </p>
    </div>
  );
}
