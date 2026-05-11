import type { Metadata } from "next";
import Link from "next/link";

import { FieldBreadcrumbs } from "@/components/dashboard/field/FieldBreadcrumbs";
import { fieldDirectorHref, fieldRegionsIndexHref } from "@/lib/field-structure/field-dashboard-paths";

export const metadata: Metadata = {
  title: "Lead · Power of 5 / VR · Field",
  description: "Template statewide Power of 5 and voter registration lead dashboard.",
};

export default function FieldLeadPowerOf5Page() {
  return (
    <>
      <FieldBreadcrumbs
        items={[
          { label: "Field Director", href: fieldDirectorHref() },
          { label: "Lead · Power of 5 / VR" },
        ]}
      />
      <h2 className="font-heading text-2xl font-bold text-kelly-text">Lead · Power of 5 / voter registration</h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
        Relational recruiting and registration benchmarks drill from here into each region and county. P5 networks stay
        personal; only contacts who want to volunteer graduate into the formal volunteer OS.
      </p>
      <ul className="mt-6 space-y-3 font-body text-sm">
        <li>
          <Link href={fieldRegionsIndexHref()} className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
            Regions → counties → Power of 5 / VR lane
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
