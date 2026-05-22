"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { uploadHotWashMediaAction } from "@/app/admin/(board)/campaign-events/media-actions";
import type { HotWashMediaRecord } from "@/lib/campaign-events/media/hot-wash-media-types";
import { mediaTypeMatchesPanel } from "@/lib/campaign-events/media/media-mime";
import type { HotWashNotes } from "@/lib/campaign-events/hot-wash-notes";
import type { HotWashIntelligenceData } from "@/lib/campaign-events/hot-wash-intelligence/hot-wash-intelligence-types";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import { HotWashIntelligenceWorkspace } from "./HotWashIntelligenceWorkspace";

const PANELS = [
  { id: "photos", title: "Photos", hint: "image/*" },
  { id: "videos", title: "Videos", hint: "video/*" },
  { id: "speeches", title: "Speeches / remarks", hint: "audio/*, speech files" },
  { id: "documents", title: "Documents", hint: "pdf, doc, txt, md" },
  { id: "uploader_submissions", title: "Uploader submissions", hint: "Grouped by uploader — all pending types" },
  { id: "pending_approval", title: "Pending approval", hint: "Awaiting campaign manager" },
  { id: "approved_archive", title: "Approved county archive", hint: "CM-approved — not mixed with pending" },
] as const;

const FUTURE_ACTIONS = [
  "Transcribe speech",
  "Extract speech quotes",
  "Summarize remarks",
  "Chunk into AI knowledge base",
  "Attach to county memory",
  "Attach to event memory",
  "Add to approved county archive (auto)",
] as const;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-950",
    approved: "bg-emerald-50 text-emerald-900",
    rejected: "bg-red-50 text-red-950",
    needs_review: "bg-kelly-navy/10 text-kelly-navy",
    published: "bg-emerald-50 text-emerald-900",
  };
  return map[status] ?? "bg-kelly-wash text-kelly-muted";
}

function MediaThumb({ item }: { item: HotWashMediaRecord }) {
  const src = `/api/admin/campaign-events/media/${item.id}`;
  if (item.mediaType === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-14 w-14 rounded-lg border object-cover" />
    );
  }
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-kelly-wash font-mono text-[10px] uppercase">
      {item.mediaType.slice(0, 4)}
    </div>
  );
}

function filterForPanel(panelId: string, items: HotWashMediaRecord[]): HotWashMediaRecord[] {
  if (panelId === "uploader_submissions") return items.filter((i) => i.approvalStatus === "pending");
  if (panelId === "pending_approval") return items.filter((i) => i.approvalStatus === "pending" || i.approvalStatus === "needs_review");
  if (panelId === "approved_archive") return items.filter((i) => i.approvalStatus === "approved");
  return items.filter((i) => mediaTypeMatchesPanel(i.mediaType, panelId));
}

