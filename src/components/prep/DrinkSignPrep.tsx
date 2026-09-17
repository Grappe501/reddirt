"use client";

import { useState } from "react";

const QR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 37 37" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h37v37H0z"/><path stroke="#000000" d="M4 4.5h7m1 0h1m1 0h1m1 0h1m5 0h1m3 0h7M4 5.5h1m5 0h1m2 0h3m4 0h1m2 0h2m1 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m3 0h4m1 0h4m3 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m1 0h3m1 0h1m1 0h3m3 0h1m1 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h2m2 0h3m1 0h3m3 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m1 0h2m3 0h3m1 0h1m1 0h2m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h2m1 0h1m2 0h1m2 0h1M4 12.5h1m3 0h1m1 0h3m4 0h3m1 0h1m1 0h1m1 0h5m2 0h1M6 13.5h1m1 0h2m2 0h3m7 0h1m3 0h7M5 14.5h3m2 0h1m1 0h1m2 0h1m1 0h3m4 0h2m1 0h2m3 0h1M4 15.5h1m1 0h1m7 0h2m1 0h1m1 0h1m1 0h2m5 0h2m1 0h2M4 16.5h1m2 0h1m2 0h2m1 0h1m2 0h2m3 0h1m1 0h3m5 0h1M5 17.5h2m5 0h1m1 0h1m2 0h6m3 0h1m1 0h5M4 18.5h4m1 0h4m1 0h1m4 0h2m1 0h1m3 0h1m1 0h3m1 0h1M4 19.5h1m2 0h2m4 0h1m1 0h1m2 0h2m1 0h3m2 0h1m4 0h2M4 20.5h1m1 0h1m2 0h2m2 0h6m1 0h2m1 0h1m1 0h1m1 0h1m3 0h1M4 21.5h2m1 0h1m3 0h3m5 0h4m3 0h4m1 0h2M6 22.5h2m1 0h2m3 0h6m1 0h2m1 0h1m3 0h1m1 0h1m1 0h1M6 23.5h1m1 0h1m3 0h1m1 0h2m1 0h1m1 0h8m4 0h2M4 24.5h2m1 0h4m1 0h2m1 0h3m3 0h9m2 0h1M12 25.5h2m3 0h8m3 0h1m3 0h1M4 26.5h7m1 0h1m2 0h1m3 0h2m1 0h3m1 0h1m1 0h3m1 0h1M4 27.5h1m5 0h1m2 0h4m1 0h1m2 0h4m3 0h1m2 0h1M4 28.5h1m1 0h3m1 0h1m1 0h2m1 0h5m1 0h1m1 0h7M4 29.5h1m1 0h3m1 0h1m2 0h1m1 0h2m2 0h2m1 0h1m1 0h2m1 0h1m4 0h1M4 30.5h1m1 0h3m1 0h1m2 0h1m1 0h5m1 0h2m1 0h2m3 0h4M4 31.5h1m5 0h1m6 0h2m2 0h1m1 0h2m3 0h2m1 0h2M4 32.5h7m1 0h3m1 0h1m2 0h1m1 0h1m2 0h1m2 0h2m2 0h1"/></svg>';
const QR_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(QR_SVG)}`;

const SIGNS = [
  { title: "Splenda Sweet Tea", file: "splenda-sweet-tea.jpg", full: false },
  { title: "Unsweet Tea", file: "unsweet-tea.jpg", full: false },
  { title: "Lemonade", file: "lemonade.jpg", full: false },
  { title: "Sugar Free Lemonade", file: "sugar-free-lemonade.jpg", full: false },
  { title: "Bottled Water", file: "bottled-water.jpg", full: true },
] as const;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  title: string,
  qr: HTMLImageElement,
  width: number,
  height: number,
  full: boolean,
) {
  ctx.fillStyle = "#2B1E1A";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(height * (full ? 0.11 : 0.12))}px Georgia, Times New Roman, serif`;
  const lines = wrapText(ctx, title, width * 0.86);
  const lineHeight = height * (full ? 0.13 : 0.14);
  const textTop = height * 0.22 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => ctx.fillText(line, width / 2, textTop + index * lineHeight));
  const qrSize = height * (full ? 0.36 : 0.34);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect((width - qrSize) / 2 - 6, height * 0.42, qrSize + 12, qrSize + 12);
  ctx.drawImage(qr, (width - qrSize) / 2, height * 0.42 + 6, qrSize, qrSize);
  ctx.fillStyle = "#A3472A";
  ctx.font = `800 ${Math.round(height * (full ? 0.045 : 0.055))}px Calibri, Arial, sans-serif`;
  ctx.fillText("DONATE  kellygrappe.com/donate", width / 2, height * 0.9);
}

