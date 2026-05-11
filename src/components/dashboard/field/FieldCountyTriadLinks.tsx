import Link from "next/link";

import type { ArCommandRegionId } from "@/lib/county/arkansas-county-registry";
import { fieldCountyLaneHref } from "@/lib/field-structure/field-dashboard-paths";

const lanes = [
  {
    id: "events" as const,
    title: "Events lane",
    body: "Tablings, house parties, county party rhythm, and immersion weekends — field execution view (template).",
  },
  {
    id: "social-media" as const,
    title: "Social & media lane",
    body: "Owned posts, local press, and amplification — coordinated from this county shell (template).",
  },
  {
    id: "power-of-5" as const,
    title: "Power of 5 / voter registration",
    body: "Relational recruiting and registration goals — distinct from the 3-person operating team, but same volunteer can do both (template).",
  },
];

export function FieldCountyTriadLinks({
  regionId,
  countySlug,
  countyDisplayName,
}: {
  regionId: ArCommandRegionId;
  countySlug: string;
  countyDisplayName: string;
}) {
  return (
    <section className="mt-8" aria-labelledby="county-triad-heading">
      <h2 id="county-triad-heading" className="font-heading text-lg font-bold text-kelly-text">
        Three county lanes · linked to regional command
      </h2>
      <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
        Each county workspace mirrors the regional dashboard and campaign lead view. These three lanes align with the
        volunteer operating triad for <strong>{countyDisplayName}</strong>.
      </p>
      <ul className="mt-4 grid gap-4 md:grid-cols-3">
        {lanes.map((lane) => (
          <li key={lane.id}>
            <Link
              href={fieldCountyLaneHref(regionId, countySlug, lane.id)}
              className="block h-full rounded-2xl border border-kelly-text/10 bg-white p-4 shadow-sm transition hover:border-kelly-navy/25 hover:shadow-md"
            >
              <h3 className="font-heading text-base font-bold text-kelly-navy">{lane.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/75">{lane.body}</p>
              <span className="mt-3 inline-block font-body text-xs font-bold uppercase tracking-wide text-kelly-navy">
                Open lane dashboard →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