export function HotWashMediaSection({
  recordId,
  row,
  eventTitle,
  countyLabel,
  mediaItems,
  byUploader,
  hotWashNotes,
  hotWashIntelligence,
}: {
  recordId: string;
  row: CalendarSurfaceRow;
  eventTitle: string;
  countyLabel?: string;
  mediaItems: HotWashMediaRecord[];
  byUploader: Array<{ uploaderName: string; uploaderEmail: string; uploads: HotWashMediaRecord[] }>;
  hotWashNotes: HotWashNotes;
  hotWashIntelligence: HotWashIntelligenceData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState("Campaign admin");
  const [uploaderEmail, setUploaderEmail] = useState("admin@campaign.local");
  const [caption, setCaption] = useState("");

  const panelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of PANELS) counts[p.id] = filterForPanel(p.id, mediaItems).length;
    return counts;
  }, [mediaItems]);

  const onUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("eventRecordId", recordId);
    fd.set("uploaderName", uploaderName);
    fd.set("uploaderEmail", uploaderEmail);
    fd.set("caption", caption);
    startTransition(async () => {
      const res = await uploadHotWashMediaAction(fd);
      if (!res.ok) {
        setUploadError(res.error);
        return;
      }
      form.reset();
      setCaption("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-4 font-body text-sm">
        <p>
          <strong>Hot Wash media intake</strong> for <em>{eventTitle}</em>
          {countyLabel ? <> · {countyLabel}</> : null}. Uploads land in <strong>pending</strong> folders by uploader until the{" "}
          <Link href="/admin/campaign-events/media-approval" className="font-semibold text-kelly-navy underline">
            media approval queue
          </Link>{" "}
          promotes them to the county archive.
        </p>
        <p className="mt-2 text-xs text-kelly-muted">
          Storage: <code className="rounded bg-white/60 px-1">data/campaign-events/media/&#123;county&#125;/&#123;date&#125;/&#123;event&#125;/pending/&#123;uploader&#125;/</code>
        </p>
      </section>

      <HotWashIntelligenceWorkspace row={row} initial={hotWashIntelligence} />

      <section className="rounded-2xl border border-dashed border-kelly-navy/30 bg-kelly-page p-4">
        <h2 className="font-heading text-base font-bold">Admin upload</h2>
        <p className="mt-1 font-body text-xs text-kelly-muted">
          Accepts image/*, video/*, audio/*, .pdf, .doc, .docx, .txt, .md — stored pending until CM approval.
        </p>
        <form onSubmit={onUpload} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-xs font-bold text-kelly-slate">File</span>
            <input type="file" name="file" required className="text-sm" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-bold text-kelly-slate">Uploader name</span>
            <input className="rounded-lg border px-3 py-2" value={uploaderName} onChange={(e) => setUploaderName(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-bold text-kelly-slate">Uploader email</span>
            <input className="rounded-lg border px-3 py-2" value={uploaderEmail} onChange={(e) => setUploaderEmail(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-xs font-bold text-kelly-slate">Caption (optional)</span>
            <input className="rounded-lg border px-3 py-2" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Scene description for future SEO metadata" />
          </label>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-sm font-bold text-white">
              {pending ? "Uploading…" : "Upload to pending"}
            </button>
            {uploadError ? <span className="text-xs font-bold text-red-800">{uploadError}</span> : null}
          </div>
        </form>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {PANELS.map((panel) => {
          const items = filterForPanel(panel.id, mediaItems);
          return (
            <section key={panel.id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-sm font-bold">{panel.title}</h3>
                  <p className="text-[11px] text-kelly-subtle">{panel.hint}</p>
                </div>
                <span className="rounded-full bg-kelly-wash px-2 py-0.5 text-xs font-bold">{panelCounts[panel.id] ?? 0}</span>
              </div>
              {panel.id === "uploader_submissions" && byUploader.length > 0 ? (
                <ul className="mt-3 space-y-2 text-xs">
                  {byUploader.map((g) => (
                    <li key={`${g.uploaderEmail}-${g.uploaderName}`} className="rounded-lg border border-kelly-text/10 px-2 py-1.5">
                      <strong>{g.uploaderName}</strong> · {g.uploaderEmail} — {g.uploads.length} file(s)
                    </li>
                  ))}
                </ul>
              ) : null}
              <ul className="mt-3 space-y-2">
                {items.length === 0 ? (
                  <li className="text-xs text-kelly-subtle">No items — use admin upload above.</li>
                ) : (
                  items.slice(0, 6).map((item) => (
                    <li key={item.id} className="flex items-center gap-2 rounded-lg border border-kelly-text/10 px-2 py-1.5">
                      <MediaThumb item={item} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">{item.originalFilename}</p>
                        <p className="text-[10px] text-kelly-subtle">
                          {item.uploaderName} · <span className={`rounded px-1 font-bold uppercase ${statusBadge(item.approvalStatus)}`}>{item.approvalStatus}</span>
                        </p>
                      </div>
                    </li>
                  ))
                )}
                {items.length > 6 ? <li className="text-[10px] text-kelly-subtle">+{items.length - 6} more</li> : null}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-wash/50 p-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-kelly-slate">Future: transcription &amp; AI memory</h2>
        <p className="mt-2 font-body text-xs text-kelly-muted">
          Per-file pipeline fields exist in metadata (`transcriptionStatus`, `chunkingStatus`). Actions below are scaffolded for a later pass.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FUTURE_ACTIONS.map((label) => (
            <button key={label} type="button" disabled className="rounded-full border border-kelly-text/15 px-3 py-1 text-[11px] font-bold text-kelly-text/40">
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
