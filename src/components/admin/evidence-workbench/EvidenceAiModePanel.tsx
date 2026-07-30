"use client";

import Link from "next/link";
import {
  modeNextSteps,
  type EvidenceAiMode,
} from "@/lib/campaign-media/evidence-ai-modes";
import { EvidenceAiModeSelector } from "@/components/admin/evidence-workbench/EvidenceAiModeSelector";

type Props = {
  kind: "photo" | "video";
  mode: EvidenceAiMode;
  onChange: (mode: EvidenceAiMode) => void;
  className?: string;
};

/**
 * Photos/Videos mode section — selector + closed-loop next steps (audit #5).
 * Keeps God panels intact; routes the AI assist without new admin routes.
 */
export function EvidenceAiModePanel({ kind, mode, onChange, className }: Props) {
  const steps = modeNextSteps(kind, mode);

  return (
    <div
      className={
        className ??
        "rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] p-3 space-y-2"
      }
    >
      <EvidenceAiModeSelector kind={kind} mode={mode} onChange={onChange} />
      {steps.length ? (
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
            Mode loop
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 font-body text-[11px] text-[#364272]">
            {steps.map((s) => (
              <li key={s.label}>
                {s.href ? (
                  <Link href={s.href} className="font-semibold text-[#000066] underline">
                    {s.label}
                  </Link>
                ) : (
                  s.label
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
