import { notFound } from "next/navigation";

import { CampusDetailPanel } from "@/components/election-plan/CampusNetworkPanels";
import { getArkansasCampuses, getCampusBySlug } from "@/lib/election-plan/load-movement-infrastructure";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getArkansasCampuses().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const campus = getCampusBySlug(slug);
  if (!campus) return { title: "Campus not found" };
  return {
    title: `${campus.name} | Campus plan`,
    robots: { index: false, follow: false },
  };
}

export default async function CampusDetailPage({ params }: Props) {
  const { slug } = await params;
  const campus = getCampusBySlug(slug);
  if (!campus) notFound();
  return (
    <>
      <div className="ep-classification">Internal · Campus · {campus.shortName}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CampusDetailPanel campus={campus} />
        </div>
      </div>
    </>
  );
}
