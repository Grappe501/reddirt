import Link from "next/link";
import { notFound } from "next/navigation";
import { OpponentDiligenceChecklistPanel } from "@/components/admin/intelligence/OpponentDiligenceChecklistPanel";
import { PackoContrastGateBanner } from "@/components/admin/intelligence/PackoContrastGateBanner";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  getOpponentDiligenceSubject,
  OPPONENT_DILIGENCE_HUB_HREF,
} from "@/lib/intelligence/v4/opponentDiligenceRegistry";
import { loadOpponentDiligenceLog } from "@/lib/intelligence/v4/opponentDiligenceLogStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUBJECT_PARAMS = ["kelly-grappe", "kim-hammer", "michael-packo"] as const;

export function generateStaticParams() {
  return SUBJECT_PARAMS.map((subjectId) => ({ subjectId }));
}

export default async function DiligenceSubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const subject = getOpponentDiligenceSubject(subjectId);
  if (!subject) notFound();

  const log = loadOpponentDiligenceLog(subject.subjectId);
  if (!log) notFound();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={subject.eyebrow}
        title={`${subject.displayName} — diligence checklist`}
        description={subject.summary}
      >
        <V4BackLinks />
        <Link
          href={OPPONENT_DILIGENCE_HUB_HREF}
          className="rounded-full border border-kelly-navy/25 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Diligence hub
        </Link>
        <Link
          href={`/admin/intelligence/field-book/${subject.fieldBookSlug}`}
          className="rounded-full border border-kelly-gold/50 px-3 py-1 text-xs font-bold text-kelly-navy"
        >
          Field Book article
        </Link>
      </V4PageHeader>

      {subject.subjectId === "michael-packo" ? <PackoContrastGateBanner /> : null}

      <OpponentDiligenceChecklistPanel log={log} />
    </div>
  );
}
