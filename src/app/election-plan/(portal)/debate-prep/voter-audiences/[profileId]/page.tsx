import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { VoterAudienceProfilePanel } from "@/components/election-plan/voter-audience/VoterAudienceProfilePanel";
import { EP_VOTER_AUDIENCES_HREF } from "@/lib/election-plan/debate-prep-links";
import { getVoterAudienceProfile, listVoterAudienceProfiles } from "@/lib/election-plan/voter-audience-models/load";

export function generateStaticParams() {
  return listVoterAudienceProfiles().map((p) => ({ profileId: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params;
  const profile = getVoterAudienceProfile(profileId);
  if (!profile) return { title: "Audience not found" };
  return {
    title: `${profile.displayName} | Voter audiences`,
    robots: { index: false, follow: false },
  };
}

export default async function VoterAudienceProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const profile = getVoterAudienceProfile(profileId);
  if (!profile) notFound();

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <ElectionPlanDebatePrepSubnav compact />
        <Link href={EP_VOTER_AUDIENCES_HREF} className="text-xs font-bold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
          ← All audiences
        </Link>
        <div className="mt-4">
          <VoterAudienceProfilePanel profile={profile} />
        </div>
      </div>
    </div>
  );
}
