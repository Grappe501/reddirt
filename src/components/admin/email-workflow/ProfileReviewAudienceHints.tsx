"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { parseAudienceIntelligenceV2FromHintMetadata } from "@/lib/email-command-center/ai-profile-intelligence";
import { ProfileAudienceHintsList } from "@/components/admin/email-workflow/EmailWorkflowProfileGraphControls";

type HintRow = {
  id: string;
  label: string;
  status: string;
  hintType: string;
  confidence: number | null;
  rationale: string | null;
  metadataJson: unknown;
  emailWorkflowItemId: string;
  emailWorkflowItem: { id: string; title: string | null; whatSummary: string | null; status: string };
};

type HintFilter = "highConfidence" | "needsReview" | "sensitiveRisky";

export function ProfileReviewAudienceHints({ hints }: { hints: HintRow[] }) {
  const [f, setF] = useState<Set<HintFilter>>(new Set());

  const filtered = useMemo(() => {
    if (!f.size) return hints;
    return hints.filter((h) => {
      const hi = parseAudienceIntelligenceV2FromHintMetadata(h.metadataJson);
      const conf = h.confidence ?? 0;
      const risk = hi?.riskLevel ?? "low";
      const needs = hi?.needsHumanReview ?? true;
      const dns = Boolean(hi?.shouldNotStoreReason);
      for (const id of f) {
        if (id === "highConfidence" && (conf < 0.7 || risk !== "low" || dns)) return false;
        if (id === "needsReview" && !needs && risk === "low" && !dns) return false;
        if (id === "sensitiveRisky" && risk !== "high" && !dns) return false;
      }
      return true;
    });
  }, [hints, f]);

  const toggle = (id: HintFilter) => {
    setF((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["highConfidence", "High confidence"],
            ["needsReview", "Needs review"],
            ["sensitiveRisky", "Sensitive / risky"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              f.has(id)
                ? "border-kelly-forest bg-kelly-forest/15 text-kelly-navy"
                : "border-kelly-text/15 bg-white text-kelly-text/75"
            }`}
          >
            {label}
          </button>
        ))}
        {f.size ? (
          <button type="button" className="text-[10px] text-kelly-text/60 underline" onClick={() => setF(new Set())}>
            Clear
          </button>
        ) : null}
      </div>
      <ul className="mt-2 space-y-3">
        {filtered.map((h) => (
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
              hints={[
                {
                  id: h.id,
                  label: h.label,
                  status: h.status,
                  hintType: h.hintType,
                  confidence: h.confidence,
                  rationale: h.rationale,
                  metadataJson: h.metadataJson,
                },
              ]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
