"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { clickToFocusPoint, coverCropRect, type FocusPoint } from "@/lib/campaign-media/focus-crop";
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
  className?: string;
};

type DragMode = "none" | "pan" | "focus";

/**
 * P3 Photo Studio — interactive canvas for Edit desk.
 * Pan/zoom, artboard crop frame, safe margins, layer toggles, brand text preview.
 * Preview-only; Confirm render / Finish for web still use sharp server path.
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
  className = "",
}: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<DragMode>("none");
  const dragOrigin = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [layers, setLayers] = useState<Record<StudioLayerId, boolean>>({
    original: true,
    grade: true,
    ai: Boolean(aiLayerSrc),
    text: false,
  });
  const [brandText, setBrandText] = useState("");
  const [textPos, setTextPos] = useState<"bottom" | "top">("bottom");

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
  }, [photoId, src]);

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
    });
  }, [brandText, textPos, layers.text, layers.ai, aiLayerSrc, activeSlot, onBurnInChange]);

  const selectSlot = useCallback(
    (slot: PhotoExportSlot) => {
      setLocalSlot(slot);
      onActiveSlotChange?.(slot);
    },
    [onActiveSlotChange],
  );

  const toggleLayer = useCallback((id: StudioLayerId) => {
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  };

  const cropOverlay = useMemo(() => {
    if (!board.aspect || natural.w <= 0 || natural.h <= 0) return null;
    const rect = coverCropRect({
      srcWidth: natural.w,
      srcHeight: natural.h,
      targetAspect: board.aspect,
      focus,
    });
    return {
      leftPct: (rect.left / natural.w) * 100,
      topPct: (rect.top / natural.h) * 100,
      widthPct: (rect.width / natural.w) * 100,
      heightPct: (rect.height / natural.h) * 100,
    };
  }, [board.aspect, natural, focus]);

  const focusPct = focus
    ? { left: focus.x * 100, top: focus.y * 100 }
    : null;

  function onWheel(e: ReactWheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.min(4, Math.max(0.5, Number((z + delta).toFixed(2)))));
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button === 1 || e.shiftKey || e.button === 2) {
      setDrag("pan");
      dragOrigin.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    if (e.button === 0) {
      setDrag("focus");
      e.currentTarget.setPointerCapture(e.pointerId);
    }
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
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (drag === "focus") {
      const img = imgRef.current;
      if (img) {
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
        Pan: Shift+drag · Zoom: wheel · Click: set focus · Artboards = export slots. Preview only —
        Confirm render / Finish for web still write sharp derivatives. No generative invent.
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
              disabled={id === "ai" && !aiLayerSrc}
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
        style={{ touchAction: "none", cursor: drag === "pan" ? "grabbing" : "crosshair" }}
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
                Original layer hidden
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

            {/* Crop / artboard frame in image space */}
            {cropOverlay && layers.original ? (
              <div
                className="pointer-events-none absolute border-2 border-[#ca913d] shadow-[0_0_0_9999px_rgba(12,18,48,0.55)]"
                style={{
                  left: `${cropOverlay.leftPct}%`,
                  top: `${cropOverlay.topPct}%`,
                  width: `${cropOverlay.widthPct}%`,
                  height: `${cropOverlay.heightPct}%`,
                }}
              >
                {board.socialSafe ? (
                  <div className="absolute inset-[8%] border border-dashed border-white/70" />
                ) : null}
                {/* Corner handles (visual only — crop is focus-driven) */}
                {(["tl", "tr", "bl", "br"] as const).map((c) => (
                  <span
                    key={c}
                    className="absolute h-2.5 w-2.5 border-2 border-[#ca913d] bg-white"
                    style={{
                      top: c.startsWith("t") ? -5 : undefined,
                      bottom: c.startsWith("b") ? -5 : undefined,
                      left: c.endsWith("l") ? -5 : undefined,
                      right: c.endsWith("r") ? -5 : undefined,
                    }}
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
              >
                <p className="text-center font-heading text-lg font-bold uppercase tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] sm:text-2xl">
                  {brandText}
                </p>
                <p className="mt-0.5 text-center font-body text-[10px] font-semibold text-[#ca913d] drop-shadow">
                  Kelly Grappe · preview only
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
          </p>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-end gap-3">
        <label className="inline-flex flex-col gap-0.5 font-body text-[11px] text-[#12124a]">
          Brand text
          <select
            className={EVIDENCE_FIELD_CLASS}
            value={
              STUDIO_BRAND_TEXT_PRESETS.find((p) => p.text === brandText)?.id ??
              (brandText ? "custom" : "none")
            }
            onChange={(e) => {
              const id = e.target.value;
              const preset = STUDIO_BRAND_TEXT_PRESETS.find((p) => p.id === id);
              if (preset) {
                setBrandText(preset.text);
                setLayers((prev) => ({ ...prev, text: Boolean(preset.text) }));
              }
            }}
          >
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
        <label className="inline-flex min-w-[12rem] flex-1 flex-col gap-0.5 font-body text-[11px] text-[#12124a]">
          Custom line
          <input
            className={EVIDENCE_FIELD_CLASS}
            value={brandText}
            onChange={(e) => {
              setBrandText(e.target.value);
              if (e.target.value.trim()) setLayers((prev) => ({ ...prev, text: true }));
            }}
            placeholder="Optional overlay (preview only)"
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
        {" · "}
        {layers.text && brandText.trim()
          ? "Text burns in on Confirm / Finish."
          : layers.ai && aiLayerSrc
            ? "AI layer burns in when enabled on Confirm / Finish."
            : "Enable Text (or AI) layer to burn into Confirm / Finish."}
      </p>
    </div>
  );
}
