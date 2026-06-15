import { notFound } from "next/navigation";

import { CityLocationBriefPanel } from "@/components/election-plan/CityLocationBriefPanel";
import { getCityLocationBrief } from "@/lib/election-plan/load-city-location-brief";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const data = loadElectionPlanSnapshot();
  return data.cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = loadElectionPlanSnapshot();
  const brief = getCityLocationBrief(slug, data.cities);
  if (!brief) return { title: "City not found" };
  return {
    title: `${brief.name} | Location Brief`,
    description: brief.briefBoard.slice(0, 160),
    robots: { index: false, follow: false },
  };
}

export default async function CityLocationBriefPage({ params }: Props) {
  const { slug } = await params;
  const data = loadElectionPlanSnapshot();
  const brief = getCityLocationBrief(slug, data.cities);
  if (!brief) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Location brief · {brief.name}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CityLocationBriefPanel brief={brief} />
        </div>
      </div>
    </>
  );
}
