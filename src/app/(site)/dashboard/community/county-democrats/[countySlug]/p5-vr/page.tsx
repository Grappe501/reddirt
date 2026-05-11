import type { Metadata } from "next";
import Link from "next/link";

import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} · P5 / Voter Registration` };
}

export default async function CountyDemocratsP5Page({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">Power of 5 / Voter registration</h2>
      <p className="font-body text-sm text-kelly-text/85">
        Relational turnout networks for {reg?.displayName ?? "your county"}: each leader builds five authentic relationships,
        invites them to the <span className="font-semibold">monthly county meeting</span>, and supports registration and GOTV.
        Mirror the statewide field playbook; escalation to campaign counsel on sensitive voter assistance questions.
      </p>
      <p className="font-body text-sm text-kelly-text/75">
        <Link href="/field-playbook" className="font-semibold text-kelly-blue underline">
          Field playbook
        </Link>
        ·{" "}
        <Link href="/volunteer/resources/email-templates#invite-p5" className="font-semibold text-kelly-blue underline">
          Invite to Power of 5 (email)
        </Link>
      </p>
    </div>
  );
}
