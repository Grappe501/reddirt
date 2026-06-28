import Link from "next/link";

import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

export const metadata = {
  title: "County Playbooks | Kelly Grappe Victory Plan",
  description: "75 Arkansas counties — playbook hub for campaign organizing.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ presentation?: string; cpos?: string }> };

export default async function CountiesHubPage({ searchParams }: Props) {
  const data = loadElectionPlanSnapshot();
  const sp = await searchParams;
  const presentation = sp.presentation === "true" || sp.cpos === "1";

  return (
    <>
      {!presentation && (
        <div className="ep-classification">Internal · County playbooks · {data.counties.length} counties</div>
      )}
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--ep-navy)]">
            County Playbooks
          </h1>
          <p className="mt-2 text-[var(--ep-navy-muted)] max-w-2xl">
            Select a county for intelligence, playbooks, and local organizing context.
          </p>
          <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.counties.map((county) => (
              <li key={county.slug}>
                <Link
                  href={`/election-plan/counties/${county.slug}${presentation ? "?presentation=true&cpos=1" : ""}`}
                  className="block rounded-[var(--ep-radius)] border border-[var(--ep-border)] bg-white px-4 py-3 shadow-[var(--ep-shadow-xs)] transition hover:border-[var(--ep-gold)] hover:shadow-[var(--ep-shadow)]"
                >
                  <span className="font-semibold text-[var(--ep-navy)]">{county.county}</span>
                  <span className="block text-xs text-[var(--ep-navy-muted)] mt-0.5">County playbook</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
