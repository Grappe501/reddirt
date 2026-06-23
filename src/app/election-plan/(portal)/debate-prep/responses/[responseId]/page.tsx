import Link from "next/link";
import { notFound } from "next/navigation";

import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { ElectionPlanExtendedResponseDetailPanel } from "@/components/election-plan/ElectionPlanExtendedResponsePanels";
import {
  EXTENDED_RESPONSE_IDS,
  getExtendedResponse,
} from "@/lib/election-plan/debate-prep-extended-responses-v9";
import { EP_DEBATE_PREP_RESPONSES_HREF } from "@/lib/election-plan/debate-prep-links";

export function generateStaticParams() {
  return EXTENDED_RESPONSE_IDS.map((responseId) => ({ responseId }));
}

export function generateMetadata({ params }: { params: Promise<{ responseId: string }> }) {
  return params.then((p) => {
    const narrative = getExtendedResponse(p.responseId);
    return {
      title: narrative ? `${narrative.title} | Extended Responses` : "Extended Response",
      robots: { index: false, follow: false },
    };
  });
}

export default async function DebatePrepResponseDetailPage({
  params,
}: {
  params: Promise<{ responseId: string }>;
}) {
  const { responseId } = await params;
  if (!getExtendedResponse(responseId)) notFound();

  return (
    <>
      <div className="ep-classification">Debate Command Course · Answer bank</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <ElectionPlanDebatePrepSubnav />
          <Link
            href={EP_DEBATE_PREP_RESPONSES_HREF}
            className="mb-6 inline-block text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            ← All extended responses
          </Link>
          <ElectionPlanExtendedResponseDetailPanel responseId={responseId} />
        </div>
      </div>
    </>
  );
}
