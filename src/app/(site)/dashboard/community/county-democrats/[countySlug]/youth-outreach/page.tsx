import type { Metadata } from "next";
import Link from "next/link";

import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} · Youth Outreach` };
}

export default async function CountyDemocratsYouthPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">Youth Outreach</h2>
      <p className="font-body text-sm text-kelly-text/85">
        Student and young voter engagement for {reg?.displayName ?? "your county"}: schools, campuses, young professionals, and
        family-forward programming — aligned with statewide Youth lane doctrine and county party norms.
      </p>
      <p className="font-body text-sm text-kelly-text/75">
        <Link href="/volunteer/resources" className="font-semibold text-kelly-blue underline">
          Volunteer resources
        </Link>
      </p>
    </div>
  );
}
