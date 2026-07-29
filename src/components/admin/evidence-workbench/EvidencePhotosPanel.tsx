"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  batchSavePhotoEvidenceAction,
  buildPhotoMetadataPacketAction,
  createPhotoDerivativeAction,
  inspectPhotoPixelsAction,
  listPhotoDerivativesAction,
  savePhotoEvidenceAction,
  suggestCropPlanAction,
  suggestPhotoEvidenceAiAction,
} from "@/app/admin/evidence-workbench-actions";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import type { PhotoDerivativeRecord } from "@/lib/campaign-media/media-derivatives-types";
import { EVIDENCE_FIELD_CLASS } from "@/components/admin/evidence-workbench/field-styles";
import { isEditableKeyboardTarget } from "@/components/admin/evidence-workbench/keyboard";

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

export type PhotoWorkbenchItem = {
  id: string;
  src: string;
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

type Props = {
  photos: PhotoWorkbenchItem[];
  counties: CountyOpt[];
  initialPhotoId?: string;
};

type Filter = "all" | "unknown" | "needsApproval" | "draft" | "approved" | "homepage";

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

export function EvidencePhotosPanel({ photos, counties, initialPhotoId }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(
    () => initialPhotoId || photos[0]?.id || "",
  );
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [derivatives, setDerivatives] = useState<PhotoDerivativeRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchFields, setBatchFields] = useState<Set<string>>(() => new Set(DEFAULT_BATCH_FIELDS));
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
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        p.caption.toLowerCase().includes(q) ||
        p.src.toLowerCase().includes(q) ||
        county.toLowerCase().includes(q) ||
        (p.overlay?.eventName ?? p.base.eventName).toLowerCase().includes(q)
      );
    });
  }, [photos, filter, query]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navigate-only reload; photos refresh handled below
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
      return;
    }
    let cancelled = false;
    void listPhotoDerivativesAction(activeId).then((res) => {
      if (cancelled) return;
      setDerivatives(res.derivatives ?? []);
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
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIds, activeId, dirty, form, photo]);

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
    start(async () => {
      const res = await suggestPhotoEvidenceAiAction(photoId);
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
      if (s.cropAdvice) extras.push(`Crop: ${s.cropAdvice}`);
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
      const res = await createPhotoDerivativeAction(photoId, kind);
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

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAllFiltered() {
    setSelectedIds(filteredIds.slice(0, 80));
  }

  function clearSelection() {
    setSelectedIds([]);
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
      if (res.ok) setDirty(false);
    });
  }

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unknown", label: "Unknown county" },
    { id: "needsApproval", label: "Needs approval" },
    { id: "draft", label: "Draft" },
    { id: "approved", label: "Approved" },
    { id: "homepage", label: "Homepage" },
  ];

  const imageSrc = `${photo.src}${photo.src.includes("?") ? "&" : "?"}wb=${encodeURIComponent(photo.id)}`;

  return (
    <div className="space-y-4">
      <FilterBar query={query} setQuery={setQuery} counts={filtered.length} />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFilter(f.id);
            }}
            className={`rounded-md border px-3 py-1.5 font-body text-xs font-semibold ${
              filter === f.id
                ? "border-[#000066] bg-[#000066] text-white"
                : "border-[#8eb6dc] bg-white text-[#12124a]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

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
          </div>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {filtered.slice(0, 80).map((p) => {
            const checked = selectedIds.includes(p.id);
            const active = p.id === photo.id;
            return (
              <button
                key={p.id}
                type="button"
                title={p.id}
                onClick={() => selectPhoto(p.id)}
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
              {index + 1} / {filtered.length} · ← → or j/k · Ctrl+S save
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.id}
            src={imageSrc}
            alt={photo.alt}
            className="mt-3 max-h-[28rem] w-full rounded-lg border border-[#8eb6dc]/40 object-contain bg-[#f4f7fc]"
          />
          <p className="mt-2 font-mono text-xs text-[#364272]">{photo.id}</p>
          <p className="break-all font-mono text-[10px] text-[#364272]">{photo.src}</p>
          <p className="mt-1 font-body text-sm text-[#12124a]">{photo.caption}</p>
          <div className="mt-3 rounded-lg border-2 border-[#000066]/15 bg-white p-3">
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
              Placement preview
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 font-body text-xs text-[#364272]">
              {photo.placementPreview.map((s) => (
                <li key={`${photo.id}-${s}`}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="mt-3 rounded-lg border-2 border-[#000066]/15 bg-white p-3">
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
              Photo derivatives (non-destructive)
            </p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">
              Writes under /media/campaign-derivatives — originals stay untouched.
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
            {derivatives.length ? (
              <ul className="mt-3 space-y-2">
                {derivatives.map((d) => (
                  <li key={d.id} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.publicSrc}
                      alt=""
                      className="h-14 w-14 rounded border border-[#8eb6dc]/40 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-bold text-[#000066]">{d.kind}</p>
                      <p className="truncate font-mono text-[10px] text-[#364272]">
                        {d.width}×{d.height} · {d.publicSrc}
                      </p>
                    </div>
                  </li>
                ))}
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

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={suggestAi}
              className="rounded-md border-2 border-[#000066] bg-white px-4 py-2 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
            >
              Suggest with AI (tools)
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
