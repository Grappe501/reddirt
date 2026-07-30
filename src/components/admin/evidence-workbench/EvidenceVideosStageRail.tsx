"use client";

import { useState, type ReactNode } from "react";

type Stage = "confirm" | "cuts" | "place";

type Props = {
  confirm: ReactNode;
  cuts: ReactNode;
  place: ReactNode;
  initialStage?: Stage;
};

const STAGES: Array<{ id: Stage; label: string; hint: string }> = [
  { id: "confirm", label: "1 · Confirm", hint: "County / publish parity" },
  { id: "cuts", label: "2 · Cuts", hint: "Quote → Pro Edit / encode" },
  { id: "place", label: "3 · Place", hint: "Homepage video slots" },
];

/** Round C Videos rail — Confirm → Cuts → Place. */
export function EvidenceVideosStageRail({
  confirm,
  cuts,
  place,
  initialStage = "confirm",
}: Props) {
  const [stage, setStage] = useState<Stage>(initialStage);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] p-3">
        <p className="font-heading text-[11px] font-bold uppercase tracking-wide text-[#000066]">
          Videos desk · Confirm → Cuts → Place
        </p>
        <p className="mt-1 font-body text-[10px] text-[#364272]">
          Continuous speech path. Prefer Unknown counties. confirmCurate for homepage video apply.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.hint}
              onClick={() => setStage(s.id)}
              className={`rounded-md border px-3 py-1.5 font-body text-xs font-bold ${
                stage === s.id
                  ? "border-[#000066] bg-[#000066] text-white"
                  : "border-[#8eb6dc] bg-white text-[#12124a]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {stage === "confirm" ? confirm : null}
      {stage === "cuts" ? cuts : null}
      {stage === "place" ? place : null}
    </div>
  );
}
