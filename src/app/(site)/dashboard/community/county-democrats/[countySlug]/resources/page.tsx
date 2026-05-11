import type { Metadata } from "next";
import Link from "next/link";

import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} · Resources` };
}

export default async function CountyDemocratsResourcesPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold text-kelly-navy">Resources</h2>
      <p className="font-body text-sm text-kelly-text/85">
        County Party Launch Kit, email templates, talking points, and graphics for {reg?.displayName ?? "your county"}.
      </p>
      <ul className="list-disc space-y-2 pl-5 font-body text-sm text-kelly-deep">
        <li>
          <Link href="/volunteer/resources/county-party-launch-kit" className="font-semibold text-kelly-blue underline">
            County Party Launch Kit
          </Link>
        </li>
        <li>
          <Link href="/volunteer/resources/email-templates" className="font-semibold text-kelly-blue underline">
            Email templates (incl. county party set)
          </Link>
        </li>
        <li>
          <Link href="/volunteer/resources/messaging" className="font-semibold text-kelly-blue underline">
            Messaging library
          </Link>
        </li>
        <li>
          <Link href="/volunteer/resources/social-media-design" className="font-semibold text-kelly-blue underline">
            Social / Canva hub
          </Link>
        </li>
        <li>
          <Link href={`/counties/${countySlug}`} className="font-semibold text-kelly-blue underline">
            Public county page
          </Link>{" "}
          (context)
        </li>
      </ul>
    </div>
  );
}
