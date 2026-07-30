"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition, type MouseEvent } from "react";
import {
  batchCreatePhotoDerivativesAction,
  batchPublishPhotosAction,
  batchSavePhotoEvidenceAction,
  buildPhotoMetadataPacketAction,
  clearPhotoPublicSrcOverrideAction,
  clusterPhotoSelectionAction,
  createDerivativeFromCropAdviceAction,
  createPhotoDerivativeAction,
  applyTurboProposalAction,
  getTurboProposalAction,
  inspectPhotoPixelsAction,
  listEvidenceBatchOpsAction,
  listPhotoDerivativesAction,
  listPhotoEditProjectsAction,
  lookupOwnedMediaForPhotoAction,
  previewPromotePlacementAction,
  previewPhotoEditPackAction,
  promotePhotoDerivativeAction,
  proposePhotoEditProjectAction,
  renderPhotoEditProjectAction,
  updatePhotoEditProjectAction,
  softArchivePhotoAssembliesAction,
  savePhotoEvidenceAction,
  savePhotoFocusAction,
  suggestBatchPhotoEvidenceAiAction,
  suggestCropPlanAction,
  suggestPhotoEvidenceAiAction,
  undoBatchPublishAction,
} from "@/app/admin/evidence-workbench-actions";
import type { OwnedMediaEvidenceLink } from "@/lib/campaign-media/owned-media-evidence-link";
import { parsePhotosUrlFilter } from "@/lib/campaign-media/evidence-workbench-deep-links";
import type { BatchPhotoAiProposal } from "@/lib/campaign-media/evidence-ai-types";
import type { EvidenceBatchOperation } from "@/lib/campaign-media/evidence-batch-ops";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import type { TurboPhotoProposal } from "@/lib/campaign-media/turbo-ingest-types";
import { clickToFocusPoint, type FocusPoint } from "@/lib/campaign-media/focus-crop";
import type { PhotoDerivativeRecord } from "@/lib/campaign-media/media-derivatives-types";
import type {
  PhotoAssemblyRecord,
  PhotoEditProject,
} from "@/lib/campaign-media/photo-edit-types";
import type { PhotoExportSlot, PhotoLookPreset } from "@/lib/campaign-media/photo-look-presets";
import { EVIDENCE_FIELD_CLASS } from "@/components/admin/evidence-workbench/field-styles";
import {
  ewChipClass,
  ewPanelClass,
  ewPanelTitleClass,
} from "@/components/admin/evidence-workbench/evidenceWorkbenchChrome";
import { EvidenceAiModePanel } from "@/components/admin/evidence-workbench/EvidenceAiModePanel";
import type { EvidenceAiMode } from "@/lib/campaign-media/evidence-ai-modes";
import { isEditableKeyboardTarget } from "@/components/admin/evidence-workbench/keyboard";

function focusPointToMarker(
  img: HTMLImageElement,
  point: FocusPoint,
): { left: number; top: number } | null {
  const ew = img.clientWidth;
  const eh = img.clientHeight;
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (nw <= 0 || nh <= 0 || ew <= 0 || eh <= 0) return null;
  const scale = Math.min(ew / nw, eh / nh);
  const dispW = nw * scale;
  const dispH = nh * scale;
  const ox = (ew - dispW) / 2;
  const oy = (eh - dispH) / 2;
  return { left: ox + point.x * dispW, top: oy + point.y * dispH };
}

const BATCH_FIELD_OPTIONS: Array<{ key: string; label: string }> = [
  { key: "county", label: "County" },
  { key: "city", label: "City" },
  { key: "venue", label: "Venue" },
  { key: "eventDate", label: "Event date" },
  { key: "eventName", label: "Event name" },
  { key: "photographer", label: "Photographer" },
  { key: "peopleVisible", label: "People" },
  { key: "whatThisProves", label: "What this proves" },
  { key: "approvedForPublic", label: "Approved for public" },
  { key: "homepageCandidate", label: "Homepage candidate" },
  { key: "featuredPhoto", label: "Featured" },
  { key: "heroLevel", label: "Hero level" },
  { key: "tierIntent", label: "Tier" },
  { key: "publicationStatus", label: "Publication" },
];

const DEFAULT_BATCH_FIELDS = new Set([
  "county",
  "city",
  "venue",
  "eventDate",
  "eventName",
  "photographer",
]);

const BATCH_DERIV_OPTIONS: Array<{ key: string; label: string }> = [
  { key: "web_max", label: "Web" },
  { key: "thumb", label: "Thumb" },
  { key: "hero_16x9", label: "Hero 16:9" },
  { key: "square_1x1", label: "Square" },
  { key: "portrait_4x5", label: "Portrait 4:5" },
  { key: "auto_orient", label: "Auto-orient" },
];

const DEFAULT_BATCH_DERIV = new Set(["web_max", "thumb"]);

export type PhotoWorkbenchItem = {
  id: string;
  src: string;
  /** Registry original under campaign-photos (unchanged by promote). */
  registrySrc?: string;
  caption: string;
  alt: string;
  notes?: string;
  requiresConsentHold?: boolean;
  placementPreview: string[];
  base: {
    county: string;
    city: string;
    venue: string;
    eventDate: string;
    eventName: string;
    photographer: string;
    peopleVisible: string[];
    homepageCandidate: boolean;
    featuredPhoto: boolean;
    heroLevel: string;
    publicationStatus: string;
    approvedForPublic?: boolean;
  };
  overlay: PhotoEvidenceOverlay | null;
};

type CountyOpt = { slug: string; displayName: string; shortName: string };

type Filter =
  | "all"
  | "unknown"
  | "needsApproval"
  | "draft"
  | "approved"
  | "homepage"
  | "needsPromote";

const FILTER_IDS: Filter[] = [
  "all",
  "unknown",
  "needsApproval",
  "draft",
  "approved",
  "homepage",
  "needsPromote",
];

function parseFilter(raw?: string): Filter {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (v === "needspromote" || v === "needs-promote" || v === "promote") return "needsPromote";
  const normalized = parsePhotosUrlFilter(raw);
  return FILTER_IDS.includes(normalized as Filter) ? (normalized as Filter) : "all";
}

type Props = {
  photos: PhotoWorkbenchItem[];
  counties: CountyOpt[];
  initialPhotoId?: string;
  initialFilter?: string;
  /** Assembly ready, not yet publicSrcOverride — stage strip Needs Promote. */
  needsPromoteIds?: string[];
  stageCounts?: {
    intake: number;
    unknown: number;
    needsApproval: number;
    needsPromote: number;
    approved: number;
  };
};

type PhotoFormState = {
  county: string;
  city: string;
  venue: string;
  eventDate: string;
  eventName: string;
  photographer: string;
  peopleVisible: string;
  whatThisProves: string;
  approvedForPublic: boolean;
  homepageCandidate: boolean;
  featuredPhoto: boolean;
  heroLevel: string;
  tierIntent: "" | "Gold" | "Silver" | "Archive";
  publicationStatus: string;
  consentConfirmed: boolean;
};

function field(overlay: PhotoEvidenceOverlay | null, base: string, key: keyof PhotoEvidenceOverlay): string {
  const o = overlay?.[key];
  if (typeof o === "string" && o.trim()) return o;
  return base === "Unknown" ? "" : base;
}

function effectiveCounty(item: PhotoWorkbenchItem): string {
  return ((item.overlay?.county ?? item.base.county) || "Unknown").trim() || "Unknown";
}

function effectiveApproved(item: PhotoWorkbenchItem): boolean {
  if (item.overlay?.approvedForPublic !== undefined) return item.overlay.approvedForPublic;
  return Boolean(item.base.approvedForPublic);
}

function effectivePub(item: PhotoWorkbenchItem): string {
  return item.overlay?.publicationStatus ?? item.base.publicationStatus;
}

function buildForm(photo: PhotoWorkbenchItem): PhotoFormState {
  const o = photo.overlay;
  return {
    county: field(o, photo.base.county, "county"),
    city: field(o, photo.base.city, "city"),
    venue: field(o, photo.base.venue, "venue"),
    eventDate: field(o, photo.base.eventDate, "eventDate"),
    eventName: field(o, photo.base.eventName, "eventName"),
    photographer: field(o, photo.base.photographer, "photographer"),
    peopleVisible: (o?.peopleVisible?.length ? o.peopleVisible : photo.base.peopleVisible).join(", "),
    whatThisProves: o?.whatThisProves ?? "",
    approvedForPublic: o?.approvedForPublic ?? photo.base.approvedForPublic ?? false,
    homepageCandidate: o?.homepageCandidate ?? photo.base.homepageCandidate,
    featuredPhoto: o?.featuredPhoto ?? photo.base.featuredPhoto,
    heroLevel: o?.heroLevel ?? photo.base.heroLevel,
    tierIntent: (o?.tierIntent as PhotoFormState["tierIntent"]) ?? "",
    publicationStatus: o?.publicationStatus ?? photo.base.publicationStatus,
    consentConfirmed: false,
  };
}

