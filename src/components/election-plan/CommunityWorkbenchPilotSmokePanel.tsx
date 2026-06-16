"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PilotSmokePath } from "@/lib/election-plan/community-workbench/pilot-smoke-paths";
import type { PilotWorkbenchValidation } from "@/lib/election-plan/community-workbench/pilot-validation";
import { cn } from "@/lib/utils";

type Props = {
  smokePath: PilotSmokePath;
  validation: PilotWorkbenchValidation;
};

export function CommunityWorkbenchPilotSmokePanel({ smokePath, validation }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);

  return (
    <section id="pilot-smoke" className="mb-10 scroll-mt-28 rounded-xl border-2 border-[var(--ep-gold)] bg-[var(--ep-cream)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-navy-muted)]">Live pilot smoke test</p>
          <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">{smokePath.name} production path</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{smokePath.intro}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold uppercase",
            validation.allPass ? "bg-emerald-200 text-emerald-950" : "bg-white text-[var(--ep-navy)]",
          )}
        >
          {validation.stepsPassed}/{validation.steps.length} auto-checks pass
        </span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-semibold text-[var(--ep-navy)] underline"
      >
        {expanded ? "Collapse" : "Expand"} step-by-step path
      </button>

      {expanded ? (
        <ol className="mt-4 space-y-4">
          {smokePath.steps.map((step) => {
            const auto = validation.steps.find((s) =>
              step.title.toLowerCase().includes("community lead")
                ? s.id === "assign_community_lead"
                : step.title.toLowerCase().includes("event") && !step.title.toLowerCase().includes("action")
                  ? s.id === "create_live_event"
                  : step.title.toLowerCase().includes("after action")
                    ? s.id === "complete_aar"
                    : false,
            );
            return (
              <li key={step.order} className="rounded-lg border border-[var(--ep-border)] bg-white p-4 text-sm">
                <p className="font-heading font-bold text-[var(--ep-navy)]">
                  {step.order}. {step.title}
                  {auto ? (
                    <span className={cn("ml-2 text-xs font-bold uppercase", auto.pass ? "text-emerald-700" : "text-amber-700")}>
                      {auto.pass ? "Verified" : "Pending"}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-[var(--ep-navy-muted)]">
                  <span className="font-semibold text-[var(--ep-navy)]">Do:</span> {step.action}
                </p>
                <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">
                  <span className="font-semibold">Pass:</span> {step.passCriteria}
                </p>
                {step.href ? (
                  <Link href={step.href} className="mt-2 inline-block text-xs font-semibold text-[var(--ep-gold)] hover:underline">
                    Open step →
                  </Link>
                ) : step.anchor ? (
                  <a href={`#${step.anchor}`} className="mt-2 inline-block text-xs font-semibold text-[var(--ep-gold)] hover:underline">
                    Jump to {step.anchor} →
                  </a>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}

      <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
        Full doc: <code>docs/COMMUNITY_WORKBENCH_V1_3_PILOT.md</code> · Log defects below or on the hub.
      </p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="mt-2 rounded-md border border-[var(--ep-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
      >
        Refresh validation checks
      </button>
    </section>
  );
}
