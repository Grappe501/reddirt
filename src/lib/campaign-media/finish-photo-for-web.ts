/**
 * P0 — Finish photo for web: Apply meta → Confirm render → Promote → Ship.
 * One confirm-gated path so operators don't leave gitignored derivatives as publicSrc.
 * Prefer Unknown; never overwrites originals; never silent.
 */
import "server-only";

import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
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
}): Promise<FinishPhotoForWebResult> {
  const steps: string[] = [];
  const warnings: string[] = [];
  const photoId = String(input.photoId ?? "").trim();

  if (!input.confirmFinish) {
    return {
      ok: false,
      message: "confirmFinish:true required — refuse silent Finish for web.",
      steps,
      warnings: ["Silent finish blocked."],
    };
  }
  if (!photoId) {
    return { ok: false, message: "photoId required.", steps, warnings: ["Missing photoId."] };
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
    return { ok: false, message: applied.error, steps, warnings };
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
    };
  }
  warnings.push(...(rendered.warnings ?? []));

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
    };
  }

  steps.push("Promote");
  const promoted = promotePhotoDerivative({
    photoId,
    publicSrc: assembly.publicSrc,
    setAsPublicSrc: true,
    homepageCandidate: input.homepageCandidate,
    featuredPhoto: input.featuredPhoto,
    heroLevel: input.heroLevel,
    approvedForPublic: input.approvedForPublic,
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
    // Already shipped is OK
    const overlay = loadPhotoEvidenceStore().photos[photoId];
    const src = String(overlay?.publicSrcOverride ?? "").trim();
    const already =
      src.startsWith(`/media/campaign-shipped/${photoId}/`) ||
      shipped.skipped.some((s) => s.reason.toLowerCase().includes("already"));
    if (!already) {
      return {
        ok: false,
        message: `Promoted but Ship failed — public would 404 on Netlify. ${skipReason}`,
        steps,
        warnings: [...warnings, skipReason],
        projectId: project.id,
        publicSrc: promoted.publicSrc,
        placementPreview: promoted.placementPreview,
        assemblies: listPhotoAssemblies(photoId),
      };
    }
    warnings.push(skipReason || "Already shipped.");
  }

  const finalSrc =
    shipped.shipped[0]?.to ??
    loadPhotoEvidenceStore().photos[photoId]?.publicSrcOverride ??
    promoted.publicSrc;

  return {
    ok: true,
    message: `Finished for web · ${steps.join(" → ")} · live src ${finalSrc}. Commit overlays + campaign-shipped to deploy.`,
    steps,
    warnings,
    projectId: project.id,
    publicSrc: finalSrc,
    placementPreview: promoted.placementPreview,
    assemblies: listPhotoAssemblies(photoId),
  };
}
