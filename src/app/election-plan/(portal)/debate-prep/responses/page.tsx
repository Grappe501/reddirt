import Link from "next/link";

import { ElectionPlanDebatePrepSubnav } from "@/components/election-plan/ElectionPlanDebatePrepSubnav";
import { ElectionPlanExtendedResponsesIndexPanel } from "@/components/election-plan/ElectionPlanExtendedResponsePanels";
import { EXTENDED_RESPONSE_NARRATIVES } from "@/lib/election-plan/debate-prep-extended-responses-v9";
import { EP_DEBATE_PREP_RESPONSES_HREF } from "@/lib/election-plan/debate-prep-links";

export const metadata = {
  title: "Extended Responses | Debate Command Course",
  description: "30s, 90s, and 180s answer narratives for openings, SOS domains, traps, and closing.",
  robots: { index: false, follow: false },
};

export default function DebatePrepResponsesPage() {
  return (
    <>
      <div className="ep-classification">Debate Command Course · Answer bank</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <ElectionPlanDebatePrepSubnav />
          <header className="mb-8 border-b border-slate-200 pb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Answer bank</p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-slate-900">Extended responses</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              Drill-down narratives for every major lane — short pivot, standard moderator answer, and extended
              narrative when you hold the floor. Claims-green only; verify before stage.
            </p>
          </header>
          <ElectionPlanExtendedResponsesIndexPanel narratives={EXTENDED_RESPONSE_NARRATIVES} />
          <p className="mt-10 text-xs text-slate-500">
            {EXTENDED_RESPONSE_NARRATIVES.length} response templates ·{" "}
            <Link href={EP_DEBATE_PREP_RESPONSES_HREF} className="underline">
              refresh index
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
