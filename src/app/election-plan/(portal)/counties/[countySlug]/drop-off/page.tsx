import { notFound } from "next/navigation";

import { CountyElectoralMathDetailPanel } from "@/components/election-plan/CountyElectoralMathDetailPanel";
import { CountyElectoralMathMissingPanel } from "@/components/election-plan/CountyElectoralMathMissingPanel";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { getCountyBySlug } from "@/lib/election-plan/load-county";
import { loadCountyDropOffMarkdown } from "@/lib/election-plan/load-county-electoral-math-markdown";

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
    title: `${county.county} County · Drop-off | Election Plan`,
    robots: { index: false, follow: false },
  };
}

export default async function CountyDropOffPage({ params }: Props) {
  const { countySlug } = await params;
  const data = loadElectionPlanSnapshot();
  const county = getCountyBySlug(data, countySlug);
  if (!county) notFound();

  const markdown = loadCountyDropOffMarkdown(county.slug);
  if (!markdown) {
    return (
      <>
        <div className="ep-classification">Internal · Chapter 4 · Democratic drop-off · {county.county} County</div>
        <div className="ep-chapter-body px-6 py-10 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <CountyElectoralMathMissingPanel countySlug={county.slug} countyName={county.county} kind="drop-off" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="ep-classification">Internal · Chapter 4 · Democratic drop-off · {county.county} County</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CountyElectoralMathDetailPanel
            countySlug={county.slug}
            countyName={county.county}
            kind="drop-off"
            markdown={markdown}
          />
        </div>
      </div>
    </>
  );
}
