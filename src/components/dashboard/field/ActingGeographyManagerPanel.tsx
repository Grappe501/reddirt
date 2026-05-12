"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

/**
 * First volunteer into a geography is treated as the acting dashboard lead until downstream teams are filled in.
 * Choices here are a UI preview until preferences can be saved to the volunteer profile.
 */
export function ActingGeographyManagerPanel({ geographyLabel }: { geographyLabel: string }) {
  const [choice, setChoice] = useState<"acting" | "drill" | null>(null);

  return (
    <section
      className="rounded-2xl border border-amber-300/60 bg-amber-50/90 p-5 shadow-sm"
      aria-labelledby="acting-manager-heading"
    >
      <h2 id="acting-manager-heading" className="font-heading text-lg font-bold text-amber-950">
        Acting geography lead
      </h2>
      <p className="mt-2 font-body text-sm leading-relaxed text-amber-950/90">
        The first volunteer into <strong>{geographyLabel}</strong> is treated as the{" "}
        <strong>acting county dashboard manager</strong> until triads and downstream teams are filled in. When new
        teams spin up, you can stay at this level or drill into city, precinct, and neighborhood workspaces.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="primary"
          onClick={() => setChoice("acting")}
          className="justify-center"
        >
          Willing to serve as acting lead here
        </Button>
        <Button type="button" variant="secondary" onClick={() => setChoice("drill")} className="justify-center">
          Prefer to drill down when sub-teams exist
        </Button>
      </div>
      {choice ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-white/80 px-3 py-2 font-body text-xs leading-relaxed text-amber-950/85">
          <strong>Heads up:</strong> your choice ({choice === "acting" ? "acting lead" : "wait for drill-down"}) is not saved yet.
          Campaign staff will connect this preference to your volunteer profile after field tools finish rollout.
        </p>
      ) : null}
    </section>
  );
}
