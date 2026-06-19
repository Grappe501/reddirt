import { notFound } from "next/navigation";

import { ElectionPlanOpponentBioPanel } from "@/components/election-plan/ElectionPlanOpponentBioPanel";
import { ElectionPlanDrillDownShell } from "@/components/election-plan/ElectionPlanDrillDownShell";
import { EP_OPPONENT_BIOS_HREF } from "@/lib/election-plan/debate-prep-links";
import { getOpponentBio, listOpponentBioIds } from "@/lib/election-plan/opponentBioDrillDown";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return listOpponentBioIds().map((opponentId) => ({ opponentId }));
}

export async function generateMetadata({ params }: { params: Promise<{ opponentId: string }> }) {
  const { opponentId } = await params;
  const bio = getOpponentBio(opponentId);
  if (!bio) return { title: "Opponent bio not found" };
  return {
    title: `${bio.displayName} · Opponent biography`,
    robots: { index: false, follow: false },
  };
}

export default async function OpponentBioPage({ params }: { params: Promise<{ opponentId: string }> }) {
  const { opponentId } = await params;
  const bio = getOpponentBio(opponentId);
  if (!bio) notFound();

  const ids = listOpponentBioIds();
  const idx = ids.indexOf(bio.opponentId);
  const prev = idx > 0 ? { opponentId: ids[idx - 1], displayName: getOpponentBio(ids[idx - 1])!.displayName } : null;
  const next =
    idx >= 0 && idx < ids.length - 1
      ? { opponentId: ids[idx + 1], displayName: getOpponentBio(ids[idx + 1])!.displayName }
      : null;

  return (
    <ElectionPlanDrillDownShell
      backHref={EP_OPPONENT_BIOS_HREF}
      backLabel="Opponent biographies"
      eyebrow={`${bio.partyLabel} · read Day 2 · re-read Day 4 · lock Day 6`}
      title={`${bio.displayName} — full biography`}
      description={bio.subtitle}
    >
      <ElectionPlanOpponentBioPanel bio={bio} prev={prev} next={next} />
    </ElectionPlanDrillDownShell>
  );
}
