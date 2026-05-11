import type { Metadata } from "next";
import Link from "next/link";

import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} · Social / Communications` };
}

export default async function CountyDemocratsSocialPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">Social / Communications</h2>
      <p className="font-body text-sm text-kelly-text/85">
        Approve local messaging for {reg?.displayName ?? "your county"}; pair with Kelly campaign brand assets and the volunteer
        design hub. Paid boosts and legal disclaimers go through campaign comms.
      </p>
      <p className="font-body text-sm text-kelly-text/75">
        <Link href="/volunteer/resources/social-media-design" className="font-semibold text-kelly-blue underline">
          Social media &amp; Canva hub
        </Link>
      </p>
    </div>
  );
}
