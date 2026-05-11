import type { Metadata } from "next";
import Link from "next/link";

import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} · Messages` };
}

export default async function CountyDemocratsMessagesPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">Messages</h2>
      <p className="font-body text-sm text-kelly-text/85">
        County chairs and lane leads coordinate day-to-day questions here as threaded messaging is wired to Volunteer OS accounts.
        Until then, use the messaging resource library and campaign Field / Party liaison contacts for {reg?.displayName ?? "your county"}.
      </p>
      <p className="font-body text-sm text-kelly-text/75">
        <Link href="/volunteer/resources/messaging" className="font-semibold text-kelly-blue underline">
          Messaging hub
        </Link>
        · Admin comms:{" "}
        <Link href="/admin/workbench/comms" className="font-semibold text-kelly-blue underline">
          Comms workbench
        </Link>
      </p>
    </div>
  );
}
