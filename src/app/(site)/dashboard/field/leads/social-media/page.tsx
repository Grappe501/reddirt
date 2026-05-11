import type { Metadata } from "next";
import Link from "next/link";

import { FieldBreadcrumbs } from "@/components/dashboard/field/FieldBreadcrumbs";
import { fieldDirectorHref, fieldRegionsIndexHref } from "@/lib/field-structure/field-dashboard-paths";

export const metadata: Metadata = {
  title: "Lead · Social & media · Field",
  description: "Template statewide social and media lead dashboard for the volunteer field operating system.",
};

export default function FieldLeadSocialMediaPage() {
  return (
    <>
      <FieldBreadcrumbs
        items={[
          { label: "Field Director", href: fieldDirectorHref() },
          { label: "Lead · Social & media" },
        ]}
      />
      <h2 className="font-heading text-2xl font-bold text-kelly-text">Lead · Social & media</h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
        Cross-region narrative, local press cadence, and amplification requests roll up here. Drill into any region to
        align county social leads with the same lane tabs used at county level.
      </p>
      <ul className="mt-6 space-y-3 font-body text-sm">
        <li>
          <Link href={fieldRegionsIndexHref()} className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
            Regions → pick a region → counties → social lane
          </Link>
        </li>
        <li>
          <Link href={fieldDirectorHref()} className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
            Back to Field Director overview
          </Link>
        </li>
      </ul>
    </>
  );
}
