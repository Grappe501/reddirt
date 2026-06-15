import { notFound } from "next/navigation";

import { CampaignAcademyPositionPanel } from "@/components/election-plan/CampaignAcademyPanels";
import { getVolunteerAcademy } from "@/lib/election-plan/load-volunteer-academy";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getVolunteerAcademy().positions.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const pos = getVolunteerAcademy().positions.find((p) => p.slug === slug);
  if (!pos) return { title: "Campaign Academy" };
  return {
    title: `${pos.title} | Campaign Academy`,
    robots: { index: false, follow: false },
  };
}

export default async function CampaignAcademyPositionPage({ params }: Props) {
  const { slug } = await params;
  const exists = getVolunteerAcademy().positions.some((p) => p.slug === slug);
  if (!exists) notFound();

  return (
    <>
      <div className="ep-classification">Campaign Academy · Role onboarding</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <CampaignAcademyPositionPanel slug={slug} />
        </div>
      </div>
    </>
  );
}