export function EvidencePhotosPanel({
  photos,
  counties,
  initialPhotoId,
  initialFilter,
  needsPromoteIds = [],
  stageCounts,
}: Props) {
  const [filter, setFilter] = useState<Filter>(() => parseFilter(initialFilter));
  const promoteSet = useMemo(() => new Set(needsPromoteIds), [needsPromoteIds]);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(
    () => initialPhotoId || photos[0]?.id || "",
  );
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [aiMode, setAiMode] = useState<EvidenceAiMode>("identify");
  const [dirty, setDirty] = useState(false);
  const [derivatives, setDerivatives] = useState<PhotoDerivativeRecord[]>([]);
  const [editProject, setEditProject] = useState<PhotoEditProject | null>(null);
  const [assemblies, setAssemblies] = useState<PhotoAssemblyRecord[]>([]);
  const [proLook, setProLook] = useState<PhotoLookPreset>("warm");
  const [proSharpen, setProSharpen] = useState(false);
  const [proUseFocus, setProUseFocus] = useState(true);
  const [proSlots, setProSlots] = useState<PhotoExportSlot[]>([
    "grade_full",
    "hero_16x9",
    "portrait_4x5",
    "square_1x1",
    "story_9x16",
    "web_max",
    "thumb",
  ]);
  const [proRenderNote, setProRenderNote] = useState("");
  const [proPreviewSrc, setProPreviewSrc] = useState<string | null>(null);
  const [proPreviewNote, setProPreviewNote] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null);
  const [batchOps, setBatchOps] = useState<EvidenceBatchOperation[]>([]);
  const [turboProposal, setTurboProposal] = useState<TurboPhotoProposal | null>(null);
  const [batchFields, setBatchFields] = useState<Set<string>>(() => new Set(DEFAULT_BATCH_FIELDS));
  const [proposal, setProposal] = useState<BatchPhotoAiProposal | null>(null);
  const [clusterNote, setClusterNote] = useState("");
  const [batchDerivKinds, setBatchDerivKinds] = useState<Set<string>>(
    () => new Set(DEFAULT_BATCH_DERIV),
  );
  const [derivProgress, setDerivProgress] = useState("");
  const [promoteHomepage, setPromoteHomepage] = useState(true);
  const [promoteFeatured, setPromoteFeatured] = useState(false);
  const [promoteHero, setPromoteHero] = useState<"FEATURE" | "HERO" | "">("FEATURE");
  const [promoteApproved, setPromoteApproved] = useState(false);
  const [promotePreview, setPromotePreview] = useState<string[]>([]);
  const [focus, setFocus] = useState<FocusPoint | null>(null);
  const [focusMarker, setFocusMarker] = useState<{ left: number; top: number } | null>(null);
  const [cropAdvice, setCropAdvice] = useState("");
  const [ownedMediaLink, setOwnedMediaLink] = useState<OwnedMediaEvidenceLink | null>(null);
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const [form, setForm] = useState<PhotoFormState | null>(() => {
    const first = photos.find((p) => p.id === (initialPhotoId || photos[0]?.id));
    return first ? buildForm(first) : null;
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return photos.filter((p) => {
      const county = effectiveCounty(p);
      const approved = effectiveApproved(p);
      const pub = effectivePub(p);
      if (filter === "unknown" && county !== "Unknown") return false;
      if (filter === "needsApproval" && (approved || pub === "APPROVED" || pub === "PUBLISHED")) return false;
      if (filter === "draft" && !(pub === "DRAFT" || pub === "IN_REVIEW")) return false;
      if (filter === "approved" && !(approved || pub === "APPROVED" || pub === "PUBLISHED")) return false;
      if (filter === "homepage" && !(p.overlay?.homepageCandidate ?? p.base.homepageCandidate)) return false;
      if (filter === "needsPromote" && !promoteSet.has(p.id)) return false;
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        p.caption.toLowerCase().includes(q) ||
        p.src.toLowerCase().includes(q) ||
        county.toLowerCase().includes(q) ||
        (p.overlay?.eventName ?? p.base.eventName).toLowerCase().includes(q)
      );
    });
  }, [photos, filter, query, promoteSet]);

  const filteredIds = useMemo(() => filtered.map((p) => p.id), [filtered]);

  // If the active photo falls out of the filter, jump to the first visible id.
  useEffect(() => {
    if (filteredIds.length === 0) {
      setForm(null);
      return;
    }
    if (!filteredIds.includes(activeId)) {
      setActiveId(filteredIds[0]);
    }
  }, [filteredIds, activeId]);

  // Load form + clear dirty only when the active photo id changes (Prev/Next).
  useEffect(() => {
    const item = photos.find((p) => p.id === activeId) ?? filtered.find((p) => p.id === activeId);
    if (!item) return;
    setForm(buildForm(item));
    setDirty(false);
    setMessage("");
    setPromotePreview([]);
    setCropAdvice(item.overlay?.cropAdviceNote ?? "");
    setFocusMarker(null);
    if (
      typeof item.overlay?.focusX === "number" &&
      typeof item.overlay?.focusY === "number"
    ) {
      setFocus({ x: item.overlay.focusX, y: item.overlay.focusY });
    } else {
      setFocus(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navigate-only reload; photos refresh handled below
  }, [activeId]);

  useEffect(() => {
    void listEvidenceBatchOpsAction().then((res) => {
      setBatchOps(res.operations ?? []);
    });
  }, []);

  useEffect(() => {
    if (!activeId) {
      setTurboProposal(null);
      return;
    }
    let cancelled = false;
    void getTurboProposalAction(activeId).then((res) => {
      if (cancelled) return;
      setTurboProposal(res.proposal ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    if (!activeId) {
      setOwnedMediaLink(null);
      return;
    }
    let cancelled = false;
    void lookupOwnedMediaForPhotoAction(activeId).then((res) => {
      if (cancelled) return;
      setOwnedMediaLink(res.link ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Soft-refresh form from server props when overlays update and the operator is not mid-edit.
  useEffect(() => {
    if (dirty) return;
    const item = photos.find((p) => p.id === activeId);
    if (!item) return;
    setForm(buildForm(item));
  }, [photos, activeId, dirty]);

  useEffect(() => {
    if (!activeId) {
      setDerivatives([]);
      setEditProject(null);
      setAssemblies([]);
      setProRenderNote("");
      return;
    }
    let cancelled = false;
    void listPhotoDerivativesAction(activeId).then((res) => {
      if (cancelled) return;
      setDerivatives(res.derivatives ?? []);
    });
    void listPhotoEditProjectsAction(activeId).then((res) => {
      if (cancelled) return;
      setEditProject(res.projects?.[0] ?? null);
      setAssemblies(res.assemblies ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const photo = filtered.find((p) => p.id === activeId) ?? photos.find((p) => p.id === activeId) ?? null;
  const index = photo ? filteredIds.indexOf(photo.id) : -1;

  function selectPhoto(nextId: string) {
    if (nextId === activeId) return;
    if (dirty && !window.confirm("Discard unsaved photo edits?")) return;
    setActiveId(nextId);
  }

  function go(delta: number) {
    if (index < 0) return;
    const next = filteredIds[index + delta];
    if (!next) return;
    selectPhoto(next);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isEditableKeyboardTarget(e.target)) return;
      if (e.key === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight" || e.key === "k") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        save();
      }
      if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        if (photo) toggleSelected(photo.id);
      }
      if (e.key === "a" || e.key === "A") {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        selectAllFiltered();
      }
      if (e.key === "Escape") {
        clearSelection();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIds, activeId, dirty, form, photo, selectedIds]);

  useEffect(() => {
    const img = previewImgRef.current;
    if (!img || !focus) {
      setFocusMarker(null);
      return;
    }
    setFocusMarker(focusPointToMarker(img, focus));
  }, [focus, activeId, photo?.src]);

  if (!photo || !form) {
    return (
      <div className="space-y-3">
        <FilterBar query={query} setQuery={setQuery} counts={filtered.length} />
        <p className="font-body text-sm text-[#364272]">No photos match this filter.</p>
      </div>
    );
  }

  function patchForm<K extends keyof PhotoFormState>(key: K, value: PhotoFormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
  }

  function save() {
    if (!form || !photo) return;
    const photoId = photo.id;
    const snapshot = form;
    start(async () => {
      const fd = new FormData();
      fd.set("photoId", photoId);
      fd.set("county", snapshot.county || "Unknown");
      fd.set("city", snapshot.city || "Unknown");
      fd.set("venue", snapshot.venue || "Unknown");
      fd.set("eventDate", snapshot.eventDate || "Unknown");
      fd.set("eventName", snapshot.eventName || "Unknown");
      fd.set("photographer", snapshot.photographer || "Unknown");
      fd.set("peopleVisible", snapshot.peopleVisible);
      fd.set("whatThisProves", snapshot.whatThisProves);
      if (snapshot.approvedForPublic) fd.set("approvedForPublic", "on");
      if (snapshot.homepageCandidate) fd.set("homepageCandidate", "on");
      if (snapshot.featuredPhoto) fd.set("featuredPhoto", "on");
      if (snapshot.consentConfirmed) fd.set("consentConfirmed", "on");
      fd.set("heroLevel", snapshot.heroLevel);
      fd.set("tierIntent", snapshot.tierIntent);
      fd.set("publicationStatus", snapshot.publicationStatus);
      const res = await savePhotoEvidenceAction(null, fd);
      setMessage(res.message);
      if (res.ok) setDirty(false);
    });
  }

  function suggestAi() {
    if (!photo) return;
    const photoId = photo.id;
    const mode = aiMode;
    start(async () => {
      const res = await suggestPhotoEvidenceAiAction(photoId, mode);
      setMessage(res.message);
      if (!res.ok || !res.suggestion) return;
      const s = res.suggestion;
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          county: s.county === "Unknown" ? prev.county : s.county,
          city: s.city === "Unknown" ? prev.city : s.city,
          venue: s.venue === "Unknown" ? prev.venue : s.venue,
          eventDate: s.eventDate === "Unknown" ? prev.eventDate : s.eventDate,
          eventName: s.eventName === "Unknown" ? prev.eventName : s.eventName,
          photographer: s.photographer === "Unknown" ? prev.photographer : s.photographer,
          peopleVisible: s.peopleVisible.length ? s.peopleVisible.join(", ") : prev.peopleVisible,
          whatThisProves: s.whatThisProves || prev.whatThisProves,
        };
      });
      setDirty(true);
      const extras: string[] = [];
      if (s.toolsUsed?.length) extras.push(`Tools: ${s.toolsUsed.join(", ")}`);
      if (s.sceneTags?.length) extras.push(`Scene: ${s.sceneTags.join(", ")}`);
      if (s.altTextDraft) extras.push(`Alt draft: ${s.altTextDraft}`);
      if (s.cropAdvice) {
        extras.push(`Crop: ${s.cropAdvice}`);
        setCropAdvice(s.cropAdvice);
      }
      if (s.warnings.length) extras.push(`Warnings: ${s.warnings.join("; ")}`);
      if (extras.length) setMessage(`${res.message}\n${extras.join("\n")}`);
    });
  }

  function buildPacket() {
    if (!form || !photo) return;
    const photoId = photo.id;
    const snapshot = form;
    const confirmed = Boolean(
      snapshot.county?.trim() &&
        snapshot.county !== "Unknown" &&
        snapshot.city?.trim() &&
        snapshot.city !== "Unknown",
    );
    start(async () => {
      const res = await buildPhotoMetadataPacketAction(photoId, confirmed);
      setMessage(res.message);
      const linkRes = await lookupOwnedMediaForPhotoAction(photoId);
      if (linkRes.link) setOwnedMediaLink(linkRes.link);
    });
  }

  function refreshDerivatives(photoId: string) {
    void listPhotoDerivativesAction(photoId).then((res) => {
      setDerivatives(res.derivatives ?? []);
    });
  }

  function runDerivative(kind: string) {
    if (!photo) return;
    const photoId = photo.id;
    start(async () => {
      const res = await createPhotoDerivativeAction(photoId, kind, {
        focusX: focus?.x,
        focusY: focus?.y,
      });
      setMessage(res.message);
      if (res.ok) refreshDerivatives(photoId);
    });
  }

  function onPreviewClick(e: MouseEvent<HTMLImageElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const point = clickToFocusPoint({
      clientX: e.clientX,
      clientY: e.clientY,
      elementLeft: rect.left,
      elementTop: rect.top,
      elementWidth: rect.width,
      elementHeight: rect.height,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
    });
    if (!point || !photo) return;
    setFocus(point);
    setFocusMarker(focusPointToMarker(el, point));
    start(async () => {
      const res = await savePhotoFocusAction({
        photoId: photo.id,
        focusX: point.x,
        focusY: point.y,
        cropAdviceNote: cropAdvice || undefined,
      });
      setMessage(res.message);
    });
  }

  function runFocusCrop(kind: string) {
    if (!photo) return;
    if (!focus) {
      setMessage("Click the photo to set a focus point first.");
      return;
    }
    runDerivative(kind);
  }

  function applyCropAdvice() {
    if (!photo) return;
    const advice = cropAdvice.trim();
    if (!advice) {
      setMessage("No cropAdvice yet — run Suggest with AI first, or type advice.");
      return;
    }
    const photoId = photo.id;
    start(async () => {
      const res = await createDerivativeFromCropAdviceAction({
        photoId,
        cropAdvice: advice,
        focusX: focus?.x,
        focusY: focus?.y,
      });
      setMessage(res.message);
      if (res.ok) refreshDerivatives(photoId);
    });
  }

  function runInspect() {
    if (!photo) return;
    const photoId = photo.id;
    start(async () => {
      const res = await inspectPhotoPixelsAction(photoId);
      setMessage(res.message);
    });
  }

  function runCropPlan() {
    if (!photo) return;
    const photoId = photo.id;
    start(async () => {
      const res = await suggestCropPlanAction(photoId);
      setMessage(res.message);
    });
  }

  function proposeProEdit() {
    if (!photo) return;
    const photoId = photo.id;
    const slots = proSlots.length ? proSlots : (["web_max"] as PhotoExportSlot[]);
    start(async () => {
      const res = await proposePhotoEditProjectAction({
        photoId,
        look: proLook,
        useFocus: proUseFocus,
        focusX: focus?.x,
        focusY: focus?.y,
        sharpen: proSharpen,
        exportSlots: slots,
      });
      setMessage(res.message);
      setProPreviewSrc(null);
      if (res.packet?.project) {
        setEditProject(res.packet.project);
        setProSlots(res.packet.project.exportSlots);
      }
      const notes = [
        ...(res.packet?.warnings ?? []),
        ...(res.packet?.nextActions ?? []),
      ].filter(Boolean);
      setProRenderNote(notes.slice(0, 4).join(" · "));
    });
  }

  function toggleProSlot(slot: PhotoExportSlot) {
    setProSlots((prev) => {
      if (prev.includes(slot)) {
        const next = prev.filter((s) => s !== slot);
        return next.length ? next : (["web_max"] as PhotoExportSlot[]);
      }
      return [...prev, slot];
    });
  }

  function applyProMeta() {
    if (!editProject) return;
    const projectId = editProject.id;
    start(async () => {
      const res = await updatePhotoEditProjectAction({
        projectId,
        updates: [
          {
            op: "set_meta",
            look: proLook,
            sharpen: proSharpen,
            useFocus: proUseFocus,
            focusX: focus?.x,
            focusY: focus?.y,
            exportSlots: proSlots.length ? proSlots : ["web_max"],
          },
        ],
      });
      setMessage(res.message);
      if (res.warnings?.length) setProRenderNote(res.warnings.join(" · "));
      if (res.ok && res.project) {
        setEditProject(res.project);
        setProSlots(res.project.exportSlots);
        setProPreviewSrc(null);
      }
    });
  }

  function previewProPack() {
    if (!editProject) {
      setMessage("Propose a Photo Pro Edit project first.");
      return;
    }
    const projectId = editProject.id;
    start(async () => {
      const res = await previewPhotoEditPackAction({
        projectId,
        slot: editProject.promoteSuggestion ?? undefined,
      });
      setMessage(res.message);
      if (res.ok && res.publicSrc) {
        setProPreviewSrc(res.publicSrc);
        setProPreviewNote(res.previewNote ?? "");
      } else {
        setProPreviewSrc(null);
        setProPreviewNote(res.message);
      }
    });
  }

  function confirmProRender() {
    if (!editProject) {
      setMessage("Propose a Photo Pro Edit project first.");
      return;
    }
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Confirm render ${editProject.exportSlots.length} slot(s) · look ${editProject.look}? Originals stay untouched.`,
      )
    ) {
      return;
    }
    const projectId = editProject.id;
    const photoId = editProject.photoId;
    setProRenderNote("Rendering assembly pack…");
    start(async () => {
      const res = await renderPhotoEditProjectAction({ projectId, confirmRender: true });
      setMessage(res.message);
      setProRenderNote(
        [
          res.message,
          ...(res.warnings ?? []),
          res.promoteSuggestion ? `Promote suggestion: ${res.promoteSuggestion}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
      );
      if (res.assemblies?.length) setAssemblies(res.assemblies);
      const listed = await listPhotoEditProjectsAction(photoId);
      setAssemblies(listed.assemblies ?? res.assemblies ?? []);
      setEditProject(listed.projects?.find((p) => p.id === projectId) ?? editProject);
      refreshDerivatives(photoId);
    });
  }

  function softArchiveProAssemblies() {
    if (!photo && !editProject) return;
    start(async () => {
      const res = await softArchivePhotoAssembliesAction({
        projectId: editProject?.id,
        photoId: photo?.id,
        confirmArchive: true,
      });
      setMessage(res.message);
      setProRenderNote(res.message);
      if (photo?.id) {
        const listed = await listPhotoEditProjectsAction(photo.id);
        setAssemblies(listed.assemblies ?? []);
      }
    });
  }

  function promoteAssembly(a: PhotoAssemblyRecord) {
    if (!photo) return;
    const photoId = photo.id;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Promote ${a.slot} assembly to public src?\n${a.publicSrc}\nOriginals stay untouched.`,
      )
    ) {
      return;
    }
    start(async () => {
      const res = await promotePhotoDerivativeAction({
        photoId,
        publicSrc: a.publicSrc,
        setAsPublicSrc: true,
        homepageCandidate: promoteHomepage,
        featuredPhoto: promoteFeatured,
        heroLevel: promoteHero || undefined,
        approvedForPublic: promoteApproved,
        consentConfirmed: Boolean(form?.consentConfirmed),
      });
      setMessage(res.message);
      if (res.placementPreview) setPromotePreview(res.placementPreview);
      refreshDerivatives(photoId);
    });
  }

  function promoteDerivative(d: PhotoDerivativeRecord) {
    if (!photo || !form) return;
    const photoId = photo.id;
    const snapshot = form;
    start(async () => {
      const preview = await previewPromotePlacementAction({
        photoId,
        publicSrcOverride: d.publicSrc,
        homepageCandidate: promoteHomepage,
        featuredPhoto: promoteFeatured,
        heroLevel: promoteHero || undefined,
        approvedForPublic: promoteApproved ? true : undefined,
      });
      if (preview.ok && preview.placementPreview) {
        setPromotePreview(preview.placementPreview);
      }
      const confirmLines = [
        `Promote ${d.kind} as public src for ${photoId}?`,
        `→ ${d.publicSrc}`,
        promoteHomepage ? "· homepage candidate" : null,
        promoteFeatured ? "· featured" : null,
        promoteHero ? `· hero ${promoteHero}` : null,
        promoteApproved ? "· approved for public" : null,
        preview.placementPreview?.length
          ? `Surfaces: ${preview.placementPreview.join("; ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
      if (!window.confirm(confirmLines)) return;

      const res = await promotePhotoDerivativeAction({
        photoId,
        derivativeId: d.id,
        publicSrc: d.publicSrc,
        setAsPublicSrc: true,
        homepageCandidate: promoteHomepage,
        featuredPhoto: promoteFeatured,
        heroLevel: promoteHero || undefined,
        approvedForPublic: promoteApproved ? true : undefined,
        consentConfirmed: snapshot.consentConfirmed,
      });
      setMessage(res.message);
      if (res.placementPreview) setPromotePreview(res.placementPreview);
      if (res.ok) {
        setForm((prev) =>
          prev
            ? {
                ...prev,
                homepageCandidate: promoteHomepage ? true : prev.homepageCandidate,
                featuredPhoto: promoteFeatured ? true : prev.featuredPhoto,
                heroLevel: promoteHero || prev.heroLevel,
                approvedForPublic: promoteApproved ? true : prev.approvedForPublic,
              }
            : prev,
        );
      }
    });
  }

  function clearPublicOverride() {
    if (!photo) return;
    const photoId = photo.id;
    if (!window.confirm(`Clear public src override for ${photoId} and restore registry original?`)) {
      return;
    }
    start(async () => {
      const res = await clearPhotoPublicSrcOverrideAction(photoId);
      setMessage(res.message);
      if (res.placementPreview) setPromotePreview(res.placementPreview);
    });
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setSelectionAnchorId(id);
  }

  function selectAllFiltered() {
    setSelectedIds(filteredIds.slice(0, 80));
    setSelectionAnchorId(filteredIds[0] ?? null);
  }

  function clearSelection() {
    setSelectedIds([]);
    setSelectionAnchorId(null);
  }

  function selectFilmstripPhoto(id: string, e: MouseEvent) {
    if (e.shiftKey && selectionAnchorId) {
      const a = filteredIds.indexOf(selectionAnchorId);
      const b = filteredIds.indexOf(id);
      if (a >= 0 && b >= 0) {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        setSelectedIds(filteredIds.slice(lo, hi + 1).slice(0, 80));
        selectPhoto(id);
        return;
      }
    }
    if (e.metaKey || e.ctrlKey) {
      toggleSelected(id);
      selectPhoto(id);
      return;
    }
    setSelectionAnchorId(id);
    selectPhoto(id);
  }

  function refreshBatchOps() {
    void listEvidenceBatchOpsAction().then((res) => {
      setBatchOps(res.operations ?? []);
    });
  }

  function undoLastPublish() {
    start(async () => {
      const res = await undoBatchPublishAction();
      setMessage(res.message);
      refreshBatchOps();
    });
  }

  function undoPublishRun(runId: string) {
    start(async () => {
      const res = await undoBatchPublishAction({ runId });
      setMessage(res.message);
      refreshBatchOps();
    });
  }

  function applyTurbo(opts: { identify?: boolean; fit?: boolean }) {
    if (!photo || !turboProposal) return;
    const photoId = photo.id;
    const proposal = turboProposal;
    start(async () => {
      const res = await applyTurboProposalAction({
        photoId,
        applyIdentify: Boolean(opts.identify),
        applyFitFlags: Boolean(opts.fit),
      });
      setMessage(res.message);
      const again = await getTurboProposalAction(photoId);
      setTurboProposal(again.proposal ?? null);
      if (opts.identify && proposal.identify) {
        const s = proposal.identify;
        setForm((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            county: s.county !== "Unknown" ? s.county : prev.county,
            city: s.city !== "Unknown" ? s.city : prev.city,
            venue: s.venue !== "Unknown" ? s.venue : prev.venue,
            eventDate: s.eventDate !== "Unknown" ? s.eventDate : prev.eventDate,
            eventName: s.eventName !== "Unknown" ? s.eventName : prev.eventName,
            photographer: s.photographer !== "Unknown" ? s.photographer : prev.photographer,
            peopleVisible: s.peopleVisible?.length ? s.peopleVisible.join(", ") : prev.peopleVisible,
            whatThisProves: s.whatThisProves || prev.whatThisProves,
            homepageCandidate:
              opts.fit && proposal.recommendedFlags.homepageCandidate !== undefined
                ? Boolean(proposal.recommendedFlags.homepageCandidate)
                : prev.homepageCandidate,
            featuredPhoto:
              opts.fit && proposal.recommendedFlags.featuredPhoto !== undefined
                ? Boolean(proposal.recommendedFlags.featuredPhoto)
                : prev.featuredPhoto,
            heroLevel:
              opts.fit && proposal.recommendedFlags.heroLevel
                ? proposal.recommendedFlags.heroLevel
                : prev.heroLevel,
            tierIntent:
              opts.fit && proposal.recommendedFlags.tierIntent !== undefined
                ? (proposal.recommendedFlags.tierIntent as PhotoFormState["tierIntent"])
                : prev.tierIntent,
          };
        });
        setDirty(true);
      } else if (opts.fit && proposal.recommendedFlags) {
        const f = proposal.recommendedFlags;
        setForm((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            homepageCandidate: f.homepageCandidate ?? prev.homepageCandidate,
            featuredPhoto: f.featuredPhoto ?? prev.featuredPhoto,
            heroLevel: f.heroLevel ?? prev.heroLevel,
            tierIntent: (f.tierIntent as PhotoFormState["tierIntent"]) ?? prev.tierIntent,
          };
        });
        setDirty(true);
      }
    });
  }

  function toggleBatchField(key: string) {
    setBatchFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function applyBatch() {
    if (!form || selectedIds.length === 0) return;
    const applyFields = [...batchFields];
    if (!applyFields.length) {
      setMessage("Pick at least one field to batch-apply.");
      return;
    }
    const snapshot = form;
    const ids = [...selectedIds];
    if (
      !window.confirm(
        `Apply ${applyFields.length} field(s) to ${ids.length} selected photo(s)?\n\nFields: ${applyFields.join(", ")}`,
      )
    ) {
      return;
    }
    start(async () => {
      const res = await batchSavePhotoEvidenceAction({
        photoIds: ids,
        applyFields,
        consentConfirmed: snapshot.consentConfirmed,
        patch: {
          county: snapshot.county || "Unknown",
          city: snapshot.city || "Unknown",
          venue: snapshot.venue || "Unknown",
          eventDate: snapshot.eventDate || "Unknown",
          eventName: snapshot.eventName || "Unknown",
          photographer: snapshot.photographer || "Unknown",
          peopleVisible: snapshot.peopleVisible,
          whatThisProves: snapshot.whatThisProves,
          approvedForPublic: snapshot.approvedForPublic,
          homepageCandidate: snapshot.homepageCandidate,
          featuredPhoto: snapshot.featuredPhoto,
          heroLevel: snapshot.heroLevel,
          tierIntent: snapshot.tierIntent,
          publicationStatus: snapshot.publicationStatus,
        },
      });
      let msg = res.message;
      if (res.errors?.length) {
        msg +=
          "\n" +
          res.errors
            .slice(0, 6)
            .map((e) => `• ${e.photoId}: ${e.error}`)
            .join("\n");
      }
      setMessage(msg);
      if (res.ok) {
        setDirty(false);
        setProposal(null);
      }
    });
  }

  function runClusterSelection() {
    if (selectedIds.length < 1) {
      setMessage("Select photos to cluster.");
      return;
    }
    const ids = [...selectedIds];
    start(async () => {
      const res = await clusterPhotoSelectionAction(ids);
      setMessage(res.message);
      if (!res.ok || !res.result) return;
      const lines = res.result.clusters.map(
        (c) => `• ${c.label} (${c.photoIds.length}): ${c.reason}`,
      );
      setClusterNote(`${res.result.summary}\n${lines.join("\n")}`);
    });
  }

  function suggestForSelection() {
    if (selectedIds.length < 2) {
      setMessage("Select at least 2 photos for batch AI suggest.");
      return;
    }
    const ids = selectedIds.slice(0, 24);
    start(async () => {
      const res = await suggestBatchPhotoEvidenceAiAction(ids, aiMode);
      setMessage(res.message);
      if (!res.ok || !res.proposal) return;
      setProposal(res.proposal);
      setClusterNote(
        `${res.proposal.clusterSummary}\n` +
          res.proposal.clusters.map((c) => `• ${c.label} (${c.photoIds.length})`).join("\n"),
      );
      setBatchFields(new Set(res.proposal.recommendedApplyFields));
      const s = res.proposal.shared;
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          county: s.county === "Unknown" ? prev.county : s.county,
          city: s.city === "Unknown" ? prev.city : s.city,
          venue: s.venue === "Unknown" ? prev.venue : s.venue,
          eventDate: s.eventDate === "Unknown" ? prev.eventDate : s.eventDate,
          eventName: s.eventName === "Unknown" ? prev.eventName : s.eventName,
          photographer: s.photographer === "Unknown" ? prev.photographer : s.photographer,
          peopleVisible: s.peopleVisible.length ? s.peopleVisible.join(", ") : prev.peopleVisible,
          whatThisProves: s.whatThisProves || prev.whatThisProves,
        };
      });
      setDirty(true);
    });
  }

  function loadProposalIntoForm() {
    if (!proposal) return;
    const s = proposal.shared;
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        county: s.county === "Unknown" ? "" : s.county,
        city: s.city === "Unknown" ? "" : s.city,
        venue: s.venue === "Unknown" ? "" : s.venue,
        eventDate: s.eventDate === "Unknown" ? "" : s.eventDate,
        eventName: s.eventName === "Unknown" ? "" : s.eventName,
        photographer: s.photographer === "Unknown" ? "" : s.photographer,
        peopleVisible: s.peopleVisible.join(", "),
        whatThisProves: s.whatThisProves,
      };
    });
    setBatchFields(new Set(proposal.recommendedApplyFields));
    setDirty(true);
    setMessage("Loaded proposal into form — review fields, then Apply to selected.");
  }

  function applyProposalToSelection() {
    if (!proposal || !form) return;
    const applyFields = [...batchFields];
    if (!applyFields.length) {
      setMessage("Pick at least one field from the proposal to apply.");
      return;
    }
    const ids = proposal.photoIds.filter((id) => selectedIds.includes(id));
    const targetIds = ids.length ? ids : proposal.photoIds;
    const s = proposal.shared;
    if (
      !window.confirm(
        `Apply AI proposal fields (${applyFields.join(", ")}) to ${targetIds.length} photo(s)?\n\nConfidence: ${s.confidence}\nThis writes local overlays after your review.`,
      )
    ) {
      return;
    }
    start(async () => {
      const res = await batchSavePhotoEvidenceAction({
        photoIds: targetIds,
        applyFields,
        consentConfirmed: form.consentConfirmed,
        patch: {
          county: s.county || "Unknown",
          city: s.city || "Unknown",
          venue: s.venue || "Unknown",
          eventDate: s.eventDate || "Unknown",
          eventName: s.eventName || "Unknown",
          photographer: s.photographer || "Unknown",
          peopleVisible: s.peopleVisible,
          whatThisProves: s.whatThisProves,
        },
      });
      setMessage(res.message);
      if (res.ok) {
        setDirty(false);
        setProposal(null);
      }
    });
  }

  function toggleBatchDerivKind(key: string) {
    setBatchDerivKinds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else {
        if (next.size >= 4) return prev;
        next.add(key);
      }
      return next;
    });
  }

  function runBatchDerivatives() {
    if (selectedIds.length === 0) {
      setMessage("Select photos for batch derivatives.");
      return;
    }
    const kinds = [...batchDerivKinds].slice(0, 4);
    if (!kinds.length) {
      setMessage("Pick at least one derivative kind (max 4).");
      return;
    }
    const ids = selectedIds.slice(0, 40);
    const totalOps = ids.length * kinds.length;
    if (
      !window.confirm(
        `Create ${kinds.join(", ")} for ${ids.length} photo(s)?\n\nUp to ${totalOps} derivative file(s). Originals stay untouched.`,
      )
    ) {
      return;
    }

    start(async () => {
      const chunkSize = 5;
      let created = 0;
      let failed = 0;
      const errorLines: string[] = [];
      const runIds: string[] = [];

      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        const from = i + 1;
        const to = Math.min(i + chunkSize, ids.length);
        setDerivProgress(`Creating derivatives · photos ${from}–${to} of ${ids.length}…`);
        const res = await batchCreatePhotoDerivativesAction({
          photoIds: chunk,
          kinds,
        });
        created += res.createdCount ?? 0;
        failed += res.errorCount ?? 0;
        if (res.batchRunId) runIds.push(res.batchRunId);
        if (res.errors?.length) {
          for (const e of res.errors.slice(0, 4)) {
            errorLines.push(`${e.photoId}/${e.kind}: ${e.error}`);
          }
        }
      }

      setDerivProgress("");
      let msg = `Batch derivatives done: created ${created}/${totalOps}` + (failed ? ` (${failed} failed)` : "");
      if (runIds.length) msg += `\nRuns: ${runIds.join(", ")}`;
      if (errorLines.length) msg += `\n${errorLines.slice(0, 6).join("\n")}`;
      setMessage(msg);
      if (photo) refreshDerivatives(photo.id);
    });
  }

  function runBatchPublish(action: string) {
    if (selectedIds.length === 0) {
      setMessage("Select photos for batch publish.");
      return;
    }
    const needsConsent = selectedIds.some((id) => {
      const item = photos.find((p) => p.id === id);
      return item?.requiresConsentHold;
    });
    if (
      needsConsent &&
      !form?.consentConfirmed &&
      (action === "approve" || action === "homepage_on" || action === "featured_on")
    ) {
      setMessage(
        "Consent hold stills in selection — check “Consent confirmed by Steve/family” before approve/homepage/featured.",
      );
      return;
    }
    const labels: Record<string, string> = {
      approve: "Approve for public",
      hold: "Hold off albums (clear homepage/featured)",
      homepage_on: "Mark homepage candidate",
      homepage_off: "Clear homepage candidate",
      featured_on: "Mark featured",
      featured_off: "Clear featured",
    };
    if (
      !window.confirm(
        `${labels[action] ?? action} for ${selectedIds.length} selected photo(s)?\n\nUnknown-county stills are skipped for public-raising actions. Albums refresh once.`,
      )
    ) {
      return;
    }
    start(async () => {
      const res = await batchPublishPhotosAction({
        photoIds: selectedIds,
        action,
        consentConfirmed: Boolean(form?.consentConfirmed),
      });
      let msg = res.message;
      if (res.errors?.length) {
        msg += `\n${res.errors
          .slice(0, 5)
          .map((e) => `${e.photoId}: ${e.error}`)
          .join("\n")}`;
      }
      setMessage(msg);
      refreshBatchOps();
    });
  }

  const STAGE_STRIP: Array<{ id: Filter; label: string; count?: number; hint: string }> = [
    { id: "draft", label: "Intake", count: stageCounts?.intake, hint: "Draft / in-review queue" },
    { id: "unknown", label: "Unknown", count: stageCounts?.unknown, hint: "Prefer Unknown until sure" },
    {
      id: "needsApproval",
      label: "Needs Approve",
      count: stageCounts?.needsApproval,
      hint: "Geo saved — Confirm Approve separately",
    },
    {
      id: "needsPromote",
      label: "Needs Promote",
      count: stageCounts?.needsPromote,
      hint: "Pro Edit assemblies waiting for publicSrcOverride",
    },
    {
      id: "approved",
      label: "Albums / shipped",
      count: stageCounts?.approved,
      hint: "Album-eligible — binaries still need Ship tab when gitignored",
    },
  ];

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "homepage", label: "Homepage" },
  ];

  const imageSrc = `${photo.src}${photo.src.includes("?") ? "&" : "?"}wb=${encodeURIComponent(photo.id)}`;

  const showProEdit =
    filter === "needsPromote" || filter === "approved" || filter === "homepage" || filter === "all";

  return (
    <div className="space-y-4">
      <FilterBar query={query} setQuery={setQuery} counts={filtered.length} />

      <div className="rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] p-3">
        <p className="font-heading text-[11px] font-bold uppercase tracking-wide text-[#000066]">
          Photos stage strip
        </p>
        <p className="mt-1 font-body text-[10px] text-[#364272]">
          Progressive desk — Identify on Unknown; Pro Edit / Promote under Needs Promote. Prefer
          Unknown. Never silent Approve.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STAGE_STRIP.map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.hint}
              onClick={() => setFilter(s.id)}
              className={`rounded-md border px-3 py-1.5 font-body text-xs font-bold ${
                filter === s.id
                  ? "border-[#000066] bg-[#000066] text-white"
                  : "border-[#8eb6dc] bg-white text-[#12124a]"
              }`}
            >
              {s.label}
              {typeof s.count === "number" ? ` (${s.count})` : ""}
            </button>
          ))}
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-md border px-3 py-1.5 font-body text-xs font-semibold ${
                filter === f.id
                  ? "border-[#000066] bg-[#000066] text-white"
                  : "border-[#8eb6dc]/60 bg-white text-[#364272]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!showProEdit ? (
          <p className="mt-2 font-body text-[10px] text-[#364272]">
            Pro Edit / crop tools stay available below but this stage focuses Identify → Save.
          </p>
        ) : null}
      </div>

      {turboProposal && turboProposal.status === "pending" ? (
        <div className="rounded-lg border-2 border-[#ca913d]/60 bg-[#fff8ef] p-3">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
            Turbo website fit · {turboProposal.identifySource}
          </p>
          <p className="mt-1 font-body text-[11px] text-[#364272]">
            Best: {turboProposal.fit.bestSurface ?? "—"} ({turboProposal.fit.bestScore}/100) ·{" "}
            {turboProposal.fit.inventoryNote}
          </p>
          {turboProposal.identify ? (
            <p className="mt-1 font-body text-[11px] text-[#12124a]">
              Identify: {turboProposal.identify.county}/{turboProposal.identify.city} ·{" "}
              {turboProposal.identify.confidence} · {turboProposal.identify.rationale}
            </p>
          ) : null}
          <ul className="mt-2 space-y-1">
            {turboProposal.fit.rankings.slice(0, 5).map((r) => (
              <li key={r.surface} className="font-body text-[10px] text-[#364272]">
                <span className="font-semibold text-[#12124a]">
                  {r.surface} {r.score}
                </span>
                {r.ready ? " · ready" : ""} — {r.rationale}
                {r.blockers[0] ? ` · ${r.blockers[0]}` : ""}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => applyTurbo({ identify: true })}
              className="rounded border-2 border-[#000066] bg-white px-2.5 py-1 font-body text-[11px] font-bold text-[#000066] disabled:opacity-50"
            >
              Apply identify to form
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => applyTurbo({ fit: true })}
              className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-[11px] font-bold text-[#12124a] disabled:opacity-50"
            >
              Apply fit flags to form
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => applyTurbo({ identify: true, fit: true })}
              className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-[11px] font-bold text-white disabled:opacity-50"
            >
              Apply both
            </button>
          </div>
          <p className="mt-1 font-body text-[10px] text-[#364272]">
            Writes overlay on Apply; still Save/Approve separately. Never silent-publishes.
          </p>
        </div>
      ) : null}

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
              Batch select · {selectedIds.length} selected
            </p>
            <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-[#8eb6dc] bg-[#f4f7fc] px-2 py-1 font-body text-[11px] font-semibold text-[#12124a]"
              onClick={selectAllFiltered}
            >
              Select filtered (max 80)
            </button>
            <button
              type="button"
              className="rounded border border-[#8eb6dc] bg-white px-2 py-1 font-body text-[11px] font-semibold text-[#12124a]"
              onClick={() => {
                if (photo && !selectedIds.includes(photo.id)) {
                  setSelectedIds((prev) => [...prev, photo.id]);
                  setSelectionAnchorId(photo.id);
                }
              }}
            >
              Add current
            </button>
            <button
              type="button"
              className="rounded border border-[#8eb6dc] bg-white px-2 py-1 font-body text-[11px] font-semibold text-[#12124a]"
              onClick={clearSelection}
            >
              Clear
            </button>
            <button
              type="button"
              disabled={pending || !batchOps.some((o) => o.undoable)}
              className="rounded border-2 border-[#ca913d] bg-white px-2 py-1 font-body text-[11px] font-bold text-[#12124a] disabled:opacity-50"
              onClick={undoLastPublish}
              title="Undo latest batch publish run"
            >
              Undo last publish
            </button>
            <button
              type="button"
              disabled={pending || selectedIds.length < 1}
              className="rounded border border-[#8eb6dc] bg-white px-2 py-1 font-body text-[11px] font-semibold text-[#12124a] disabled:opacity-50"
              onClick={runClusterSelection}
            >
              Cluster selection
            </button>
            <button
              type="button"
              disabled={pending || selectedIds.length < 2}
              className="rounded border-2 border-[#000066] bg-white px-2 py-1 font-body text-[11px] font-bold text-[#000066] disabled:opacity-50"
              onClick={suggestForSelection}
            >
              Suggest for selection (AI)
            </button>
          </div>
        </div>
        {clusterNote ? (
          <p className="mt-2 whitespace-pre-wrap font-body text-[11px] text-[#364272]">{clusterNote}</p>
        ) : null}
        {selectedIds.length > 0 ? (
          <div className="mt-3 rounded border border-[#8eb6dc]/60 bg-[#f4f7fc] p-2.5">
            <p className="font-heading text-[11px] font-bold uppercase tracking-wide text-[#000066]">
              Batch derivatives (non-destructive)
            </p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">
              Max 40 photos · max 4 kinds · originals never overwritten.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {BATCH_DERIV_OPTIONS.map((f) => (
                <label
                  key={f.key}
                  className="inline-flex items-center gap-1.5 font-body text-[11px] text-[#12124a]"
                >
                  <input
                    type="checkbox"
                    checked={batchDerivKinds.has(f.key)}
                    onChange={() => toggleBatchDerivKind(f.key)}
                  />
                  {f.label}
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={pending || selectedIds.length === 0 || batchDerivKinds.size === 0}
              onClick={runBatchDerivatives}
              className="mt-2 rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066] disabled:opacity-50"
            >
              Create derivatives for {Math.min(selectedIds.length, 40)} selected
            </button>
            {derivProgress ? (
              <p className="mt-2 font-body text-[11px] font-semibold text-[#000066]">{derivProgress}</p>
            ) : null}
          </div>
        ) : null}
        {selectedIds.length > 0 ? (
          <div className="mt-3 rounded border border-[#ca913d]/50 bg-[#fff8ef] p-2.5">
            <p className="font-heading text-[11px] font-bold uppercase tracking-wide text-[#000066]">
              Batch publish (Pass 9)
            </p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">
              Approve / hold / homepage / featured for selection. Consent-aware. Unknown county skipped on
              public-raising actions. County albums refresh once.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["approve", "Approve"],
                  ["hold", "Hold off albums"],
                  ["homepage_on", "Homepage on"],
                  ["homepage_off", "Homepage off"],
                  ["featured_on", "Featured on"],
                  ["featured_off", "Featured off"],
                ] as const
              ).map(([action, label]) => (
                <button
                  key={action}
                  type="button"
                  disabled={pending}
                  onClick={() => runBatchPublish(action)}
                  className="rounded border-2 border-[#000066] bg-white px-2.5 py-1 font-body text-[11px] font-semibold text-[#12124a] disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {batchOps.length ? (
          <div className="mt-3 rounded border border-[#8eb6dc]/50 bg-white p-2.5">
            <p className="font-heading text-[11px] font-bold uppercase tracking-wide text-[#000066]">
              Batch operation history (Pass 10)
            </p>
            <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
              {batchOps.slice(0, 12).map((op) => (
                <li
                  key={`${op.kind}-${op.id}`}
                  className="flex flex-wrap items-start justify-between gap-2 rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] px-2 py-1.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-[11px] font-semibold text-[#12124a]">{op.label}</p>
                    <p className="font-mono text-[10px] text-[#364272]">
                      {op.createdAt.slice(0, 19).replace("T", " ")} · {op.detail}
                    </p>
                  </div>
                  {op.undoable ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => undoPublishRun(op.id)}
                      className="shrink-0 rounded border border-[#ca913d] bg-white px-2 py-0.5 font-body text-[10px] font-semibold text-[#12124a] disabled:opacity-50"
                    >
                      Undo
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="mt-2 font-body text-[10px] text-[#364272]">
          Multi-select: checkbox · Ctrl/Cmd+click · Shift+click range · x toggle current · a select filtered · Esc clear
        </p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {filtered.slice(0, 80).map((p) => {
            const checked = selectedIds.includes(p.id);
            const active = p.id === photo.id;
            return (
              <button
                key={p.id}
                type="button"
                title={p.id}
                onClick={(e) => selectFilmstripPhoto(p.id, e)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border-2 ${
                  active ? "border-[#000066]" : "border-[#8eb6dc]/50"
                } ${checked ? "ring-2 ring-[#ca913d]" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" className="h-full w-full object-cover" />
                <span
                  className="absolute left-0.5 top-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelected(p.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSelected(p.id);
                    }
                  }}
                  role="checkbox"
                  aria-checked={checked}
                  tabIndex={0}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] font-bold ${
                      checked
                        ? "border-[#ca913d] bg-[#ca913d] text-white"
                        : "border-white bg-black/40 text-white"
                    }`}
                  >
                    {checked ? "✓" : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="rounded border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-sm text-[#12124a]"
              disabled={index <= 0}
              onClick={() => go(-1)}
            >
              ← Prev
            </button>
            <p className="font-body text-xs text-[#364272]">
              {index + 1} / {filtered.length} · ← → or j/k · Ctrl+S save · x select · a all
            </p>
            <button
              type="button"
              className="rounded border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-sm text-[#12124a]"
              disabled={index < 0 || index >= filtered.length - 1}
              onClick={() => go(1)}
            >
              Next →
            </button>
          </div>
          {/* key forces remount so the browser cannot keep a stale frame when advancing */}
          <div className="relative mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={photo.id}
              ref={previewImgRef}
              src={imageSrc}
              alt={photo.alt}
              onClick={onPreviewClick}
              onLoad={() => {
                const img = previewImgRef.current;
                if (!img || !focus) {
                  setFocusMarker(null);
                  return;
                }
                setFocusMarker(focusPointToMarker(img, focus));
              }}
              title="Click to set focus point for attention crops"
              className="max-h-[28rem] w-full cursor-crosshair rounded-lg border border-[#8eb6dc]/40 object-contain bg-[#f4f7fc]"
            />
            {focusMarker ? (
              <span
                className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ca913d] bg-[#ca913d]/35 shadow"
                style={{ left: focusMarker.left, top: focusMarker.top }}
                aria-hidden
              />
            ) : null}
          </div>
          <p className="mt-2 font-body text-[11px] text-[#364272]">
            Focus:{" "}
            {focus
              ? `${Math.round(focus.x * 100)}% × ${Math.round(focus.y * 100)}% (click photo to move)`
              : "click photo to set attention point"}
          </p>
          <p className="mt-1 font-mono text-xs text-[#364272]">{photo.id}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {ownedMediaLink?.linked && ownedMediaLink.ownedMediaId ? (
              <Link
                href={`/admin/owned-media/${ownedMediaLink.ownedMediaId}`}
                className="rounded border border-[#000066] bg-[#000066] px-2 py-0.5 font-body text-[10px] font-bold uppercase text-white"
              >
                Owned Media linked
              </Link>
            ) : (
              <span className="rounded border border-[#8eb6dc]/60 bg-[#f4f7fc] px-2 py-0.5 font-body text-[10px] font-semibold uppercase text-[#364272]">
                Owned Media not linked
              </span>
            )}
            {ownedMediaLink?.filename ? (
              <span className="font-mono text-[10px] text-[#364272]">{ownedMediaLink.filename}</span>
            ) : null}
          </div>
          {ownedMediaLink && !ownedMediaLink.linked ? (
            <p className="mt-0.5 font-body text-[10px] text-[#364272]">{ownedMediaLink.reason}</p>
          ) : null}
          <p className="break-all font-mono text-[10px] text-[#364272]">{photo.src}</p>
          {photo.overlay?.publicSrcOverride ? (
            <div className="mt-2 rounded border-2 border-[#ca913d]/50 bg-[#fff8ef] px-2 py-1.5">
              <p className="font-body text-[11px] font-semibold text-[#12124a]">
                Public src promoted from derivative
              </p>
              <p className="break-all font-mono text-[10px] text-[#364272]">
                {photo.overlay.publicSrcOverride}
              </p>
              {photo.registrySrc && photo.registrySrc !== photo.src ? (
                <p className="mt-1 break-all font-mono text-[10px] text-[#364272]">
                  Registry original: {photo.registrySrc}
                </p>
              ) : null}
              <button
                type="button"
                disabled={pending}
                onClick={clearPublicOverride}
                className="mt-1 rounded border border-[#8eb6dc] bg-white px-2 py-0.5 font-body text-[10px] font-semibold text-[#12124a] disabled:opacity-50"
              >
                Clear override
              </button>
            </div>
          ) : null}
          <p className="mt-1 font-body text-sm text-[#12124a]">{photo.caption}</p>
          <div className="mt-3 rounded-lg border-2 border-[#000066]/15 bg-white p-3">
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
              Placement preview
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 font-body text-xs text-[#364272]">
              {(promotePreview.length ? promotePreview : photo.placementPreview).map((s) => (
                <li key={`${photo.id}-${s}`}>{s}</li>
              ))}
            </ul>
          </div>
          <div className={`mt-3 ${ewPanelClass} !border-[#000066]/25`}>
            <p className={ewPanelTitleClass}>Pro Edit suite</p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">
              Industry-grade look → focus-aware multi-aspect pack → preview → confirm render → promote.
              Film / bright / editorial looks; slot chips; ledger-bridged assemblies. Never overwrites
              originals; never auto-promotes.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 font-body text-[11px] text-[#12124a]">
              <label className="inline-flex flex-col gap-0.5">
                Look
                <select
                  className={EVIDENCE_FIELD_CLASS}
                  value={proLook}
                  onChange={(e) => setProLook(e.target.value as PhotoLookPreset)}
                >
                  <option value="warm">Warm</option>
                  <option value="cool">Cool</option>
                  <option value="contrast">Contrast</option>
                  <option value="soft">Soft</option>
                  <option value="punch">Punch</option>
                  <option value="mono">Mono</option>
                  <option value="film">Film</option>
                  <option value="bright">Bright</option>
                  <option value="editorial">Editorial</option>
                  <option value="neutral">Neutral</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-1.5 self-end">
                <input
                  type="checkbox"
                  checked={proUseFocus}
                  onChange={(e) => setProUseFocus(e.target.checked)}
                />
                Use focus
              </label>
              <label className="inline-flex items-center gap-1.5 self-end">
                <input
                  type="checkbox"
                  checked={proSharpen}
                  onChange={(e) => setProSharpen(e.target.checked)}
                />
                Extra sharpen
              </label>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(
                [
                  ["grade_full", "Full"],
                  ["hero_16x9", "16:9"],
                  ["portrait_4x5", "4:5"],
                  ["square_1x1", "1:1"],
                  ["story_9x16", "9:16"],
                  ["web_max", "Web"],
                  ["thumb", "Thumb"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleProSlot(id)}
                  className={`${ewChipClass} cursor-pointer ${
                    proSlots.includes(id) ? "!border-[#000066] !bg-[#000066]/10 font-semibold" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={proposeProEdit}
                className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
              >
                Propose cut pack
              </button>
              <button
                type="button"
                disabled={pending || !editProject}
                onClick={applyProMeta}
                className="rounded border border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Apply look / slots
              </button>
              <button
                type="button"
                disabled={pending || !editProject}
                onClick={previewProPack}
                className="rounded border border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Preview look
              </button>
              <button
                type="button"
                disabled={pending || !editProject}
                onClick={confirmProRender}
                className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Confirm render
              </button>
              <button
                type="button"
                disabled={pending || !assemblies.length}
                onClick={softArchiveProAssemblies}
                className="rounded border border-[#8eb6dc]/60 bg-[#f4f7fc] px-2.5 py-1 font-body text-xs text-[#364272] disabled:opacity-50"
              >
                Soft-archive
              </button>
            </div>
            {proRenderNote ? (
              <p className="mt-2 font-body text-[11px] text-[#364272]">{proRenderNote}</p>
            ) : null}
            {proPreviewSrc || proPreviewNote ? (
              <div className="mt-3 rounded border border-[#8eb6dc]/40 bg-white p-2">
                <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                  Look preview
                </p>
                {proPreviewNote ? (
                  <p className="mt-1 font-body text-[10px] text-[#364272]">{proPreviewNote}</p>
                ) : null}
                {proPreviewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proPreviewSrc}
                    alt=""
                    className="mt-1 max-h-48 w-full rounded border border-[#8eb6dc]/30 object-contain bg-[#f4f7fc]"
                  />
                ) : null}
              </div>
            ) : null}
            {editProject ? (
              <div className="mt-3 rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2">
                <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                  Edit project · {editProject.exportSlots.length} slots · {editProject.look}
                </p>
                <p className="mt-1 font-body text-[11px] text-[#12124a]">
                  {editProject.useFocus ? "focus-aware" : "attention crops"}
                  {editProject.sharpen ? " · sharpen" : ""}
                  {editProject.promoteSuggestion
                    ? ` · promote hint: ${editProject.promoteSuggestion}`
                    : ""}
                </p>
                {editProject.directorRationale ? (
                  <p className="mt-1 font-body text-[10px] text-[#364272]">
                    {editProject.directorRationale}
                  </p>
                ) : null}
                <p className="mt-1 font-mono text-[10px] text-[#364272]">
                  {editProject.exportSlots.join(" · ")}
                </p>
              </div>
            ) : null}
            {assemblies.length ? (
              <div className="mt-3 space-y-2">
                <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                  Assemblies
                </p>
                {assemblies.slice(0, 12).map((a) => (
                  <div key={a.id} className="rounded border border-[#8eb6dc]/40 bg-white p-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-body text-[11px] text-[#12124a]">
                        {a.slot} · {a.look} · {a.width}×{a.height}
                        {a.note?.includes("[archived") ? " · archived" : ""}
                      </p>
                      {!a.note?.includes("[archived") ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => promoteAssembly(a)}
                          className="rounded border border-[#000066] px-2 py-0.5 font-body text-[10px] font-semibold text-[#000066] disabled:opacity-50"
                        >
                          Promote
                        </button>
                      ) : null}
                    </div>
                    <p className="break-all font-mono text-[10px] text-[#364272]">{a.publicSrc}</p>
                    {!a.note?.includes("[archived") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.publicSrc}
                        alt=""
                        className="mt-1 max-h-36 w-full rounded border border-[#8eb6dc]/30 object-contain bg-[#f4f7fc]"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            <p className="mt-2 font-body text-[10px] text-[#364272]">
              Confirm render writes the full pack and registers slots in the derivative ledger so Promote
              works. Soft-archive never deletes files.
            </p>
          </div>
          <div className="mt-3 rounded-lg border-2 border-[#000066]/15 bg-white p-3">
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
              Photo derivatives (non-destructive)
            </p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">
              Writes under /media/campaign-derivatives — originals stay untouched. Promote sets public src +
              optional homepage/hero flags.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["Inspect", runInspect],
                  ["Crop plan", runCropPlan],
                  ["Web", () => runDerivative("web_max")],
                  ["Thumb", () => runDerivative("thumb")],
                  ["Hero 16:9", () => runDerivative("hero_16x9")],
                  ["Portrait 4:5", () => runDerivative("portrait_4x5")],
                  ["Square", () => runDerivative("square_1x1")],
                  ["Auto-orient", () => runDerivative("auto_orient")],
                ] as const
              ).map(([label, onClick]) => (
                <button
                  key={label}
                  type="button"
                  disabled={pending}
                  onClick={onClick}
                  className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2">
              <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                Focus crops (attention)
              </p>
              <p className="mt-1 font-body text-[11px] text-[#364272]">
                Click the photo to set focus, then create a crop that keeps that point in frame.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["Focus hero 16:9", "focus_hero_16x9"],
                    ["Focus portrait 4:5", "focus_portrait_4x5"],
                    ["Focus square", "focus_square_1x1"],
                  ] as const
                ).map(([label, kind]) => (
                  <button
                    key={kind}
                    type="button"
                    disabled={pending}
                    onClick={() => runFocusCrop(kind)}
                    className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="mt-2 block font-body text-[11px] text-[#12124a]">
                cropAdvice
                <textarea
                  className={`${EVIDENCE_FIELD_CLASS} mt-1 min-h-[3rem] w-full`}
                  value={cropAdvice}
                  onChange={(e) => setCropAdvice(e.target.value)}
                  placeholder="From Suggest with AI, or type framing advice"
                />
              </label>
              <button
                type="button"
                disabled={pending}
                onClick={applyCropAdvice}
                className="mt-2 rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-semibold text-white disabled:opacity-50"
              >
                Apply cropAdvice → derivative
              </button>
            </div>
            <div className="mt-3 rounded border border-[#ca913d]/40 bg-[#fff8ef] p-2">
              <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                Promote options
              </p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-body text-[11px] text-[#12124a]">
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={promoteHomepage}
                    onChange={(e) => setPromoteHomepage(e.target.checked)}
                  />
                  Homepage candidate
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={promoteFeatured}
                    onChange={(e) => setPromoteFeatured(e.target.checked)}
                  />
                  Featured
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={promoteApproved}
                    onChange={(e) => setPromoteApproved(e.target.checked)}
                  />
                  Approved for public
                </label>
                <label className="inline-flex items-center gap-1.5">
                  Hero
                  <select
                    className="rounded border border-[#8eb6dc] bg-white px-1 py-0.5"
                    value={promoteHero}
                    onChange={(e) =>
                      setPromoteHero(e.target.value as "FEATURE" | "HERO" | "")
                    }
                  >
                    <option value="">—</option>
                    <option value="FEATURE">FEATURE</option>
                    <option value="HERO">HERO</option>
                  </select>
                </label>
              </div>
            </div>
            {derivatives.length ? (
              <ul className="mt-3 space-y-2">
                {derivatives.map((d) => {
                  const isPromoted =
                    photo.overlay?.publicSrcOverride === d.publicSrc ||
                    photo.overlay?.promotedDerivativeId === d.id;
                  return (
                    <li key={d.id} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.publicSrc}
                        alt=""
                        className="h-14 w-14 rounded border border-[#8eb6dc]/40 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[11px] font-bold text-[#000066]">
                          {d.kind}
                          {isPromoted ? " · promoted" : ""}
                        </p>
                        <p className="truncate font-mono text-[10px] text-[#364272]">
                          {d.width}×{d.height} · {d.publicSrc}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => promoteDerivative(d)}
                        className="shrink-0 rounded border-2 border-[#000066] bg-white px-2 py-1 font-body text-[11px] font-bold text-[#000066] disabled:opacity-50"
                      >
                        Promote
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 font-body text-[11px] text-[#364272]">No derivatives yet for this still.</p>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border-2 border-[#000066]/15 bg-white p-4 text-[#12124a]">
          <h3 className="font-heading text-lg font-bold text-[#000066]">Evidence fields</h3>
          <p className="font-body text-xs text-[#364272]">
            Editing <span className="font-mono font-semibold">{photo.id}</span>
            {dirty ? " · unsaved" : ""}
            {selectedIds.length > 1 ? ` · batch template for ${selectedIds.length}` : ""}
          </p>

          {selectedIds.length > 0 ? (
            <div className="rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-3">
              <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
                Batch apply fields
              </p>
              <p className="mt-1 font-body text-[11px] text-[#364272]">
                Checked fields from this form write onto all selected stills. Unchecked fields are left alone.
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {BATCH_FIELD_OPTIONS.map((f) => (
                  <label key={f.key} className="inline-flex items-center gap-1.5 font-body text-[11px] text-[#12124a]">
                    <input
                      type="checkbox"
                      checked={batchFields.has(f.key)}
                      onChange={() => toggleBatchField(f.key)}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={pending || selectedIds.length === 0 || batchFields.size === 0}
                onClick={applyBatch}
                className="mt-3 rounded-md bg-[#ca913d] px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
              >
                Apply to {selectedIds.length} selected
              </button>
            </div>
          ) : null}

          {proposal ? (
            <div className="rounded-lg border-2 border-[#000066]/25 bg-[#f4f7fc] p-3">
              <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
                AI batch proposal · review before write
              </p>
              <p className="mt-1 font-body text-xs text-[#364272]">
                {proposal.photoIds.length} stills · confidence{" "}
                <span className="font-semibold text-[#12124a]">{proposal.shared.confidence}</span>
                {proposal.mixedGeography ? " · mixed geography caution" : ""}
                {proposal.model ? ` · ${proposal.model}` : ""}
              </p>
              <p className="mt-2 font-body text-sm text-[#12124a]">{proposal.shared.rationale || "Review shared fields."}</p>
              <ul className="mt-2 space-y-0.5 font-mono text-[11px] text-[#364272]">
                <li>county: {proposal.shared.county}</li>
                <li>city: {proposal.shared.city}</li>
                <li>venue: {proposal.shared.venue}</li>
                <li>eventDate: {proposal.shared.eventDate}</li>
                <li>eventName: {proposal.shared.eventName}</li>
                <li>photographer: {proposal.shared.photographer}</li>
                <li>people: {proposal.shared.peopleVisible.join(", ") || "—"}</li>
                <li>proves: {proposal.shared.whatThisProves || "—"}</li>
              </ul>
              {proposal.shared.warnings.length ? (
                <p className="mt-2 font-body text-[11px] text-[#8a4b00]">
                  Warnings: {proposal.shared.warnings.join("; ")}
                </p>
              ) : null}
              {proposal.perPhotoNotes.length ? (
                <ul className="mt-2 list-disc pl-4 font-body text-[11px] text-[#364272]">
                  {proposal.perPhotoNotes.map((n) => (
                    <li key={n.photoId}>
                      <span className="font-mono">{n.photoId}</span>: {n.note}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={loadProposalIntoForm}
                  className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
                >
                  Reload into form
                </button>
                <button
                  type="button"
                  disabled={pending || batchFields.size === 0}
                  onClick={applyProposalToSelection}
                  className="rounded-md bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white disabled:opacity-50"
                >
                  Apply proposal to selection
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setProposal(null)}
                  className="rounded-md border border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#364272] disabled:opacity-50"
                >
                  Dismiss proposal
                </button>
              </div>
            </div>
          ) : null}

          <label className="block font-body text-xs font-semibold text-[#12124a]">
            County
            <select
              className={EVIDENCE_FIELD_CLASS}
              value={form.county}
              onChange={(e) => patchForm("county", e.target.value)}
            >
              <option value="">Unknown</option>
              {counties.map((c) => (
                <option key={c.slug} value={c.shortName}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </label>

          {(
            [
              ["city", "City"],
              ["venue", "Venue"],
              ["eventDate", "Event date"],
              ["eventName", "Event name"],
              ["photographer", "Photographer"],
              ["peopleVisible", "People (comma-separated)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block font-body text-xs font-semibold text-[#12124a]">
              {label}
              <input
                className={EVIDENCE_FIELD_CLASS}
                value={form[key]}
                onChange={(e) => patchForm(key, e.target.value)}
              />
            </label>
          ))}

          <label className="block font-body text-xs font-semibold text-[#12124a]">
            What this proves
            <textarea
              className={EVIDENCE_FIELD_CLASS}
              rows={3}
              value={form.whatThisProves}
              onChange={(e) => patchForm("whatThisProves", e.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-4 font-body text-sm text-[#12124a]">
            {(
              [
                ["approvedForPublic", "Approved for public"],
                ["homepageCandidate", "Homepage candidate"],
                ["featuredPhoto", "Lead / featured"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => patchForm(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>

          {photo.requiresConsentHold ? (
            <label className="flex items-start gap-2 rounded border-2 border-[#ca913d] bg-[#fff8ef] px-3 py-2 font-body text-sm text-[#12124a]">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.consentConfirmed}
                onChange={(e) => patchForm("consentConfirmed", e.target.checked)}
              />
              <span>
                Consent hold — confirm Steve/family approval before public or homepage flags.
              </span>
            </label>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block font-body text-xs font-semibold">
              Hero level
              <select
                className={EVIDENCE_FIELD_CLASS}
                value={form.heroLevel}
                onChange={(e) => patchForm("heroLevel", e.target.value)}
              >
                {["UNREVIEWED", "SUPPORTING", "FEATURE", "HERO"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="block font-body text-xs font-semibold">
              Tier intent
              <select
                className={EVIDENCE_FIELD_CLASS}
                value={form.tierIntent}
                onChange={(e) =>
                  patchForm("tierIntent", e.target.value as PhotoFormState["tierIntent"])
                }
              >
                <option value="">—</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Archive">Archive</option>
              </select>
            </label>
            <label className="block font-body text-xs font-semibold">
              Publication
              <select
                className={EVIDENCE_FIELD_CLASS}
                value={form.publicationStatus}
                onChange={(e) => patchForm("publicationStatus", e.target.value)}
              >
                {["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <EvidenceAiModePanel kind="photo" mode={aiMode} onChange={setAiMode} />
            <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={suggestAi}
              className="rounded-md border-2 border-[#000066] bg-white px-4 py-2 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
            >
              Suggest with AI ({aiMode})
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="rounded-md bg-[#000066] px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
            >
              Save photo evidence
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={buildPacket}
              className="rounded-md border-2 border-[#8eb6dc] bg-white px-4 py-2 font-body text-sm font-semibold text-[#12124a] disabled:opacity-50"
            >
              Build outgoing metadata packet
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                start(async () => {
                  const { refreshCountyAlbumsAction } = await import("@/app/admin/evidence-workbench-actions");
                  const res = await refreshCountyAlbumsAction(true);
                  setMessage(res.message);
                });
              }}
              className="rounded-md border-2 border-[#8eb6dc] bg-white px-4 py-2 font-body text-sm font-semibold text-[#12124a] disabled:opacity-50"
            >
              Rebuild county folders
            </button>
            </div>
          </div>
          {message ? (
            <p className="whitespace-pre-wrap font-body text-sm text-[#364272]">{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterBar({
  query,
  setQuery,
  counts,
}: {
  query: string;
  setQuery: (q: string) => void;
  counts: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="min-w-[12rem] flex-1 font-body text-xs font-semibold text-[#12124a]">
        Search
        <input
          className={EVIDENCE_FIELD_CLASS}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="id, caption, county, event"
        />
      </label>
      <p className="font-body text-xs text-[#364272]">{counts} in view</p>
    </div>
  );
}
