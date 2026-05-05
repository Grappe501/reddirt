"use client";

import Link from "next/link";
import { ProfileAudienceHintsList } from "@/components/admin/email-workflow/EmailWorkflowProfileGraphControls";

type HintRow = {
  id: string;
  label: string;
  status: string;
  emailWorkflowItemId: string;
  emailWorkflowItem: { id: string; title: string | null; whatSummary: string | null; status: string };
};

export function ProfileReviewAudienceHints({ hints }: { hints: HintRow[] }) {
  if (!hints.length) {
    return <p className="text-[11px] text-kelly-text/55">No pending audience hints.</p>;
  }
  return (
    <ul className="mt-2 space-y-3">
      {hints.map((h) => (
        <li key={h.id} className="rounded border border-kelly-text/10 bg-kelly-page/40 p-2">
          <p className="text-[11px] font-semibold text-kelly-navy">{h.label}</p>
          <p className="text-[10px] text-kelly-text/60">
            Item:{" "}
            <Link className="underline" href={`/admin/workbench/email-queue/${h.emailWorkflowItemId}`}>
              {h.emailWorkflowItem.title ?? h.emailWorkflowItem.whatSummary ?? h.emailWorkflowItemId}
            </Link>
          </p>
          <ProfileAudienceHintsList
            itemId={h.emailWorkflowItemId}
            hints={[{ id: h.id, label: h.label, status: h.status }]}
          />
        </li>
      ))}
    </ul>
  );
}
