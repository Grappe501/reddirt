"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  applyTurboProposalAction,
  batchSavePhotoEvidenceAction,
  getEvidencePublishQueueAction,
  getTurboProposalsForPhotosAction,
  proposeEventNightPackAction,
  proposeEventReelAction,
  renderEventReelAction,
  runEventNightLoopAction,
  runTonightPublishRitualAction,
  runVisionIdentifyBatchAction,
} from "@/app/admin/evidence-workbench-actions";
import type { EventNightPack } from "@/lib/campaign-media/evidence-event-night-pack";
import type { EventReelProject } from "@/lib/campaign-media/event-reel-types";
import type { TurboPhotoProposal } from "@/lib/campaign-media/turbo-ingest-types";

type CalRow = { id: string; date: string; summary: string; status: string };

type DeskStage = "pick" | "propose" | "identify" | "save" | "approve";

type PackRowEdit = {
  county: string;
  city: string;
  venue: string;
  eventDate: string;
  eventName: string;
  photographer: string;
  whatThisProves: string;
  applied: boolean;
  saved: boolean;
};

type Props = {
  calendarRows: CalRow[];
  initialNeedsApprovalIds?: string[];
};

const STAGES: Array<{ id: DeskStage; label: string; hint: string }> = [
  { id: "pick", label: "1 · Pick", hint: "Confirmed calendar row" },
  { id: "propose", label: "2 · Propose", hint: "Pack + optional reel" },
  { id: "identify", label: "3 · Identify", hint: "Vision proposals only" },
  { id: "save", label: "4 · Save", hint: "Inline Apply / Save" },
  { id: "approve", label: "5 · Approve", hint: "Confirm-gated — then Publish desk" },
];

function emptyEdit(photo: EventNightPack["photos"][number], proposal?: TurboPhotoProposal | null): PackRowEdit {
  const id = proposal?.identify;
  return {
    county: id?.county && id.county !== "Unknown" ? id.county : photo.county || "Unknown",
    city: id?.city && id.city !== "Unknown" ? id.city : photo.city || "Unknown",
    venue: id?.venue && id.venue !== "Unknown" ? id.venue : "Unknown",
    eventDate: id?.eventDate && id.eventDate !== "Unknown" ? id.eventDate : photo.eventDate || "Unknown",
    eventName: id?.eventName && id.eventName !== "Unknown" ? id.eventName : photo.eventName || "Unknown",
    photographer: id?.photographer && id.photographer !== "Unknown" ? id.photographer : "Unknown",
    whatThisProves: id?.whatThisProves ?? "",
    applied: proposal?.status === "applied",
    saved: false,
  };
}

/**
 * Tonight Asset Desk — pack → identify → Apply/Save → Confirm Approve.
 * Phase 4: Ship last mile lives only on Publish desk.
 */
