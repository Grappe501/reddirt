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
  /** Phase 4 — when true, Ship lives below on same desk (hash link, not self-nav). */
  embedOnPublishDesk?: boolean;
};

/**
 * Public Surface Desk — photo + speech placement + surface preview.
 * Prefer Unknown. confirmCurate only. Never silent Approve / registry rewrite.
 */
export function EvidencePublicSurfaceDesk({
  photoProposal,
  photoCurrent,
  speechProposal,
  speechCurrent,
  focusedPhoto = null,
  focusedSpeech = null,
  embedOnPublishDesk = false,
}: Props) {
  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-4">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
          Public surfaces
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          After Approve: see where an asset will appear, curate homepage photo + video slots, then
          {embedOnPublishDesk ? (
            <>
              {" "}
              finish <span className="font-semibold">Ship last mile below</span>
            </>
          ) : (
            <> finish on Publish desk (Ship last mile)</>
          )}
          . Prefer Unknown. Never silent Apply.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {embedOnPublishDesk ? (
            <a
              href="#ew-ship-last-mile"
              className="rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
            >
              Ship last mile ↓
            </a>
          ) : (
            <Link
              href="/admin/evidence-workbench?tab=publish#ew-ship-last-mile"
              className="rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
            >
              Open Publish / Ship →
            </Link>
          )}
          <Link
            href="/admin/evidence-workbench?tab=county"
            className="rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066]"
          >
            County desk
          </Link>
          <Link
            href="/edit"
            className="rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066]"
          >
            Website edit mode
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
          shipHref={embedOnPublishDesk ? "#ew-ship-last-mile" : undefined}
        />
      ) : null}
      {focusedSpeech ? (
        <EvidencePublicSurfacePreview
          kind="speech"
          assetId={focusedSpeech.id}
          title={focusedSpeech.title}
          surfaces={focusedSpeech.surfaces}
          shipHref={embedOnPublishDesk ? "#ew-ship-last-mile" : undefined}
        />
      ) : null}
      {!focusedPhoto && !focusedSpeech ? (
        <p className="font-body text-xs text-[#364272]">
          Tip: open with{" "}
          <code className="rounded bg-[#f4f7fc] px-1">?tab=publish&amp;id=photo-id</code> to preview
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
