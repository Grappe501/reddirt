"use client";

import Link from "next/link";
import { EvidencePlacementPanel } from "@/components/admin/evidence-workbench/EvidencePlacementPanel";
import { EvidencePublicSurfacePreview } from "@/components/admin/evidence-workbench/EvidencePublicSurfacePreview";
import { EvidenceSpeechPlacementStrip } from "@/components/admin/evidence-workbench/EvidenceSpeechPlacementStrip";
import type { CuratedPlacementProposal } from "@/lib/campaign-media/curated-placement-types";
import type { SpeechPlacementProposal } from "@/lib/campaign-media/speech-placement";

type Props = {
  photoProposal: CuratedPlacementProposal | null;
  photoCurrent: {
    homepageIds: string[];
    acrossIds: string[];
    meetKellyId: string | null;
    heroId: string | null;
  };
  speechProposal: SpeechPlacementProposal | null;
  speechCurrent: { primaryId: string; acrossId: string };
  focusedPhoto?: { id: string; title?: string; surfaces: string[] } | null;
  focusedSpeech?: { id: string; title?: string; surfaces: string[] } | null;
};

/**
 * Round C Public Surface Desk — photo + speech placement + surface preview + Ship link.
 * Prefer Unknown. confirmCurate only. Never silent Approve / registry rewrite.
 */
export function EvidencePublicSurfaceDesk({
  photoProposal,
  photoCurrent,
  speechProposal,
  speechCurrent,
  focusedPhoto = null,
  focusedSpeech = null,
}: Props) {
  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-4">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
          Public Surface Desk
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          After Approve: see where an asset will appear, curate homepage photo + video slots, then
          finish on Ship (overlays → campaign-shipped → graduation → commit). Prefer Unknown. Never
          silent Apply.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/admin/evidence-workbench?tab=ship"
            className="rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
          >
            Open Ship last mile →
          </Link>
          <Link
            href="/admin/evidence-workbench?tab=queue"
            className="rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066]"
          >
            Publish Queue
          </Link>
          <Link
            href="/campaign-photos"
            className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
          >
            Public albums
          </Link>
          <Link
            href="/kelly-speaks"
            className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
          >
            Kelly Speaks
          </Link>
        </div>
      </div>

      {focusedPhoto ? (
        <EvidencePublicSurfacePreview
          kind="photo"
          assetId={focusedPhoto.id}
          title={focusedPhoto.title}
          surfaces={focusedPhoto.surfaces}
        />
      ) : null}
      {focusedSpeech ? (
        <EvidencePublicSurfacePreview
          kind="speech"
          assetId={focusedSpeech.id}
          title={focusedSpeech.title}
          surfaces={focusedSpeech.surfaces}
        />
      ) : null}
      {!focusedPhoto && !focusedSpeech ? (
        <p className="font-body text-xs text-[#364272]">
          Tip: open with{" "}
          <code className="rounded bg-[#f4f7fc] px-1">?tab=placement&amp;id=photo-id</code> to preview
          surfaces for a focused still.
        </p>
      ) : null}

      <EvidencePlacementPanel initialProposal={photoProposal} current={photoCurrent} />
      <EvidenceSpeechPlacementStrip
        initialPlacement={speechProposal}
        placementCurrent={speechCurrent}
      />
    </div>
  );
}
