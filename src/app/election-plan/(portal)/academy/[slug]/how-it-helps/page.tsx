import { notFound } from "next/navigation";

import { HowItHelpsPanel } from "@/components/election-plan/CampaignAcademyOnboardingPanels";
import { getVolunteerAcademy } from "@/lib/election-plan/load-volunteer-academy";
import { getRoleOnboardingBundle } from "@/lib/election-plan/load-volunteer-onboarding";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getVolunteerAcademy().positions.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const bundle = getRoleOnboardingBundle(slug);
  if (!bundle) return { title: "Campaign Academy" };
  return {
    title: `How ${bundle.position.title} Helps Kelly Win | Campaign Academy`,
    robots: { index: false, follow: false },
  };
}

export default async function HowItHelpsPage({ params }: Props) {
  const { slug } = await params;
  if (!getRoleOnboardingBundle(slug)) notFound();

  return (
    <>
      <div className="ep-classification">Phase 18.7C · Role impact</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <HowItHelpsPanel slug={slug} />
        </div>
      </div>
    </>
  );
}
