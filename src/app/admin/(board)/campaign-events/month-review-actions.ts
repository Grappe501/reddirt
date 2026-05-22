"use server";

import { revalidatePath } from "next/cache";
import { loadCampaignEventsWorkbench, serializeWorkbenchRows } from "@/lib/campaign-events/load-workbench-events";
import { loadEventReviewBundle } from "@/lib/campaign-events/persistence/review-bundle";
import {
  applyReviewDecision,
  persistReviewForm,
} from "@/lib/campaign-events/persistence/review-persistence";
import type { EventReviewFormState } from "@/lib/campaign-events/review-form";
import type { CampaignEventDecision } from "@/lib/campaign-events/review-meta";

function revalidateMonthReview() {
  revalidatePath("/admin/campaign-events/review");
  revalidatePath("/admin/campaign-events/workbench");
  revalidatePath("/admin/campaign-events/month-readiness");
  revalidatePath("/admin/campaign-events/travel-report");
  revalidatePath("/admin/candidate-dashboard");
  revalidatePath("/admin/campaign-manager-dashboard");
  revalidatePath("/admin/campaign-events", "layout");
}

export async function loadMonthReviewRowsAction(period: string) {
  const { rows, period: p } = await loadCampaignEventsWorkbench({ period });
  return { period: p, rows: serializeWorkbenchRows(rows) };
}

export async function loadMonthReadinessPreviewAction(period: string) {
  const { rows, period: p } = await loadCampaignEventsWorkbench({ period });
  const serialized = serializeWorkbenchRows(rows);
  const { computeMonthReviewStats } = await import("@/lib/campaign-events/month-review/month-review-stats");
  const { computeMonthReadinessScore } = await import("@/lib/campaign-events/month-readiness/month-readiness-score");
  const { countRemainingIssues } = await import("@/lib/campaign-events/month-readiness/month-readiness-score-delta");
  const stats = computeMonthReviewStats(serialized);
  const score = computeMonthReadinessScore(serialized);
  return {
    period: p,
    scorePercent: score.scorePercent,
    bandLabel: score.bandLabel,
    remainingIssues: countRemainingIssues(stats),
  };
}

export async function getMonthReviewBundleAction(recordId: string) {
  const bundle = await loadEventReviewBundle(recordId);
  return JSON.parse(JSON.stringify(bundle));
}

export async function saveMonthReviewFormAction(
  recordId: string,
  form: EventReviewFormState,
  mode: "recalculate" | "draft",
) {
  await persistReviewForm(recordId, form, {
    recalculate: mode === "recalculate",
    draft: mode === "draft",
    actor: "month-review",
  });
  revalidateMonthReview();
  return { ok: true as const };
}

export async function applyMonthReviewDecisionAction(
  recordId: string,
  decision: CampaignEventDecision,
  note?: string,
) {
  await applyReviewDecision(recordId, decision, { note, actor: "month-review" });
  revalidateMonthReview();
  return { ok: true as const };
}
