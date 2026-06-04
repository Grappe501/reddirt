"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { VideoArchiveRoomPacket } from "@/lib/legislature/videoArchiveRoom";
import { VideoArchiveOpponentMedia } from "@/components/admin/intelligence/VideoArchiveOpponentMedia";
import {
  VideoArchiveLegislativeOffense,
  VideoArchiveRoadStories,
} from "@/components/admin/intelligence/VideoArchiveLegislativeOffense";

type RegisterMode = "manual_sponsor_link" | "team_cut" | null;

export function VideoArchiveRoomClient({ packet }: { packet: VideoArchiveRoomPacket }) {
  const [mainTab, setMainTab] = useState<"bills" | "hammer" | "packo" | "offense" | "road">("bills");
  const [filter, setFilter] = useState<"all" | "with_video" | "anchors" | "missing">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [registerMode, setRegisterMode] = useState<RegisterMode>(null);
  const [registerBill, setRegisterBill] = useState({ billNumber: "", session: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return packet.bills.filter((b) => {
      if (filter === "with_video") return b.committeeVideos.length > 0;
      if (filter === "anchors") return b.isDebateAnchor;
      if (filter === "missing") return b.committeeVideos.length === 0;
      return true;
    });
  }, [packet.bills, filter]);

  async function submitRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    const type = registerMode;
    if (!type) return;

    const body =
      type === "manual_sponsor_link"
        ? {
            type,
            billNumber: String(fd.get("billNumber")),
            session: String(fd.get("session")),
            committeeName: String(fd.get("committeeName")),
            meetingDate: String(fd.get("meetingDate") || "") || undefined,
            videoUrl: String(fd.get("videoUrl")),
            sponsorLabel: String(fd.get("sponsorLabel") || "") || undefined,
            notes: String(fd.get("notes") || "") || undefined,
          }
        : {
            type: "team_cut" as const,
            billNumber: String(fd.get("billNumber")),
            session: String(fd.get("session")),
            title: String(fd.get("title")),
            externalUrl: String(fd.get("externalUrl") || "") || undefined,
            parentCandidateId: String(fd.get("parentCandidateId") || "") || undefined,
            notes: String(fd.get("notes") || "") || undefined,
          };

    try {
      const res = await fetch("/api/admin/intelligence/video-archive/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus(data.error ?? "Register failed");
      } else {
        setStatus("Saved — refresh page to see new link.");
        setRegisterMode(null);
      }
    } catch {
      setStatus("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Focus bills", packet.focusBillCount],
          ["With committee video", packet.billsWithVideo],
          ["Committee links", packet.totalCommitteeLinks],
          ["Cut & ready", packet.cutReadyCount],
          ["Folder", packet.cutReadyFolderLabel],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-kelly-text/10 bg-white p-3 text-xs">
            <p className="font-bold uppercase text-kelly-subtle">{label}</p>
            <p className="mt-1 font-heading text-xl font-bold text-kelly-navy">{value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2 text-xs">
        {(
          [
            ["bills", `Committee bills (${packet.focusBillCount})`],
            ["offense", `Legislative offense (${packet.legislativeRecord?.bills?.length ?? 0} acts)`],
            ["road", `Road stories (${packet.roadStories?.storySlots?.length ?? 0})`],
            ["hammer", `Kim Hammer (${packet.opponentMedia.hammer.length} links)`],
            ["packo", `Michael Packo (${packet.opponentMedia.packo.length} links)`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMainTab(key)}
            className={`rounded-full border px-3 py-1.5 font-bold ${
              mainTab === key ? "border-kelly-navy bg-kelly-navy text-white" : "border-kelly-navy/30 text-kelly-navy"
            }`}
          >
            {label}
          </button>
        ))}
        <Link href="/admin/intelligence/kelly-debate-coaching" className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 font-bold text-violet-950">
          Debate coaching →
        </Link>
      </div>

      {mainTab === "offense" && packet.legislativeRecord ? (
        <VideoArchiveLegislativeOffense packet={packet} />
      ) : null}

      {mainTab === "road" && packet.roadStories ? (
        <VideoArchiveRoadStories packet={packet} />
      ) : null}

      {mainTab === "hammer" ? (
        <VideoArchiveOpponentMedia
          rows={packet.opponentMedia.hammer}
          opponentLabel="Kim Hammer"
          cutReadyFolderLabel={packet.cutReadyFolderLabel}
        />
      ) : null}

      {mainTab === "packo" ? (
        <VideoArchiveOpponentMedia
          rows={packet.opponentMedia.packo}
          opponentLabel="Michael Packo (Pakko)"
          cutReadyFolderLabel={packet.cutReadyFolderLabel}
        />
      ) : null}

      {mainTab === "bills" ? (
        <>
      <article className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 text-xs text-sky-950">
        <p className="font-bold uppercase">Team workflow</p>
        <p className="mt-2">{packet.operatorNotes}</p>
        <ol className="mt-3 list-inside list-decimal space-y-1">
          <li>Open <strong>Watch</strong> on committee sponsor presentation (Arkleg Harmony link).</li>
          <li>
            Use <strong>Download source</strong> — opens stream URL (save locally for edit; some streams need browser).
          </li>
          <li>Cut snippet in your editor → register cut in <strong>{packet.cutReadyFolderLabel}</strong> (URL or upload phase 2).</li>
          <li>Debate / claims review before any public use — speaker verification required.</li>
        </ol>
      </article>

      <div className="flex flex-wrap gap-2 text-xs">
        {(
          [
            ["all", "All focus bills"],
            ["anchors", "Debate anchors"],
            ["with_video", "Has video"],
            ["missing", "Missing video"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 font-bold ${
              filter === key ? "border-kelly-navy bg-kelly-navy text-white" : "border-kelly-navy/30 text-kelly-navy"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setRegisterMode("manual_sponsor_link");
            setRegisterBill({ billNumber: "", session: "" });
          }}
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 font-bold text-violet-950"
        >
          + Committee video link
        </button>
        <button
          type="button"
          onClick={() => setRegisterMode("team_cut")}
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 font-bold text-emerald-950"
        >
          + Cut & ready
        </button>
      </div>

      {registerMode ? (
        <form onSubmit={submitRegister} className="rounded-xl border border-kelly-navy/20 bg-white p-4 text-xs">
          <p className="font-bold uppercase text-kelly-navy">
            {registerMode === "manual_sponsor_link" ? "Register committee sponsor video" : "Register team cut (cut-and-ready)"}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input name="billNumber" placeholder="Bill (SB250)" required defaultValue={registerBill.billNumber} className="rounded border px-2 py-1" />
            <input name="session" placeholder="Session (2023)" required defaultValue={registerBill.session} className="rounded border px-2 py-1" />
            {registerMode === "manual_sponsor_link" ? (
              <>
                <input name="committeeName" placeholder="Committee name" required className="rounded border px-2 py-1 sm:col-span-2" />
                <input name="meetingDate" placeholder="Meeting date" className="rounded border px-2 py-1" />
                <input name="sponsorLabel" placeholder="Speaker (Kim Hammer)" className="rounded border px-2 py-1" />
                <input name="videoUrl" placeholder="Harmony / video URL" required type="url" className="rounded border px-2 py-1 sm:col-span-2" />
              </>
            ) : (
              <>
                <input name="title" placeholder="Clip title" required className="rounded border px-2 py-1 sm:col-span-2" />
                <input name="externalUrl" placeholder="Hosted URL (Drive, Dropbox, media library)" type="url" className="rounded border px-2 py-1 sm:col-span-2" />
                <input name="parentCandidateId" placeholder="Source candidate id (optional)" className="rounded border px-2 py-1 sm:col-span-2" />
              </>
            )}
            <textarea name="notes" placeholder="Notes" rows={2} className="rounded border px-2 py-1 sm:col-span-2" />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={busy} className="rounded bg-kelly-navy px-3 py-1.5 font-bold text-white disabled:opacity-50">
              Save
            </button>
            <button type="button" onClick={() => setRegisterMode(null)} className="rounded border px-3 py-1.5 font-bold">
              Cancel
            </button>
          </div>
          {status ? <p className="mt-2 text-amber-900">{status}</p> : null}
          <p className="mt-2 text-kelly-muted">File upload to database: use Media Center ingest (phase 2) — this form saves links and metadata now.</p>
        </form>
      ) : null}

      <div className="space-y-3">
        {filtered.map((bill) => {
          const key = `${bill.billNumber}-${bill.session}`;
          const open = expanded === key;
          return (
            <article key={key} className="rounded-xl border border-kelly-text/10 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : key)}
                className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left text-xs"
              >
                <div>
                  <span className="font-bold text-kelly-navy">
                    {bill.billNumber}
                    {bill.isDebateAnchor ? (
                      <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] uppercase text-violet-900">Anchor</span>
                    ) : null}
                    <span className="ml-2 rounded bg-kelly-page px-1.5 py-0.5 text-[10px] uppercase text-kelly-subtle">{bill.priorityLevel}</span>
                  </span>
                  <p className="mt-1 max-w-3xl text-kelly-muted line-clamp-2">{bill.title}</p>
                  <p className="mt-1 text-[10px] text-kelly-subtle">
                    {bill.sponsor} · {bill.session} · {bill.committeeVideos.length} committee video
                    {bill.committeeVideos.length === 1 ? "" : "s"} · {bill.cutReadyAssets.length} cut
                    {bill.cutReadyAssets.length === 1 ? "" : "s"} ready
                  </p>
                </div>
                <span className="text-kelly-navy">{open ? "▲" : "▼"}</span>
              </button>

              {open ? (
                <div className="border-t border-kelly-text/10 px-4 pb-4">
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={bill.billUrl} target="_blank" rel="noreferrer" className="font-bold text-kelly-navy underline">
                      Arkleg bill page →
                    </a>
                    <a
                      href={`/admin/intelligence/kim-hammer/bills/${bill.billNumber}`}
                      className="font-bold text-kelly-navy underline"
                    >
                      Bill drill-down →
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterBill({ billNumber: bill.billNumber, session: bill.session });
                        setRegisterMode("manual_sponsor_link");
                      }}
                      className="font-bold text-violet-900 underline"
                    >
                      Add video link
                    </button>
                  </div>

                  <h3 className="mt-4 text-[10px] font-bold uppercase text-kelly-subtle">Committee / sponsor presentations</h3>
                  {bill.committeeVideos.length === 0 ? (
                    <p className="mt-2 text-xs text-amber-900">No video linked yet — add committee link or run discovery pipeline.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {bill.committeeVideos.map((v) => (
                        <li key={v.id} className="rounded-lg border border-kelly-text/10 p-3 text-xs">
                          <p className="font-bold text-kelly-navy">{v.committeeName}</p>
                          <p className="text-kelly-muted">
                            {v.meetingDate} · {v.expectedSpeaker} · {v.origin} · {v.processingStatus}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3">
                            <a href={v.videoUrl} target="_blank" rel="noreferrer" className="font-bold text-kelly-navy underline">
                              Watch
                            </a>
                            <a href={v.downloadHref} className="font-bold text-kelly-navy underline">
                              Download source
                            </a>
                            {v.sourcePageUrl ? (
                              <a href={v.sourcePageUrl} target="_blank" rel="noreferrer" className="text-kelly-muted underline">
                                Bill context
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                setRegisterBill({ billNumber: bill.billNumber, session: bill.session });
                                setRegisterMode("team_cut");
                              }}
                              className="font-bold text-emerald-900 underline"
                            >
                              Register cut from this
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <h3 className="mt-4 text-[10px] font-bold uppercase text-emerald-900">{packet.cutReadyFolderLabel}</h3>
                  {bill.cutReadyAssets.length === 0 ? (
                    <p className="mt-2 text-xs text-kelly-muted">No team cuts registered for this bill yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {bill.cutReadyAssets.map((a) => (
                        <li key={a.id} className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-3 text-xs">
                          <p className="font-bold text-emerald-950">{a.title}</p>
                          <div className="mt-2 flex flex-wrap gap-3">
                            {a.externalUrl ? (
                              <a href={a.externalUrl} target="_blank" rel="noreferrer" className="font-bold underline">
                                Open cut
                              </a>
                            ) : null}
                            <a
                              href={`/api/admin/intelligence/video-archive/download?assetId=${encodeURIComponent(a.id)}`}
                              className="font-bold underline"
                            >
                              Download
                            </a>
                            {a.ownedMediaAssetId ? (
                              <a
                                href={`/api/owned-campaign-media/${a.ownedMediaAssetId}/file`}
                                className="font-bold underline"
                              >
                                Media library file
                              </a>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <section className="rounded-xl border border-dashed border-kelly-navy/30 bg-kelly-page/50 p-4 text-xs text-kelly-muted">
        <p className="font-bold uppercase text-kelly-navy">Phase 2 — database upload</p>
        <p className="mt-2">
          Multipart upload will create <code>OwnedMediaAsset</code> rows tagged <code>legislative_video_archive</code> and link here automatically.
          Until then, register hosted URLs for cuts or use Media Center for raw files.
        </p>
      </section>
        </>
      ) : null}
    </div>
  );
}
