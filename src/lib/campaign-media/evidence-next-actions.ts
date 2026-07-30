/**
 * Evidence Workbench — ranked Next Actions (deterministic, Prefer Unknown).
 * Read-only operator guidance from queue + speech + ship + intake signals.
 */
import "server-only";

import { buildEvidencePublishQueue } from "@/lib/campaign-media/evidence-publish-queue";
import { buildEvidenceShipReport } from "@/lib/campaign-media/evidence-ship-report";
import { getPhotoIntakeStatus } from "@/lib/campaign-media/photo-ingest";
import { buildSpeechConfirmQueue } from "@/lib/campaign-media/speech-confirm-queue";
import { buildSpeechReadinessMatrix } from "@/lib/campaign-media/speech-readiness";
import { listPendingCuratedPlacementProposals } from "@/lib/campaign-media/curated-placement-store";
import { loadCalendarPresenceStore } from "@/lib/campaign-media/evidence-store";

export type EvidenceNextAction = {
  id: string;
  priority: number;
  title: string;
  why: string;
  href: string;
  modeHint?: string;
};

export function rankEvidenceNextActions(limit = 5): {
  generatedAt: string;
  actions: EvidenceNextAction[];
  snapshot: Record<string, number | string>;
} {
  const queue = buildEvidencePublishQueue();
  const speechQ = buildSpeechConfirmQueue();
  const readiness = buildSpeechReadinessMatrix();
  const ship = buildEvidenceShipReport({ persist: false, includeDerivativeScan: true });
  const intake = getPhotoIntakeStatus();
  const calendar = loadCalendarPresenceStore();
  const pendingCurate = listPendingCuratedPlacementProposals().length;
  const needsConfirmCal = calendar.rows.filter((r) => r.status === "Needs confirm").length;
  const unknownCal = calendar.rows.filter((r) => r.status === "Unknown").length;

  const prepReady = readiness.rows.filter(
    (r) =>
      /prep|pro edit|clip|transcript|master/i.test(r.nextAction) &&
      !/confirm at least one real county/i.test(r.nextAction),
  ).length;
  const speechConfirmReady = speechQ.totals.noCounty;

  const candidates: EvidenceNextAction[] = [];

  if (queue.totals.unknownCounty > 0) {
    candidates.push({
      id: "photos-unknown",
      priority: 100,
      title: `Identify ${queue.totals.unknownCounty} Unknown stills`,
      why: "Geography must be confirmed before Approve — Prefer Unknown until sure.",
      href: "/admin/evidence-workbench?tab=queue&filter=unknown",
      modeHint: "identify",
    });
  }
  if (intake.newOnDisk > 0) {
    candidates.push({
      id: "intake-new",
      priority: 95,
      title: `Intake ${intake.newOnDisk} new stills on disk`,
      why: "Flatten + queue so Identify / Turbo can see them.",
      href: "/admin/evidence-workbench?tab=ingest",
      modeHint: "identify",
    });
  }
  if (queue.totals.needsApproval > 0) {
    candidates.push({
      id: "photos-approve",
      priority: 88,
      title: `Review ${queue.totals.needsApproval} stills needing approval`,
      why: "Saved overlays waiting for Approved/Published — never silent Approve.",
      href: "/admin/evidence-workbench?tab=queue&filter=needs-approval",
      modeHint: "publish",
    });
  }
  if (speechConfirmReady > 0) {
    candidates.push({
      id: "speech-county",
      priority: 86,
      title: `Confirm counties on ${speechConfirmReady} speeches`,
      why: "Empty county blocks honest publish / homepage video placement.",
      href: "/admin/evidence-workbench?tab=speeches",
      modeHint: "identify",
    });
  }
  if (needsConfirmCal + unknownCal > 0) {
    candidates.push({
      id: "calendar-confirm",
      priority: 82,
      title: `Confirm ${needsConfirmCal + unknownCal} calendar presence rows`,
      why: "Confirmed calendar rows become soft priors for photo/video Identify.",
      href: "/admin/evidence-workbench?tab=calendar",
      modeHint: "command",
    });
  }
  if (prepReady > 0) {
    candidates.push({
      id: "video-prep",
      priority: 78,
      title: `Prep ${prepReady} speeches ready for clips/intel`,
      why: "Masters/transcripts present — run video_prep without inventing spoken lines.",
      href: "/admin/evidence-workbench?tab=speeches",
      modeHint: "video_prep",
    });
  }
  if (pendingCurate > 0) {
    candidates.push({
      id: "curate-pending",
      priority: 72,
      title: `Review ${pendingCurate} curated placement proposal(s)`,
      why: "HOMEPAGE_* diffs waiting — apply only with confirmCurate.",
      href: "/admin/evidence-workbench?tab=placement",
      modeHint: "fit",
    });
  }
  if (ship.totals.overlayJsonDirty > 0) {
    candidates.push({
      id: "ship-overlays",
      priority: 70,
      title: `Ship ${ship.totals.overlayJsonDirty} dirty overlay path(s)`,
      why: "Local confirmation not yet committed — public site won’t see overlays.",
      href: "/admin/evidence-workbench?tab=ship",
      modeHint: "publish",
    });
  }
  if (ship.totals.derivativeLocalOnly > 0) {
    candidates.push({
      id: "ship-deriv",
      priority: 55,
      title: `${ship.totals.derivativeLocalOnly} derivative(s) local-only`,
      why: "Derivatives under .local / gitignored — decide promote vs leave local.",
      href: "/admin/evidence-workbench?tab=ship",
      modeHint: "photo_prep",
    });
  }
  if (candidates.length === 0) {
    candidates.push({
      id: "steady",
      priority: 10,
      title: "Workbench steady — ask Command anything",
      why: "Queues look calm. Use Command for event-night packs, fit scores, or ship reports.",
      href: "/admin/evidence-workbench?tab=queue",
      modeHint: "command",
    });
  }

  const actions = candidates
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.max(1, Math.min(limit, 8)));

  return {
    generatedAt: new Date().toISOString(),
    actions,
    snapshot: {
      unknownCounty: queue.totals.unknownCounty,
      needsApproval: queue.totals.needsApproval,
      newOnDisk: intake.newOnDisk,
      speechNoCounty: speechQ.totals.noCounty,
      calendarNeedsConfirm: needsConfirmCal + unknownCal,
      overlayDirty: ship.totals.overlayJsonDirty,
      pendingCurate,
    },
  };
}
