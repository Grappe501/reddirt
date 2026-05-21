"use client";

import { recordWritingObservationAction } from "@/app/admin/agent-observations/writing-actions";
import type { WritingObservationMeta } from "@/lib/agents/writing-agent/writing-observation-types";

export function trackWritingObservation(meta: WritingObservationMeta) {
  void recordWritingObservationAction(meta).catch(() => {});
}
