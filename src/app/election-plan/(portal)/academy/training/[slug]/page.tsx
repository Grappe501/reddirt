import { notFound } from "next/navigation";

import { TrainingRolePanel } from "@/components/election-plan/CampaignAcademyOnboardingPanels";
import { getVolunteerAcademy } from "@/lib/election-plan/load-volunteer-academy";
import { getRoleOnboardingBundle } from "@/lib/election-plan/load-volunteer-onboarding";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getVolunteerAcademy().positions.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const bundle = getRoleOnboardingBundle(slug);
  if (!bundle) return { title: "Training | Campaign Academy" };
  return {
    title: `${bundle.position.title} Training | Campaign Academy`,
    robots: { index: false, follow: false },
  };
}

export default async function AcademyTrainingRolePage({ params }: Props) {
  const { slug } = await params;
  if (!getRoleOnboardingBundle(slug)) notFound();

  return (
    <>
      <div className="ep-classification">Phase 18.7C · Training packet</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <TrainingRolePanel slug={slug} />
        </div>
      </div>
    </>
  );
}
