"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  clickToFocusPoint,
  moveNormalizedCrop,
  normalizedCoverCrop,
  resizeNormalizedCrop,
  type FocusPoint,
  type NormalizedCropRect,
} from "@/lib/campaign-media/focus-crop";
import type { PhotoStudioBurnIn } from "@/lib/campaign-media/photo-edit-types";
import type { PhotoExportSlot, PhotoLookPreset } from "@/lib/campaign-media/photo-look-presets";
import {
  STUDIO_BRAND_TEXT_PRESETS,
  studioArtboard,
  studioLookCssFilter,
} from "@/lib/campaign-media/photo-studio-specs";
import { ewChipClass, ewPanelClass, ewPanelTitleClass } from "@/components/admin/evidence-workbench/evidenceWorkbenchChrome";
import { EVIDENCE_FIELD_CLASS } from "@/components/admin/evidence-workbench/field-styles";

export type StudioLayerId = "original" | "grade" | "ai" | "text";

type CropCorner = "tl" | "tr" | "bl" | "br";
type DragMode = "none" | "pan" | "focus" | "crop-move" | CropCorner;

type Props = {
  src: string;
  photoId: string;
  look: PhotoLookPreset;
  slots: PhotoExportSlot[];
  activeSlot?: PhotoExportSlot | null;
  onActiveSlotChange?: (slot: PhotoExportSlot) => void;
  focus: FocusPoint | null;
  onFocusChange: (point: FocusPoint) => void;
  /** Optional AI derivative (enhance/cutout) as overlay layer — never invents new photos. */
  aiLayerSrc?: string | null;
  /** V2.1 — lift burn-in intent so Apply / Confirm / Finish match preview. */
  onBurnInChange?: (burnIn: PhotoStudioBurnIn) => void;
  /** V2.2 — lift crop rect so Confirm / Finish match studio frame. */
  onCropRectChange?: (cropRect: NormalizedCropRect | null) => void;
  initialCropRect?: NormalizedCropRect | null;
  className?: string;
};

/**
 * Photo Studio — pan/zoom, true crop handles, layer include flags, brand text.
 * V2.2: crop + layers lift into Confirm/Finish (preview = ship).
 */
