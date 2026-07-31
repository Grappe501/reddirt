/**
 * P0/P1 — Finish photo for web: Apply → Confirm render → Promote → Ship
 * (+ optional curated placement proposal). Prefer Unknown; never silent; never overwrite originals.
 */
import "server-only";

import {
  curateSurfaceForFinish,
  type EvidenceFinishSurface,
} from "@/lib/campaign-media/evidence-edit-intents";
import { proposeCuratedPlacementForPhoto } from "@/lib/campaign-media/curated-placement-propose";
import type { CuratedPlacementProposal } from "@/lib/campaign-media/curated-placement-types";
import { loadPhotoEvidenceStore, savePhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import { proposePhotoEditProject } from "@/lib/campaign-media/photo-edit-director";
import { updatePhotoEditProject } from "@/lib/campaign-media/photo-edit-plan";
import {
  getPhotoEditProject,
  listPhotoAssemblies,
  listPhotoEditProjects,
} from "@/lib/campaign-media/photo-edit-store";
import type { PhotoAssemblyRecord, PhotoEditProject } from "@/lib/campaign-media/photo-edit-types";
import {
  DEFAULT_PHOTO_EXPORT_SLOTS,
  type PhotoExportSlot,
  type PhotoLookPreset,
} from "@/lib/campaign-media/photo-look-presets";
import { renderPhotoEditProject } from "@/lib/campaign-media/photo-pro-render";
import { promotePhotoDerivative } from "@/lib/campaign-media/promote-photo-derivative";
import { shipPromotedDerivatives } from "@/lib/campaign-media/ship-promoted-derivatives";

export type FinishPhotoForWebResult = {
  ok: boolean;
  message: string;
  steps: string[];
  warnings: string[];
  projectId?: string;
  publicSrc?: string;
  placementPreview?: string[];
  assemblies?: PhotoAssemblyRecord[];
  curateProposalId?: string;
  finishSurface?: EvidenceFinishSurface;
};

function pickAssembly(
  assemblies: PhotoAssemblyRecord[],
  preferSlot?: PhotoExportSlot | null,
): PhotoAssemblyRecord | null {
  const live = assemblies.filter((a) => !a.note?.includes("[archived"));
  if (!live.length) return null;
  if (preferSlot) {
    const hit = live.find((a) => a.slot === preferSlot);
    if (hit) return hit;
  }
  const hero = live.find((a) => a.slot === "hero_16x9");
  if (hero) return hero;
  const web = live.find((a) => a.slot === "web_max");
  if (web) return web;
  return live[0] ?? null;
}

function applySurfaceFlags(input: {
  photoId: string;
  finishSurface: EvidenceFinishSurface;
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: string;
  approvedForPublic?: boolean;
}): void {
  const store = loadPhotoEvidenceStore();
  const prev = store.photos[input.photoId] ?? {};
  const next: PhotoEvidenceOverlay = { ...prev, updatedAt: new Date().toISOString() };

  if (input.finishSurface === "homepage" || input.finishSurface === "journey") {
    next.homepageCandidate = input.homepageCandidate ?? true;
    if (input.featuredPhoto !== undefined) next.featuredPhoto = input.featuredPhoto;
    if (input.heroLevel === "HERO" || input.heroLevel === "FEATURE" || input.heroLevel === "SUPPORTING" || input.heroLevel === "UNREVIEWED") {
      next.heroLevel = input.heroLevel;
    } else if (!next.heroLevel) {
      next.heroLevel = "FEATURE";
    }
    if (input.approvedForPublic !== undefined) next.approvedForPublic = input.approvedForPublic;
  } else if (input.finishSurface === "album") {
    next.homepageCandidate = input.homepageCandidate ?? false;
    next.approvedForPublic = input.approvedForPublic ?? true;
    if (input.heroLevel === "HERO" || input.heroLevel === "FEATURE" || input.heroLevel === "SUPPORTING" || input.heroLevel === "UNREVIEWED") {
      next.heroLevel = input.heroLevel;
    } else if (!next.heroLevel) {
      next.heroLevel = "FEATURE";
    }
  }

  store.photos[input.photoId] = next;
  savePhotoEvidenceStore(store);
}

export async function finishPhotoForWeb(input: {
  photoId: string;
  confirmFinish: boolean;
  projectId?: string;
  look?: PhotoLookPreset;
  exportSlots?: PhotoExportSlot[];
  useFocus?: boolean;
  focusX?: number;
  focusY?: number;
  sharpen?: boolean;
  homepageCandidate?: boolean;
  featuredPhoto?: boolean;
  heroLevel?: string;
  approvedForPublic?: boolean;
  consentConfirmed?: boolean;
  /** P1 place surface. */
  finishSurface?: EvidenceFinishSurface;
  /** When true (default for homepage/journey), write pending curated proposal after ship. */
  proposeCurate?: boolean;
}): Promise<FinishPhotoForWebResult> {
  const steps: string[] = [];
  const warnings: string[] = [];
  const photoId = String(input.photoId ?? "").trim();
  const finishSurface: EvidenceFinishSurface = input.finishSurface ?? "homepage";

  if (!input.confirmFinish) {
    return {
      ok: false,
      message: "confirmFinish:true required — refuse silent Finish for web.",
      steps,
      warnings: ["Silent finish blocked."],
      finishSurface,
    };
  }
  if (!photoId) {
    return {
      ok: false,
      message: "photoId required.",
      steps,
      warnings: ["Missing photoId."],
      finishSurface,
    };
  }

  const slots =
    input.exportSlots?.length && input.exportSlots.length > 0
      ? input.exportSlots
      : ([...DEFAULT_PHOTO_EXPORT_SLOTS] as PhotoExportSlot[]);

  let project: PhotoEditProject | null = null;
  const existingId = String(input.projectId ?? "").trim();
  if (existingId) {
    const found = getPhotoEditProject(existingId);
    project = found && found.photoId === photoId ? found : null;
  }
  if (!project) {
    project = listPhotoEditProjects(photoId)[0] ?? null;
  }

  if (!project) {
    steps.push("Propose");
    const packet = await proposePhotoEditProject({
      photoId,
      look: input.look,
      exportSlots: slots,
      useFocus: input.useFocus ?? true,
      focusX: input.focusX,
      focusY: input.focusY,
      sharpen: input.sharpen,
      persist: true,
    });
    if (!packet.ok || !packet.project) {
      return {
        ok: false,
        message: packet.message || "Propose failed.",
        steps,
        warnings: [...warnings, ...(packet.warnings ?? [])],
        finishSurface,
      };
    }
    project = packet.project;
    warnings.push(...(packet.warnings ?? []));
  }

  steps.push("Apply");
  const applied = updatePhotoEditProject({
    projectId: project.id,
    updates: [
      {
        op: "set_meta",
        look: input.look ?? project.look,
        sharpen: typeof input.sharpen === "boolean" ? input.sharpen : project.sharpen,
        useFocus: typeof input.useFocus === "boolean" ? input.useFocus : project.useFocus,
        focusX: input.focusX ?? project.focusX,
        focusY: input.focusY ?? project.focusY,
        exportSlots: slots,
      },
    ],
  });
  if (!applied.ok) {
    return { ok: false, message: applied.error, steps, warnings, finishSurface };
  }
  project = applied.project;
  warnings.push(...applied.warnings);

  steps.push("Confirm render");
  const rendered = await renderPhotoEditProject({
    projectId: project.id,
  });
  if (!rendered.ok || !rendered.assemblies?.length) {
    return {
      ok: false,
      message: rendered.message || "Confirm render produced no assemblies.",
      steps,
      warnings: [...warnings, ...(rendered.warnings ?? [])],
      projectId: project.id,
      assemblies: rendered.assemblies,
      finishSurface,
    };
  }
  warnings.push(...(rendered.warnings ?? []));

  // Social = download pack only — no public override / ship / curate.
  if (finishSurface === "social") {
    steps.push("Download pack");
    return {
      ok: true,
      message: `Social pack ready · ${rendered.assemblies.length} assembl(ies) — open downloads (no public promote). Prefer Unknown.`,
      steps,
      warnings,
      projectId: project.id,
      assemblies: listPhotoAssemblies(photoId),
      finishSurface,
    };
  }

  const assembly = pickAssembly(
    rendered.assemblies,
    rendered.promoteSuggestion ?? project.promoteSuggestion,
  );
  if (!assembly) {
    return {
      ok: false,
      message: "No assembly available to promote.",
      steps,
      warnings,
      projectId: project.id,
      assemblies: rendered.assemblies,
      finishSurface,
    };
  }

  applySurfaceFlags({
    photoId,
    finishSurface,
    homepageCandidate: input.homepageCandidate,
    featuredPhoto: input.featuredPhoto,
    heroLevel: input.heroLevel,
    approvedForPublic: input.approvedForPublic,
  });

  steps.push("Promote");
  const promoted = promotePhotoDerivative({
    photoId,
    publicSrc: assembly.publicSrc,
    setAsPublicSrc: true,
    homepageCandidate:
      input.homepageCandidate ??
      (finishSurface === "homepage" || finishSurface === "journey" ? true : false),
    featuredPhoto: input.featuredPhoto,
    heroLevel: input.heroLevel ?? (finishSurface === "homepage" ? "FEATURE" : undefined),
    approvedForPublic:
      input.approvedForPublic ?? (finishSurface === "album" ? true : undefined),
    consentConfirmed: input.consentConfirmed,
  });
  if (!promoted.ok) {
    return {
      ok: false,
      message: promoted.message,
      steps,
      warnings,
      projectId: project.id,
      assemblies: rendered.assemblies,
      placementPreview: promoted.placementPreview,
      finishSurface,
    };
  }

  steps.push("Ship");
  const shipped = shipPromotedDerivatives({
    confirmShip: true,
    photoIds: [photoId],
    limit: 4,
  });
  if (!shipped.ok || !shipped.shipped.length) {
    const skipReason = shipped.skipped.map((s) => s.reason).join("; ") || shipped.message;
    const overlay = loadPhotoEvidenceStore().photos[photoId];
    const src = String(overlay?.publicSrcOverride ?? "").trim();
    const already =
      src.startsWith(`/media/campaign-shipped/${photoId}/`) ||
      shipped.skipped.some((s) => s.reason.toLowerCase().includes("already"));
    if (!already) {
      return {
        ok: false,
        message: `Promoted but Ship failed — public readers reject unshipped derivatives. ${skipReason}`,
        steps,
        warnings: [...warnings, skipReason],
        projectId: project.id,
        publicSrc: promoted.publicSrc,
        placementPreview: promoted.placementPreview,
        assemblies: listPhotoAssemblies(photoId),
        finishSurface,
      };
    }
    warnings.push(skipReason || "Already shipped.");
  }

  const finalSrc =
    shipped.shipped[0]?.to ??
    loadPhotoEvidenceStore().photos[photoId]?.publicSrcOverride ??
    promoted.publicSrc;

  let curateProposal: CuratedPlacementProposal | null = null;
  const wantCurate =
    input.proposeCurate !== false && curateSurfaceForFinish(finishSurface) != null;
  if (wantCurate) {
    const curateSurface = curateSurfaceForFinish(finishSurface)!;
    steps.push("Curate proposal");
    const curated = proposeCuratedPlacementForPhoto({
      photoId,
      surface: curateSurface,
      persist: true,
    });
    warnings.push(...curated.warnings);
    if (curated.ok && curated.proposal) {
      curateProposal = curated.proposal;
    } else {
      warnings.push(curated.message || "Curate proposal skipped.");
    }
  } else if (finishSurface === "album") {
    warnings.push(
      "Album surface: eligibility is Approve + known county (no HOMEPAGE_* curate file).",
    );
  }

  return {
    ok: true,
    message: [
      `Finished for web · ${finishSurface} · ${steps.join(" → ")}`,
      finalSrc ? `live src ${finalSrc}` : null,
      curateProposal ? `curate ${curateProposal.id} (pending confirmCurate)` : null,
      "Commit overlays + campaign-shipped to deploy.",
    ]
      .filter(Boolean)
      .join(" · "),
    steps,
    warnings,
    projectId: project.id,
    publicSrc: finalSrc,
    placementPreview: promoted.placementPreview,
    assemblies: listPhotoAssemblies(photoId),
    curateProposalId: curateProposal?.id,
    finishSurface,
  };
}
