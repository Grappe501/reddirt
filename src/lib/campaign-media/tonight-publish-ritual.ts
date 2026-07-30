/**
 * Tonight publish ritual — turbo proposals → optional confirm Approve → ship refresh → commit template.
 * Never silent Approve. Prefer Unknown.
 */
import "server-only";

import { applyPhotoPublishBatch } from "@/lib/campaign-media/batch-photo-publish";
import { buildEvidencePublishQueue } from "@/lib/campaign-media/evidence-publish-queue";
import { buildEvidenceShipReport } from "@/lib/campaign-media/evidence-ship-report";
import { listPromotedDerivativesNeedingShip } from "@/lib/campaign-media/ship-promoted-derivatives";
import { runTurboIngest } from "@/lib/campaign-media/turbo-ingest";

export type TonightRitualResult = {
  ok: boolean;
  message: string;
  turboMessage?: string;
  approveMessage?: string;
  ship: ReturnType<typeof buildEvidenceShipReport>;
  needsApprovalIds: string[];
  promotedNeedingShip: Array<{ photoId: string; publicSrc: string; fileExists: boolean }>;
  commitMessageTemplate: string;
};

/**
 * Same-night chain. Approve only when confirmApprove:true and photoIds provided.
 */
export async function runTonightPublishRitual(input: {
  confirmTurbo?: boolean;
  confirmApprove?: boolean;
  useAi?: boolean;
  maxPhotos?: number;
  approvePhotoIds?: string[];
  consentConfirmed?: boolean;
  runTurbo?: boolean;
}): Promise<TonightRitualResult> {
  const queue = buildEvidencePublishQueue();
  const needsApprovalIds = queue.buckets.needsApproval.map((i) => i.id);

  let turboMessage: string | undefined;
  if (input.runTurbo) {
    if (!input.confirmTurbo) {
      return {
        ok: false,
        message: "confirmTurbo:true required when runTurbo is set.",
        ship: buildEvidenceShipReport({ persist: false, includeDerivativeScan: true }),
        needsApprovalIds,
        promotedNeedingShip: listPromotedDerivativesNeedingShip(),
        commitMessageTemplate: "",
      };
    }
    const turbo = await runTurboIngest({
      useAi: input.useAi !== false,
      maxPhotos: input.maxPhotos ?? 24,
      intakeFirst: false,
    });
    turboMessage = turbo.message;
  }

  let approveMessage: string | undefined;
  if (input.confirmApprove) {
    const ids = (input.approvePhotoIds?.length ? input.approvePhotoIds : needsApprovalIds).slice(
      0,
      80,
    );
    if (!ids.length) {
      approveMessage = "No needs-approval stills to Approve.";
    } else {
      const batch = applyPhotoPublishBatch({
        photoIds: ids,
        action: "approve",
        consentConfirmed: Boolean(input.consentConfirmed),
        refreshAlbums: true,
        allowUnknownCounty: false,
      });
      approveMessage = batch.message;
    }
  }

  const ship = buildEvidenceShipReport({ persist: true, includeDerivativeScan: true });
  const promotedNeedingShip = listPromotedDerivativesNeedingShip();

  const parts = [
    turboMessage,
    approveMessage,
    `Ship · overlays dirty ${ship.totals.overlayJsonDirty} · promoted needing ship ${promotedNeedingShip.length} · missing ${ship.totals.promotedOverrideMissing}`,
  ].filter(Boolean);

  return {
    ok: true,
    message: parts.join(" · "),
    turboMessage,
    approveMessage,
    ship,
    needsApprovalIds: buildEvidencePublishQueue().buckets.needsApproval.map((i) => i.id),
    promotedNeedingShip,
    commitMessageTemplate: ship.commitMessageTemplate,
  };
}