export function EvidencePhotoStudioCanvas({
  src,
  photoId,
  look,
  slots,
  activeSlot: activeSlotProp,
  onActiveSlotChange,
  focus,
  onFocusChange,
  aiLayerSrc,
  onBurnInChange,
  onCropRectChange,
  initialCropRect = null,
  className = "",
}: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<DragMode>("none");
  const dragOrigin = useRef({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
    crop: null as NormalizedCropRect | null,
  });
  const [layers, setLayers] = useState<Record<StudioLayerId, boolean>>({
    original: true,
    grade: true,
    ai: Boolean(aiLayerSrc),
    text: false,
  });
  const [brandText, setBrandText] = useState("");
  const [textPos, setTextPos] = useState<"bottom" | "top">("bottom");
  const [cropRect, setCropRect] = useState<NormalizedCropRect | null>(initialCropRect);
  const cropDirty = useRef(Boolean(initialCropRect));

  const artboards = useMemo(
    () => (slots.length ? slots : (["hero_16x9"] as PhotoExportSlot[])).map(studioArtboard),
    [slots],
  );
  const [localSlot, setLocalSlot] = useState<PhotoExportSlot>(
    () => activeSlotProp ?? artboards[0]?.slot ?? "hero_16x9",
  );
  const activeSlot = activeSlotProp ?? localSlot;
  const board = studioArtboard(activeSlot);

  useEffect(() => {
    if (activeSlotProp) setLocalSlot(activeSlotProp);
  }, [activeSlotProp]);

  useEffect(() => {
    if (aiLayerSrc) setLayers((prev) => ({ ...prev, ai: true }));
  }, [aiLayerSrc, photoId]);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    cropDirty.current = Boolean(initialCropRect);
    setCropRect(initialCropRect ?? null);
    // Reset view when photo changes; seed crop from project if present.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on photo identity
  }, [photoId, src]);

  useEffect(() => {
    if (!initialCropRect || cropDirty.current) return;
    setCropRect(initialCropRect);
  }, [initialCropRect, photoId]);

  const cropRectRef = useRef<NormalizedCropRect | null>(cropRect);
  cropRectRef.current = cropRect;

  const commitCrop = useCallback(
    (next: NormalizedCropRect | null, dirty = true) => {
      setCropRect(next);
      cropRectRef.current = next;
      if (dirty) cropDirty.current = true;
      onCropRectChange?.(next);
      if (next) {
        onFocusChange({
          x: Math.min(1, Math.max(0, next.x + next.w / 2)),
          y: Math.min(1, Math.max(0, next.y + next.h / 2)),
        });
      }
    },
    [onCropRectChange, onFocusChange],
  );

  // Seed / re-aspect crop when artboard geometry is ready.
  useEffect(() => {
    if (!board.aspect || natural.w <= 0 || natural.h <= 0) {
      if (!board.aspect) {
        setCropRect(null);
        cropRectRef.current = null;
        onCropRectChange?.(null);
      }
      return;
    }
    const current = cropRectRef.current;
    if (cropDirty.current && current) {
      const center = { x: current.x + current.w / 2, y: current.y + current.h / 2 };
      const next = normalizedCoverCrop({
        srcWidth: natural.w,
        srcHeight: natural.h,
        targetAspect: board.aspect,
        focus: center,
      });
      setCropRect(next);
      cropRectRef.current = next;
      onCropRectChange?.(next);
      return;
    }
    const next = normalizedCoverCrop({
      srcWidth: natural.w,
      srcHeight: natural.h,
      targetAspect: board.aspect,
      focus,
    });
    setCropRect(next);
    cropRectRef.current = next;
    onCropRectChange?.(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- geometry / slot only
  }, [board.aspect, board.slot, natural.w, natural.h, photoId]);

  useEffect(() => {
    if (!onBurnInChange) return;
    const text = brandText.trim().slice(0, 120);
    onBurnInChange({
      burnText: layers.text && text.length > 0,
      text,
      textPosition: textPos,
      includeAiLayer: layers.ai && Boolean(aiLayerSrc),
      aiLayerPublicSrc: aiLayerSrc || undefined,
      primarySlot: activeSlot,
      includeGrade: layers.grade,
    });
  }, [brandText, textPos, layers.text, layers.ai, layers.grade, aiLayerSrc, activeSlot, onBurnInChange]);

  const selectSlot = useCallback(
    (slot: PhotoExportSlot) => {
      setLocalSlot(slot);
      onActiveSlotChange?.(slot);
    },
    [onActiveSlotChange],
  );

  const toggleLayer = useCallback((id: StudioLayerId) => {
    if (id === "original") return; // original always on for export base
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  };

  const cropOverlay = useMemo(() => {
    if (!cropRect || !board.aspect) return null;
    return {
      leftPct: cropRect.x * 100,
      topPct: cropRect.y * 100,
      widthPct: cropRect.w * 100,
      heightPct: cropRect.h * 100,
    };
  }, [cropRect, board.aspect]);

  const focusPct = focus ? { left: focus.x * 100, top: focus.y * 100 } : null;

  function clientDeltaToNorm(dx: number, dy: number): { dx: number; dy: number } {
    const img = imgRef.current;
    if (!img) return { dx: 0, dy: 0 };
    const rect = img.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { dx: 0, dy: 0 };
    return { dx: dx / rect.width, dy: dy / rect.height };
  }

  function onWheel(e: ReactWheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.min(4, Math.max(0.5, Number((z + delta).toFixed(2)))));
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button === 1 || e.shiftKey || e.button === 2) {
      setDrag("pan");
      dragOrigin.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
        crop: cropRect,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    if (e.button === 0) {
      setDrag("focus");
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function beginCropDrag(mode: "crop-move" | CropCorner, e: ReactPointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    setDrag(mode);
    dragOrigin.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
      crop: cropRectRef.current,
    };
    viewportRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (drag === "pan") {
      const dx = e.clientX - dragOrigin.current.x;
      const dy = e.clientY - dragOrigin.current.y;
      setPan({
        x: dragOrigin.current.panX + dx,
        y: dragOrigin.current.panY + dy,
      });
      return;
    }
    if (!dragOrigin.current.crop || !board.aspect) return;
    if (drag === "crop-move") {
      const d = clientDeltaToNorm(e.clientX - dragOrigin.current.x, e.clientY - dragOrigin.current.y);
      const next = moveNormalizedCrop(dragOrigin.current.crop, d.dx, d.dy);
      commitCrop(next);
      return;
    }
    if (drag === "tl" || drag === "tr" || drag === "bl" || drag === "br") {
      const d = clientDeltaToNorm(e.clientX - dragOrigin.current.x, e.clientY - dragOrigin.current.y);
      const next = resizeNormalizedCrop({
        rect: dragOrigin.current.crop,
        corner: drag,
        dx: d.dx,
        dy: d.dy,
        aspect: board.aspect,
      });
      commitCrop(next);
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (drag === "focus") {
      const img = imgRef.current;
      if (img && board.aspect && natural.w > 0) {
        const rect = img.getBoundingClientRect();
        const point = clickToFocusPoint({
          clientX: e.clientX,
          clientY: e.clientY,
          elementLeft: rect.left,
          elementTop: rect.top,
          elementWidth: rect.width,
          elementHeight: rect.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
        if (point) {
          onFocusChange(point);
          const next = normalizedCoverCrop({
            srcWidth: natural.w,
            srcHeight: natural.h,
            targetAspect: board.aspect,
            focus: point,
          });
          cropDirty.current = false;
          commitCrop(next, false);
        }
      } else if (img) {
        const rect = img.getBoundingClientRect();
        const point = clickToFocusPoint({
          clientX: e.clientX,
          clientY: e.clientY,
          elementLeft: rect.left,
          elementTop: rect.top,
          elementWidth: rect.width,
          elementHeight: rect.height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
        if (point) onFocusChange(point);
      }
    }
    setDrag("none");
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  const gradeFilter = layers.grade ? studioLookCssFilter(look) : "none";
  const showAi = layers.ai && Boolean(aiLayerSrc);

  return (
    <div className={`${ewPanelClass} !border-[#000066]/30 ${className}`}>
      <p className={ewPanelTitleClass}>Photo Studio · canvas</p>
      <p className="mt-1 font-body text-[11px] text-[#364272]">
        Pan: Shift+drag · Zoom: wheel · Click: focus (recenters crop) · Drag frame / corners: true
        crop · Layer toggles = Confirm/Finish include. Prefer Unknown — no generative invent.
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {artboards.map((a) => (
          <button
            key={a.slot}
            type="button"
            onClick={() => selectSlot(a.slot)}
            className={`${ewChipClass} cursor-pointer ${
              activeSlot === a.slot ? "!border-[#000066] !bg-[#000066]/10 font-semibold" : ""
            }`}
            title={a.aspect ? `aspect ${a.aspect.toFixed(3)}` : "fit-inside"}
          >
            {a.label}
            {a.socialSafe ? " · safe" : ""}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2 font-body text-[11px] text-[#12124a]">
        {(
          [
            ["original", "Original"],
            ["grade", `Grade (${look})`],
            ["ai", "AI layer"],
            ["text", "Text"],
          ] as const
        ).map(([id, label]) => (
          <label key={id} className="inline-flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={layers[id]}
              disabled={id === "original" || (id === "ai" && !aiLayerSrc)}
              onChange={() => toggleLayer(id)}
            />
            {label}
          </label>
        ))}
        <span className="self-center font-mono text-[10px] text-[#364272]">
          zoom {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          className="rounded border border-[#8eb6dc] bg-white px-2 py-0.5 font-body text-[10px] font-semibold"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
        >
          Reset view
        </button>
        {board.aspect && focus ? (
          <button
            type="button"
            className="rounded border border-[#8eb6dc] bg-white px-2 py-0.5 font-body text-[10px] font-semibold"
            onClick={() => {
              if (!natural.w) return;
              cropDirty.current = false;
              commitCrop(
                normalizedCoverCrop({
                  srcWidth: natural.w,
                  srcHeight: natural.h,
                  targetAspect: board.aspect!,
                  focus,
                }),
                false,
              );
            }}
          >
            Reset crop to focus
          </button>
        ) : null}
      </div>

      <div
        ref={viewportRef}
        className="relative mt-2 h-[min(28rem,70vh)] w-full overflow-hidden rounded-lg border-2 border-[#000066]/20 bg-[#0c1230] select-none"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          touchAction: "none",
          cursor: drag === "pan" ? "grabbing" : drag.startsWith("crop") || drag === "tl" || drag === "tr" || drag === "bl" || drag === "br" ? "move" : "crosshair",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <div className="relative inline-block max-h-[26rem] max-w-[min(100vw-4rem,48rem)]">
            {layers.original ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                key={photoId}
                src={src}
                alt=""
                draggable={false}
                onLoad={onImgLoad}
                className="block max-h-[26rem] max-w-full object-contain"
                style={{ filter: showAi ? "none" : gradeFilter }}
              />
            ) : (
              <div className="flex h-64 w-96 items-center justify-center bg-[#12124a] font-body text-xs text-white/70">
                Original required for export base
              </div>
            )}
            {showAi && aiLayerSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={aiLayerSrc}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                style={{ filter: layers.grade ? gradeFilter : "none", mixBlendMode: "normal" }}
              />
            ) : null}

            {cropOverlay && layers.original ? (
              <div
                className="absolute border-2 border-[#ca913d] shadow-[0_0_0_9999px_rgba(12,18,48,0.55)]"
                style={{
                  left: `${cropOverlay.leftPct}%`,
                  top: `${cropOverlay.topPct}%`,
                  width: `${cropOverlay.widthPct}%`,
                  height: `${cropOverlay.heightPct}%`,
                  cursor: "move",
                  touchAction: "none",
                }}
                onPointerDown={(e) => beginCropDrag("crop-move", e)}
              >
                {board.socialSafe ? (
                  <div className="pointer-events-none absolute inset-[8%] border border-dashed border-white/70" />
                ) : null}
                {(["tl", "tr", "bl", "br"] as const).map((c) => (
                  <span
                    key={c}
                    className="absolute h-3 w-3 border-2 border-[#ca913d] bg-white"
                    style={{
                      top: c.startsWith("t") ? -6 : undefined,
                      bottom: c.startsWith("b") ? -6 : undefined,
                      left: c.endsWith("l") ? -6 : undefined,
                      right: c.endsWith("r") ? -6 : undefined,
                      cursor:
                        c === "tl" || c === "br"
                          ? "nwse-resize"
                          : "nesw-resize",
                      touchAction: "none",
                    }}
                    onPointerDown={(e) => beginCropDrag(c, e)}
                  />
                ))}
              </div>
            ) : null}

            {focusPct && layers.original ? (
              <span
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ca913d] bg-[#ca913d]/40"
                style={{ left: `${focusPct.left}%`, top: `${focusPct.top}%` }}
                aria-hidden
              />
            ) : null}

            {layers.text && brandText.trim() ? (
              <div
                className={`pointer-events-none absolute inset-x-0 px-4 ${
                  textPos === "bottom" ? "bottom-3" : "top-3"
                }`}
                style={
                  cropOverlay
                    ? {
                        left: `${cropOverlay.leftPct}%`,
                        width: `${cropOverlay.widthPct}%`,
                        top: textPos === "top" ? `${cropOverlay.topPct}%` : undefined,
                        bottom:
                          textPos === "bottom"
                            ? `${100 - cropOverlay.topPct - cropOverlay.heightPct}%`
                            : undefined,
                      }
                    : undefined
                }
              >
                <p className="text-center font-heading text-lg font-bold uppercase tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] sm:text-2xl">
                  {brandText}
                </p>
                <p className="mt-0.5 text-center font-body text-[10px] font-semibold text-[#ca913d] drop-shadow">
                  Kelly Grappe
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {!board.aspect ? (
          <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 font-body text-[10px] text-white">
            {board.label} · fit-inside (no crop frame)
          </p>
        ) : (
          <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 font-body text-[10px] text-white">
            Artboard {board.label}
            {board.socialSafe ? " · 8% safe margin" : ""}
            {cropDirty.current ? " · custom crop" : " · focus crop"}
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-end gap-3">
        <label className="inline-flex flex-col gap-0.5 font-body text-[11px] text-[#12124a]">
          Brand text
          <select
            className={`${EVIDENCE_FIELD_CLASS} min-w-[12rem]`}
            value={
              STUDIO_BRAND_TEXT_PRESETS.find((p) => p.text === brandText)?.id ??
              (brandText ? "custom" : "none")
            }
            onChange={(e) => {
              const id = e.target.value;
              if (id === "none") {
                setBrandText("");
                setLayers((prev) => ({ ...prev, text: false }));
                return;
              }
              if (id === "custom") return;
              const preset = STUDIO_BRAND_TEXT_PRESETS.find((p) => p.id === id);
              if (preset) {
                setBrandText(preset.text);
                setLayers((prev) => ({ ...prev, text: true }));
              }
            }}
          >
            <option value="none">None</option>
            {STUDIO_BRAND_TEXT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            {brandText && !STUDIO_BRAND_TEXT_PRESETS.some((p) => p.text === brandText) ? (
              <option value="custom">Custom</option>
            ) : null}
          </select>
        </label>
        <label className="inline-flex flex-col gap-0.5 font-body text-[11px] text-[#12124a]">
          Custom text
          <input
            className={`${EVIDENCE_FIELD_CLASS} min-w-[14rem]`}
            value={brandText}
            maxLength={120}
            placeholder="Operator-authored only"
            onChange={(e) => {
              const v = e.target.value;
              setBrandText(v);
              if (v.trim()) setLayers((prev) => ({ ...prev, text: true }));
            }}
          />
        </label>
        <label className="inline-flex items-center gap-1.5 self-end font-body text-[11px]">
          <input
            type="radio"
            checked={textPos === "bottom"}
            onChange={() => setTextPos("bottom")}
          />
          Bottom
        </label>
        <label className="inline-flex items-center gap-1.5 self-end font-body text-[11px]">
          <input type="radio" checked={textPos === "top"} onChange={() => setTextPos("top")} />
          Top
        </label>
      </div>

      <p className="mt-2 font-body text-[10px] text-[#364272]">
        Focus{" "}
        {focus
          ? `${Math.round(focus.x * 100)}% × ${Math.round(focus.y * 100)}%`
          : "unset — click canvas"}
        {cropRect
          ? ` · crop ${Math.round(cropRect.w * 100)}×${Math.round(cropRect.h * 100)}%`
          : ""}
        {" · "}
        Layers → Confirm: Grade {layers.grade ? "on" : "off"}
        {layers.ai && aiLayerSrc ? " · AI on" : ""}
        {layers.text && brandText.trim() ? " · Text on" : ""}
      </p>
    </div>
  );
}
