/**
 * V2.1 — Burn studio text (+ optional AI layer) onto Pro Edit assemblies.
 * Prefer Unknown: text is operator-authored only; never invents geography captions.
 */
import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { PhotoExportSlot } from "@/lib/campaign-media/photo-look-presets";
import { photoSlotSpec } from "@/lib/campaign-media/photo-look-presets";
import type { PhotoStudioBurnIn } from "@/lib/campaign-media/photo-edit-types";
import { studioArtboard } from "@/lib/campaign-media/photo-studio-specs";

function absPublic(src: string): string | null {
  if (!src.startsWith("/")) return null;
  const rel = src.replace(/^\//, "");
  try {
    const decoded = decodeURIComponent(rel);
    const a = path.join(process.cwd(), "public", decoded);
    if (existsSync(a)) return a;
  } catch {
    /* ignore */
  }
  const candidate = path.join(process.cwd(), "public", rel);
  return existsSync(candidate) ? candidate : null;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
    if (lines.length >= 3) break;
  }
  if (cur && lines.length < 3) lines.push(cur);
  return lines;
}

/** Build SVG text overlay sized to output frame. */
export function buildBurnInTextSvg(input: {
  width: number;
  height: number;
  text: string;
  position: "top" | "bottom";
  socialSafe: boolean;
}): Buffer {
  const w = Math.max(64, Math.floor(input.width));
  const h = Math.max(64, Math.floor(input.height));
  const inset = input.socialSafe ? Math.round(Math.min(w, h) * 0.08) : Math.round(Math.min(w, h) * 0.04);
  const fontSize = Math.max(22, Math.min(56, Math.round(w * 0.045)));
  const lineH = Math.round(fontSize * 1.2);
  const maxChars = Math.max(12, Math.floor((w - inset * 2) / (fontSize * 0.55)));
  const lines = wrapLines(input.text.slice(0, 120), maxChars);
  const blockH = lines.length * lineH + Math.round(fontSize * 0.6);
  const y0 =
    input.position === "top"
      ? inset + fontSize
      : h - inset - blockH + fontSize;

  const tspans = lines
    .map((line, i) => {
      const y = y0 + i * lineH;
      return `<tspan x="50%" dy="${i === 0 ? 0 : lineH}">${escapeXml(line)}</tspan>`.replace(
        `dy="${i === 0 ? 0 : lineH}"`,
        i === 0 ? `y="${y}" dy="0"` : `dy="${lineH}"`,
      );
    })
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.75"/>
    </filter>
  </defs>
  <rect x="0" y="${input.position === "top" ? 0 : h - blockH - inset * 1.2}" width="${w}" height="${blockH + inset * 1.2}" fill="url(#fade)" opacity="0"/>
  <text
    x="50%"
    text-anchor="middle"
    font-family="Arial Black, Helvetica Neue, Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="#FFFFFF"
    filter="url(#shadow)"
  >${tspans}</text>
  <text
    x="50%"
    y="${y0 + lines.length * lineH + Math.round(fontSize * 0.35)}"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${Math.max(11, Math.round(fontSize * 0.38))}"
    font-weight="600"
    fill="#ca913d"
    filter="url(#shadow)"
  >Kelly Grappe</text>
</svg>`;

  return Buffer.from(svg);
}

export function slotUsesSocialSafe(slot: PhotoExportSlot): boolean {
  return studioArtboard(slot).socialSafe;
}

/**
 * After base slot JPEG is written, optionally composite AI layer + burn-in text.
 * Mutates file at outAbs in place (still under campaign-derivatives).
 */
export async function applyStudioBurnInToAssembly(input: {
  outAbs: string;
  width: number;
  height: number;
  slot: PhotoExportSlot;
  burnIn?: PhotoStudioBurnIn | null;
}): Promise<{ ok: true; noteBits: string[] } | { ok: false; error: string }> {
  const burn = input.burnIn;
  if (!burn) return { ok: true, noteBits: [] };
  const noteBits: string[] = [];
  const w = input.width;
  const h = input.height;
  if (w <= 0 || h <= 0) return { ok: true, noteBits: [] };

  try {
    let pipeline = sharp(input.outAbs, { failOn: "none" });
    const composites: sharp.OverlayOptions[] = [];

    if (burn.includeAiLayer && burn.aiLayerPublicSrc) {
      const aiAbs = absPublic(burn.aiLayerPublicSrc);
      if (!aiAbs) {
        noteBits.push("AI layer missing on disk — skipped");
      } else if (
        !burn.aiLayerPublicSrc.startsWith("/media/campaign-derivatives/") &&
        !burn.aiLayerPublicSrc.startsWith("/media/campaign-shipped/")
      ) {
        noteBits.push("AI layer path not allowlisted — skipped");
      } else {
        const aiBuf = await sharp(aiAbs, { failOn: "none" })
          .resize({ width: w, height: h, fit: "cover", position: "attention" })
          .png()
          .toBuffer();
        composites.push({ input: aiBuf, blend: "over" });
        noteBits.push("AI layer");
      }
    }

    const text = String(burn.text ?? "").trim();
    if (burn.burnText && text) {
      const socialSafe = slotUsesSocialSafe(input.slot) || photoSlotSpec(input.slot).aspect != null;
      const svg = buildBurnInTextSvg({
        width: w,
        height: h,
        text,
        position: burn.textPosition === "top" ? "top" : "bottom",
        socialSafe,
      });
      composites.push({ input: svg, blend: "over" });
      noteBits.push(`text:${text.slice(0, 40)}`);
    }

    if (!composites.length) return { ok: true, noteBits };

    const tmp = `${input.outAbs}.${process.pid}.burn.tmp`;
    await pipeline
      .composite(composites)
      .jpeg({ quality: photoSlotSpec(input.slot).quality, mozjpeg: true })
      .toFile(tmp);
    const { renameSync } = await import("node:fs");
    renameSync(tmp, input.outAbs);
    return { ok: true, noteBits };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Burn-in composite failed." };
  }
}

export function normalizeBurnIn(raw: unknown): PhotoStudioBurnIn | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const text = String(o.text ?? "").trim().slice(0, 120);
  const ai = String(o.aiLayerPublicSrc ?? "").trim();
  const primary = typeof o.primarySlot === "string" ? o.primarySlot : undefined;
  return {
    burnText: o.burnText === true && text.length > 0,
    text,
    textPosition: o.textPosition === "top" ? "top" : "bottom",
    includeAiLayer: o.includeAiLayer === true && ai.length > 0,
    aiLayerPublicSrc: ai || undefined,
    primarySlot: primary as PhotoStudioBurnIn["primarySlot"],
  };
}
