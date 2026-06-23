"use client";

import { ElectionPlanDay8PathwayProgressBar } from "@/components/election-plan/ElectionPlanDay8PathwayProgressBar";

export function ElectionPlanDay8BlockPathwayStrip({ sectionId }: { sectionId: string }) {
  return <ElectionPlanDay8PathwayProgressBar activeStepId={sectionId} compact />;
}