async function loadQrImage() {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = QR_SRC;
  });
}

async function downloadSignJpg(title: string, filename: string, full: boolean) {
  const qr = await loadQrImage();
  const dpi = 300;
  const width = (full ? 8.5 : 4.25) * dpi;
  const height = (full ? 11 : 5.5) * dpi;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw this sign.");
  ctx.fillStyle = "#F5EFE6";
  ctx.fillRect(0, 0, width, height);
  const faceH = height / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, faceH);
  ctx.clip();
  drawFace(ctx, title, qr, width, faceH, full);
  ctx.restore();
  ctx.save();
  ctx.translate(width / 2, faceH + faceH / 2);
  ctx.rotate(Math.PI);
  ctx.translate(-width / 2, -faceH / 2);
  drawFace(ctx, title, qr, width, faceH, full);
  ctx.restore();
  ctx.strokeStyle = "#5A6C7D";
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(24, faceH);
  ctx.lineTo(width - 24, faceH);
  ctx.stroke();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) throw new Error("Could not build the JPG.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function SignFace({ title, large = false }: { title: string; large?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 px-3 py-3 text-center ${large ? "min-h-[5.5in] gap-4 py-8" : "min-h-[2.75in]"}`}>
      <h2 className={`font-heading text-[#2B1E1A] ${large ? "text-5xl" : "text-2xl"}`}>{title}</h2>
      <div className={`bg-white p-1 ${large ? "h-36 w-36" : "h-24 w-24"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={QR_SRC} alt="" className="h-full w-full" />
      </div>
      <p className="font-body text-[10px] font-extrabold uppercase tracking-wide text-[#A3472A]">
        Donate · kellygrappe.com/donate
      </p>
    </div>
  );
}

export function DrinkSignPrep() {
  const [busy, setBusy] = useState<string | null>(null);

  async function onDownload(title: string, file: string, full: boolean) {
    setBusy(file);
    try {
      await downloadSignJpg(title, file, full);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-11 items-center justify-center rounded-btn bg-[#A3472A] px-5 py-3 text-sm font-bold text-white"
        >
          Print both pages
        </button>
        <p className="max-w-xl font-body text-sm text-kelly-text/80">
          Four drink tents print on one 8.5 × 11 sheet. Bottled water is its own full page. Each sign has Download JPG at the bottom.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {SIGNS.filter((sign) => !sign.full).map((sign) => (
          <article key={sign.file} className="flex flex-col">
            <div className="overflow-hidden rounded-xl border border-dashed border-[#b7a898] bg-[#F5EFE6] shadow-sm">
              <SignFace title={sign.title} />
              <p className="border-t border-dashed border-[#5A6C7D] py-1 text-center font-body text-[10px] uppercase tracking-[0.16em] text-[#5A6C7D]">
                Fold
              </p>
              <div className="rotate-180">
                <SignFace title={sign.title} />
              </div>
            </div>
            <button
              type="button"
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-btn bg-[#A3472A] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
              disabled={busy === sign.file}
              onClick={() => onDownload(sign.title, sign.file, false)}
            >
              {busy === sign.file ? "Building JPG…" : "Download JPG"}
            </button>
          </article>
        ))}
      </div>

      {SIGNS.filter((sign) => sign.full).map((sign) => (
        <article key={sign.file} className="flex flex-col">
          <div className="overflow-hidden rounded-xl border border-dashed border-[#b7a898] bg-[#F5EFE6] shadow-sm">
            <SignFace title={sign.title} large />
            <p className="border-t border-dashed border-[#5A6C7D] py-1 text-center font-body text-[10px] uppercase tracking-[0.16em] text-[#5A6C7D]">
              Fold
            </p>
            <div className="rotate-180">
              <SignFace title={sign.title} large />
            </div>
          </div>
          <button
            type="button"
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-btn bg-[#A3472A] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            disabled={busy === sign.file}
            onClick={() => onDownload(sign.title, sign.file, true)}
          >
            {busy === sign.file ? "Building JPG…" : "Download JPG"}
          </button>
        </article>
      ))}
    </div>
  );
}
