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
    return (
      <div className="mt-1 rounded border border-kelly-text/10 bg-kelly-fog/40 px-2 py-2 text-[11px] text-kelly-navy" role="status">
        <p className="font-semibold">No pending audience hints</p>
        <p className="mt-1 text-[10px] text-kelly-text/80">
          Hints are optional staging signals from stored queue AI — an empty list is normal until analysis produces labels.
        </p>
        <p className="mt-2 text-[10px]">
          <Link href="/admin/workbench/email-queue" className="font-bold text-kelly-forest underline">
            Email queue
          </Link>{" "}
          ·{" "}
          <Link href="/admin/workbench/email-command-center/audiences" className="font-bold text-kelly-forest underline">
            Audience Studio
          </Link>
        </p>
        <p className="mt-1 text-[10px] text-kelly-forest/90">
          <strong>Safety:</strong> hints are not SendGrid segments.
        </p>
      </div>
    );
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
