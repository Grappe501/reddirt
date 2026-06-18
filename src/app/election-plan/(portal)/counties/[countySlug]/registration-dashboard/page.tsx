import { notFound } from "next/navigation";

import { CountyElectoralMathDetailPanel } from "@/components/election-plan/CountyElectoralMathDetailPanel";
import { CountyElectoralMathMissingPanel } from "@/components/election-plan/CountyElectoralMathMissingPanel";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getCountyBySlug } from "@/lib/election-plan/load-county";
import { loadCountyRegistrationDashboardMarkdown } from "@/lib/election-plan/load-county-electoral-math-markdown";

type Props = { params: Promise<{ countySlug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const data = loadElectionPlanSnapshot();
  return data.counties.map((c) => ({ countySlug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { countySlug } = await params;
  const data = loadElectionPlanSnapshot();
  const county = getCountyBySlug(data, countySlug);
  if (!county) return { title: "County not found" };
  return {
    title: `${county.county} County · Registration dashboard | Election Plan`,
    robots: { index: false, follow: false },
  };
}

export default async function CountyRegistrationDashboardPage({ params }: Props) {
  const { countySlug } = await params;
  const data = loadElectionPlanSnapshot();
  const county = getCountyBySlug(data, countySlug);
  if (!county) notFound();

  const markdown = loadCountyRegistrationDashboardMarkdown(county.slug);
  if (!markdown) {
    return (
      <>
        <div className="ep-classification">
          Internal · Chapter 5 · Registration dashboard · {county.county} County
        </div>
        <div className="ep-chapter-body px-6 py-10 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <CountyElectoralMathMissingPanel
              countySlug={county.slug}
              countyName={county.county}
              kind="registration-dashboard"
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="ep-classification">
        Internal · Chapter 5 · Registration dashboard · {county.county} County
      </div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CountyElectoralMathDetailPanel
            countySlug={county.slug}
            countyName={county.county}
            kind="registration-dashboard"
            markdown={markdown}
          />
        </div>
      </div>
    </>
  );
}
