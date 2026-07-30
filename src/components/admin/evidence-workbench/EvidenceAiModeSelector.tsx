"use client";

import { listEvidenceAiModesForUi, type EvidenceAiMode } from "@/lib/campaign-media/evidence-ai-modes";
import { cn } from "@/lib/utils";

type Props = {
  kind: "photo" | "video";
  mode: EvidenceAiMode;
  onChange: (mode: EvidenceAiMode) => void;
  className?: string;
};

export function EvidenceAiModeSelector({ kind, mode, onChange, className }: Props) {
  const modes = listEvidenceAiModesForUi(kind);
  const active = modes.find((m) => m.id === mode) ?? modes[0];

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
        AI mode
      </p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Evidence AI mode">
        {modes.map((m) => {
          const selected = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(m.id)}
              className={cn(
                "rounded border px-2 py-1 font-body text-[11px] font-semibold",
                selected
                  ? "border-[#000066] bg-[#000066] text-white"
                  : "border-[#8eb6dc] bg-white text-[#12124a] hover:border-[#000066]/50",
              )}
              title={`${m.summary} · tools: ${m.toolCount}`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      {active ? (
        <p className="font-body text-[10px] text-[#364272]">
          {active.summary} · {active.toolCount === "all" ? "all" : active.toolCount} tools
        </p>
      ) : null}
    </div>
  );
}