export function EvidenceEventNightLoopPanel({
  calendarRows,
  initialNeedsApprovalIds = [],
}: Props) {
  const confirmed = useMemo(
    () => calendarRows.filter((r) => r.status === "Confirmed"),
    [calendarRows],
  );
  const [rowId, setRowId] = useState(confirmed[0]?.id ?? calendarRows[0]?.id ?? "");
  const [stage, setStage] = useState<DeskStage>("pick");
  const [useAi, setUseAi] = useState(true);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [pack, setPack] = useState<EventNightPack | null>(null);
  const [reel, setReel] = useState<EventReelProject | null>(null);
  const [proposalsById, setProposalsById] = useState<Record<string, TurboPhotoProposal>>({});
  const [edits, setEdits] = useState<Record<string, PackRowEdit>>({});
  const [needsApprovalIds, setNeedsApprovalIds] = useState(initialNeedsApprovalIds);
  const [approveDone, setApproveDone] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  async function loadProposals(
    photos: EventNightPack["photos"],
  ) {
    const photoIds = photos.map((p) => p.id);
    if (!photoIds.length) {
      setProposalsById({});
      return;
    }
    const res = await getTurboProposalsForPhotosAction(photoIds);
    const map: Record<string, TurboPhotoProposal> = {};
    for (const p of res.proposals ?? []) map[p.photoId] = p;
    setProposalsById(map);
    setEdits((prev) => {
      const next = { ...prev };
      for (const photo of photos) {
        const id = photo.id;
        next[id] = {
          ...emptyEdit(photo, map[id] ?? null),
          applied: prev[id]?.applied || map[id]?.status === "applied",
          saved: prev[id]?.saved ?? false,
        };
      }
      return next;
    });
  }

  useEffect(() => {
    if (!pack?.photos.length) return;
    void loadProposals(pack.photos);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when pack identity changes
  }, [pack?.calendarRowId, pack?.photos.map((p) => p.id).join("|")]);

  function proposeOnly() {
    if (!rowId) {
      setMessage("Pick a calendar row first.");
      return;
    }
    start(async () => {
      const res = await proposeEventNightPackAction(rowId);
      setMessage(res.message);
      if (res.pack) {
        setPack(res.pack);
        setEdits({});
        setStage("propose");
      }
    });
  }

  function proposeReel() {
    if (!rowId) {
      setMessage("Pick a calendar row first.");
      return;
    }
    start(async () => {
      const res = await proposeEventReelAction({ calendarRowId: rowId, photoLimit: 10 });
      setMessage(res.message);
      if (res.project) setReel(res.project);
    });
  }

  function confirmRenderReel() {
    if (!reel?.id) {
      setMessage("Propose an event reel first.");
      return;
    }
    if (
      !window.confirm(
        `Confirm render event reel ${reel.stills.length} still(s) to 16:9 + 9:16? Never auto-encodes without this confirm.`,
      )
    ) {
      return;
    }
    start(async () => {
      const res = await renderEventReelAction({ projectId: reel.id, confirmRender: true });
      setMessage([res.message, ...(res.warnings ?? [])].filter(Boolean).join(" · "));
      if (res.ok && reel) {
        setReel({
          ...reel,
          status: "rendered",
          assemblies: res.assemblies ?? reel.assemblies,
        });
      }
    });
  }

  function runFullLoop() {
    if (!rowId) {
      setMessage("Pick a calendar row first.");
      return;
    }
    start(async () => {
      const res = await runEventNightLoopAction({
        calendarRowId: rowId,
        confirmTurbo: true,
        useAi,
        maxPhotos: 16,
      });
      setMessage(res.message);
      if (res.pack) {
        setPack(res.pack);
        setEdits({});
        setStage("identify");
      }
      if (res.pack?.photos.length) {
        await loadProposals(res.pack.photos);
      }
    });
  }

  function visionIdentify() {
    start(async () => {
      const res = await runVisionIdentifyBatchAction({
        confirm: true,
        useAi,
        maxPhotos: 16,
        photoIds: pack?.photos.map((p) => p.id),
      });
      setMessage(res.message);
      setStage("identify");
      if (pack?.photos.length) await loadProposals(pack.photos);
      setStage("save");
    });
  }

  function updateEdit(photoId: string, patch: Partial<PackRowEdit>) {
    setEdits((prev) => {
      const photo = pack?.photos.find((p) => p.id === photoId);
      const base =
        prev[photoId] ??
        (photo
          ? emptyEdit(photo, proposalsById[photoId] ?? null)
          : {
              county: "Unknown",
              city: "Unknown",
              venue: "Unknown",
              eventDate: "Unknown",
              eventName: "Unknown",
              photographer: "Unknown",
              whatThisProves: "",
              applied: false,
              saved: false,
            });
      return { ...prev, [photoId]: { ...base, ...patch } };
    });
  }

  function applyIdentifyRow(photoId: string) {
    start(async () => {
      const res = await applyTurboProposalAction({
        photoId,
        applyIdentify: true,
        applyFitFlags: false,
      });
      setMessage(res.message);
      if (res.ok) updateEdit(photoId, { applied: true });
      if (pack?.photos.length) await loadProposals(pack.photos);
    });
  }

  function saveRow(photoId: string) {
    const edit = edits[photoId];
    if (!edit) {
      setMessage(`No edit row for ${photoId}.`);
      return;
    }
    start(async () => {
      const res = await batchSavePhotoEvidenceAction({
        photoIds: [photoId],
        applyFields: [
          "county",
          "city",
          "venue",
          "eventDate",
          "eventName",
          "photographer",
          "whatThisProves",
        ],
        patch: {
          county: edit.county.trim() || "Unknown",
          city: edit.city.trim() || "Unknown",
          venue: edit.venue.trim() || "Unknown",
          eventDate: edit.eventDate.trim() || "Unknown",
          eventName: edit.eventName.trim() || "Unknown",
          photographer: edit.photographer.trim() || "Unknown",
          whatThisProves: edit.whatThisProves,
        },
      });
      setMessage(res.message);
      if (res.ok) {
        updateEdit(photoId, { saved: true });
        const q = await getEvidencePublishQueueAction();
        if (q.queue) setNeedsApprovalIds(q.queue.buckets.needsApproval.map((i) => i.id));
      }
    });
  }

  function applySaveAllKnown() {
    const ids =
      pack?.photos
        .map((p) => p.id)
        .filter((id) => {
          const e = edits[id];
          return e && e.county.trim() && e.county.trim() !== "Unknown";
        }) ?? [];
    if (!ids.length) {
      setMessage("No pack rows with a known county to Apply+Save. Prefer Unknown stays Unknown.");
      return;
    }
    start(async () => {
      const notes: string[] = [];
      for (const id of ids) {
        const apply = await applyTurboProposalAction({
          photoId: id,
          applyIdentify: true,
          applyFitFlags: false,
        });
        notes.push(`${id}: ${apply.message}`);
        const edit = edits[id];
        if (!edit) continue;
        const save = await batchSavePhotoEvidenceAction({
          photoIds: [id],
          applyFields: ["county", "city", "venue", "eventDate", "eventName", "photographer", "whatThisProves"],
          patch: {
            county: edit.county.trim() || "Unknown",
            city: edit.city.trim() || "Unknown",
            venue: edit.venue.trim() || "Unknown",
            eventDate: edit.eventDate.trim() || "Unknown",
            eventName: edit.eventName.trim() || "Unknown",
            photographer: edit.photographer.trim() || "Unknown",
            whatThisProves: edit.whatThisProves,
          },
        });
        notes.push(save.message);
        if (save.ok) updateEdit(id, { applied: true, saved: true });
      }
      setMessage(`Apply+Save known (${ids.length}): ${notes.slice(0, 4).join(" · ")}`);
      const q = await getEvidencePublishQueueAction();
      if (q.queue) setNeedsApprovalIds(q.queue.buckets.needsApproval.map((i) => i.id));
      setStage("approve");
    });
  }

  function tonightApprove() {
    if (
      !window.confirm(
        `Batch Approve ${needsApprovalIds.length || "current"} needs-approval still(s)? Unknown counties stay skipped. Never silent.`,
      )
    ) {
      return;
    }
    start(async () => {
      const res = await runTonightPublishRitualAction({
        confirmApprove: true,
        approvePhotoIds: needsApprovalIds.length ? needsApprovalIds : undefined,
        consentConfirmed,
        runTurbo: false,
      });
      setMessage(res.message);
      if (res.ritual) {
        setNeedsApprovalIds(res.ritual.needsApprovalIds);
        setApproveDone(true);
        setStage("approve");
      }
    });
  }

  const showSaveDesk =
    Boolean(pack?.photos.length) &&
    (stage === "identify" || stage === "save" || stage === "approve");

  return (
    <div className="mb-6 space-y-3 rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-4 text-[#12124a]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
            Tonight Asset Desk
          </p>
          <p className="mt-1 font-body text-xs text-[#364272]">
            Pack → identify → Apply/Save → Confirm Approve →{" "}
            <span className="font-semibold">Publish desk</span> for Ship last mile. Prefer Unknown.
            Never silent Approve.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/evidence-workbench?tab=identify&filter=unknown"
            className="font-body text-[11px] font-semibold text-[#000066] underline"
          >
            Identify Board →
          </Link>
          <Link
            href="/admin/evidence-workbench?tab=publish#ew-ship-last-mile"
            className="font-body text-[11px] font-semibold text-[#000066] underline"
          >
            Publish / Ship last mile →
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.hint}
            onClick={() => setStage(s.id)}
            className={`rounded border px-2 py-1 font-body text-[10px] font-bold uppercase tracking-wide ${
              stage === s.id
                ? "border-[#000066] bg-[#000066] text-white"
                : "border-[#000066]/20 bg-white text-[#000066]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="font-body text-xs font-semibold text-[#000066]">
          Calendar row
          <select
            value={rowId}
            onChange={(e) => {
              setRowId(e.target.value);
              setStage("pick");
            }}
            className="mt-1 block min-w-[16rem] rounded border-2 border-[#000066]/20 bg-white px-2 py-1.5 font-body text-sm"
          >
            {!calendarRows.length ? <option value="">No rows</option> : null}
            {calendarRows.map((r) => (
              <option key={r.id} value={r.id}>
                {r.date} · {r.status} · {r.summary.slice(0, 48)}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 font-body text-xs text-[#12124a]">
          <input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} />
          Use AI / vision
        </label>
        <label className="inline-flex items-center gap-2 font-body text-xs text-[#12124a]">
          <input
            type="checkbox"
            checked={consentConfirmed}
            onChange={(e) => setConsentConfirmed(e.target.checked)}
          />
          Consent confirmed for holds
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || !rowId}
          onClick={proposeOnly}
          className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-xs font-bold text-[#000066] disabled:opacity-50"
        >
          Propose pack
        </button>
        <button
          type="button"
          disabled={pending || !rowId}
          onClick={proposeReel}
          className="rounded-md border-2 border-[#ca913d] bg-white px-3 py-2 font-body text-xs font-bold text-[#12124a] disabled:opacity-50"
        >
          Propose event reel
        </button>
        <button
          type="button"
          disabled={pending || !reel?.id}
          onClick={confirmRenderReel}
          className="rounded-md border-2 border-[#ca913d] bg-[#000066] px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          Confirm render reel
          {reel?.stills.length ? ` (${reel.stills.length})` : ""}
        </button>
        <button
          type="button"
          disabled={pending || !rowId}
          onClick={runFullLoop}
          className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-xs font-bold text-[#000066] disabled:opacity-50"
        >
          Pack + turbo
        </button>
        <button
          type="button"
          disabled={pending || !pack}
          onClick={visionIdentify}
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2 font-body text-xs font-semibold text-[#000066] disabled:opacity-50"
        >
          Vision Identify (clamp)
        </button>
        <button
          type="button"
          disabled={pending || !pack}
          onClick={applySaveAllKnown}
          className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-xs font-bold text-[#000066] disabled:opacity-50"
        >
          Apply+Save known counties
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={tonightApprove}
          className="rounded-md bg-[#000066] px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          Confirm Approve ({needsApprovalIds.length})
        </button>
        <Link
          href="/admin/evidence-workbench?tab=publish#ew-ship-last-mile"
          className="rounded-md border-2 border-[#ca913d] bg-white px-3 py-2 font-body text-xs font-bold text-[#12124a]"
        >
          Finish on Publish desk →
        </Link>
      </div>

      {approveDone ? (
        <div className="rounded border-2 border-[#000066]/20 bg-white p-3 font-body text-xs">
          <p className="font-heading text-xs font-bold text-[#000066]">
            Approve complete — Ship last mile is on Publish
          </p>
          <p className="mt-1 text-[#364272]">
            Surfaces + overlays → campaign-shipped → graduation → commit live only on the Publish
            desk (one Ship home).
          </p>
          <Link
            href="/admin/evidence-workbench?tab=publish#ew-ship-last-mile"
            className="mt-2 inline-flex rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
          >
            Open Publish / Ship last mile →
          </Link>
        </div>
      ) : null}

      {message ? <p className="font-body text-xs text-[#364272]">{message}</p> : null}

      {pack ? (
        <div className="rounded border border-[#000066]/15 bg-white p-3 font-body text-xs">
          <p className="font-heading text-xs font-bold text-[#000066]">
            Pack · {pack.date} · {pack.matchQuality} · {pack.photos.length} photos ·{" "}
            {pack.speeches.length} speeches
          </p>
          {pack.warnings.length ? (
            <ul className="mt-1 list-disc pl-4 text-[#364272]">
              {pack.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {showSaveDesk ? (
        <div className="rounded border-2 border-[#000066]/20 bg-white p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-heading text-xs font-bold uppercase text-[#000066]">
              Inline Apply / Save — Prefer Unknown
            </p>
            <p className="font-body text-[10px] text-[#364272]">
              Identify never Approves. Leave county Unknown until you are sure.
            </p>
          </div>
          <div className="mt-2 max-h-80 space-y-2 overflow-auto">
            {pack?.photos.map((photo) => {
              const proposal = proposalsById[photo.id];
              const edit = edits[photo.id] ?? emptyEdit(photo, proposal);
              const proposedCounty = proposal?.identify?.county ?? "—";
              return (
                <div
                  key={photo.id}
                  className="rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2 font-body text-[11px]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[10px] font-bold text-[#000066]">{photo.id}</p>
                      <p className="text-[#364272]">
                        Pack {photo.county}/{photo.city} · score {photo.score}
                        {proposal
                          ? ` · turbo ${proposal.status} · propose ${proposedCounty} (${proposal.identify?.confidence ?? "—"})`
                          : " · no turbo proposal yet"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={pending || !proposal || proposal.status === "dismissed"}
                        onClick={() => applyIdentifyRow(photo.id)}
                        className="rounded border border-[#000066] bg-white px-2 py-1 text-[10px] font-bold text-[#000066] disabled:opacity-50"
                      >
                        Apply identify
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => saveRow(photo.id)}
                        className="rounded border border-[#ca913d] bg-[#000066] px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50"
                      >
                        Save
                      </button>
                      {edit.applied ? (
                        <span className="rounded bg-white px-1.5 py-1 text-[10px] text-[#364272]">applied</span>
                      ) : null}
                      {edit.saved ? (
                        <span className="rounded bg-white px-1.5 py-1 text-[10px] text-[#364272]">saved</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 grid gap-1 sm:grid-cols-3 lg:grid-cols-6">
                    {(
                      [
                        ["county", "County"],
                        ["city", "City"],
                        ["venue", "Venue"],
                        ["eventDate", "Event date"],
                        ["eventName", "Event"],
                        ["photographer", "Photographer"],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="block text-[10px] font-semibold text-[#000066]">
                        {label}
                        <input
                          className="mt-0.5 w-full rounded border border-[#8eb6dc]/50 bg-white px-1.5 py-1 font-body text-[11px]"
                          value={edit[key]}
                          onChange={(e) => updateEdit(photo.id, { [key]: e.target.value })}
                        />
                      </label>
                    ))}
                  </div>
                  <label className="mt-1 block text-[10px] font-semibold text-[#000066]">
                    What this proves
                    <input
                      className="mt-0.5 w-full rounded border border-[#8eb6dc]/50 bg-white px-1.5 py-1 font-body text-[11px]"
                      value={edit.whatThisProves}
                      onChange={(e) => updateEdit(photo.id, { whatThisProves: e.target.value })}
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {reel ? (
        <div className="rounded border border-[#ca913d]/40 bg-white p-3 font-body text-xs">
          <p className="font-heading text-xs font-bold text-[#000066]">
            Event reel · {reel.status} · {reel.stills.length} stills · {reel.exportAspects.join(" + ")}
          </p>
          <p className="mt-1 font-mono text-[10px] text-[#364272]">{reel.id}</p>
          {reel.assemblies?.length ? (
            <ul className="mt-2 font-mono text-[10px] text-[#364272]">
              {reel.assemblies.map((a) => (
                <li key={a.id}>
                  {a.aspect} · {a.publicSrc}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
