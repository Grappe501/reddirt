"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  buildEvidenceShipReportAction,
  proposeEventNightPackAction,
  proposeEventReelAction,
  renderEventReelAction,
  runEventNightLoopAction,
  runTonightPublishRitualAction,
  runVisionIdentifyBatchAction,
  shipPromotedDerivativesAction,
} from "@/app/admin/evidence-workbench-actions";
import type { EventNightPack } from "@/lib/campaign-media/evidence-event-night-pack";
import type { EventReelProject } from "@/lib/campaign-media/event-reel-types";
import type { EvidenceShipReport } from "@/lib/campaign-media/evidence-ship-report";

type CalRow = { id: string; date: string; summary: string; status: string };

type Props = {
  calendarRows: CalRow[];
  initialNeedsApprovalIds?: string[];
};

/**
 * Tonight ritual: calendar → vision/turbo identify → confirm Approve → ship binaries → commit template.
 * Never silent Approve. Prefer Unknown.
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
  const [useAi, setUseAi] = useState(true);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [pack, setPack] = useState<EventNightPack | null>(null);
  const [reel, setReel] = useState<EventReelProject | null>(null);
  const [ship, setShip] = useState<EvidenceShipReport | null>(null);
  const [needsApprovalIds, setNeedsApprovalIds] = useState(initialNeedsApprovalIds);
  const [commitTemplate, setCommitTemplate] = useState("");
  const [promotedNeeding, setPromotedNeeding] = useState(0);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  function proposeOnly() {
    if (!rowId) {
      setMessage("Pick a calendar row first.");
      return;
    }
    start(async () => {
      const res = await proposeEventNightPackAction(rowId);
      setMessage(res.message);
      if (res.pack) setPack(res.pack);
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
      setMessage(
        [res.message, ...(res.warnings ?? [])].filter(Boolean).join(" · "),
      );
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
      if (res.pack) setPack(res.pack);
      if (res.ship) {
        setShip(res.ship);
        setCommitTemplate(res.ship.commitMessageTemplate);
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
    });
  }

  function tonightApproveAndShip() {
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
        setShip(res.ritual.ship);
        setNeedsApprovalIds(res.ritual.needsApprovalIds);
        setCommitTemplate(res.ritual.commitMessageTemplate);
        setPromotedNeeding(res.ritual.promotedNeedingShip.length);
      }
    });
  }

  function shipBinaries() {
    if (
      !window.confirm(
        "Copy promoted gitignored derivatives into public/media/campaign-shipped/ and rewrite overlays? Then commit those files to deploy.",
      )
    ) {
      return;
    }
    start(async () => {
      const res = await shipPromotedDerivativesAction({ confirmShip: true, limit: 40 });
      setMessage(res.message);
      const shipRes = await buildEvidenceShipReportAction({
        persist: true,
        includeDerivativeScan: true,
      });
      if (shipRes.report) {
        setShip(shipRes.report);
        setCommitTemplate(shipRes.report.commitMessageTemplate);
        setPromotedNeeding(shipRes.report.totals.promotedOverrideGitignored);
      }
    });
  }

  function refreshShip() {
    start(async () => {
      const shipRes = await buildEvidenceShipReportAction({
        persist: true,
        includeDerivativeScan: true,
      });
      setMessage(shipRes.message);
      if (shipRes.report) {
        setShip(shipRes.report);
        setCommitTemplate(shipRes.report.commitMessageTemplate);
        setPromotedNeeding(shipRes.report.totals.promotedOverrideGitignored);
      }
    });
  }

  function copyCommit() {
    const text = commitTemplate || ship?.commitMessageTemplate || "";
    if (!text) {
      setMessage("No commit template yet — refresh ship.");
      return;
    }
    start(async () => {
      try {
        await navigator.clipboard.writeText(text);
        setMessage("Copied ship commit template.");
      } catch {
        setMessage("Clipboard blocked — select the template manually.");
      }
    });
  }

  return (
    <div className="mb-6 space-y-3 rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-4 text-[#12124a]">
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#000066]">
        Tonight ritual
      </p>
      <p className="font-body text-xs text-[#364272]">
        Calendar → Vision Identify proposals → Apply/Save on Photos → Confirm Approve → Ship
        binaries → commit. Prefer Unknown. Never silent Approve.
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <label className="font-body text-xs font-semibold text-[#000066]">
          Calendar row
          <select
            value={rowId}
            onChange={(e) => setRowId(e.target.value)}
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
          1 · Propose pack
        </button>
        <button
          type="button"
          disabled={pending || !rowId}
          onClick={proposeReel}
          className="rounded-md border-2 border-[#ca913d] bg-white px-3 py-2 font-body text-xs font-bold text-[#12124a] disabled:opacity-50"
        >
          1b · Propose event reel
        </button>
        <button
          type="button"
          disabled={pending || !reel?.id}
          onClick={confirmRenderReel}
          className="rounded-md border-2 border-[#ca913d] bg-[#000066] px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          1c · Confirm render reel
          {reel?.stills.length ? ` (${reel.stills.length})` : ""}
        </button>
        <button
          type="button"
          disabled={pending || !rowId}
          onClick={runFullLoop}
          className="rounded-md border-2 border-[#000066] bg-white px-3 py-2 font-body text-xs font-bold text-[#000066] disabled:opacity-50"
        >
          2 · Pack + turbo
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={visionIdentify}
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2 font-body text-xs font-semibold text-[#000066] disabled:opacity-50"
        >
          2b · Vision Identify (clamp)
        </button>
        <Link
          href="/admin/evidence-workbench?tab=photos&filter=draft"
          className="rounded-md border-2 border-[#ca913d] bg-white px-3 py-2 font-body text-xs font-bold text-[#12124a]"
        >
          3 · Apply / Save on Photos
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={tonightApproveAndShip}
          className="rounded-md bg-[#000066] px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          4 · Confirm Approve ({needsApprovalIds.length})
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={shipBinaries}
          className="rounded-md border-2 border-[#ca913d] bg-[#000066] px-3 py-2 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          5 · Ship promoted binaries
          {promotedNeeding ? ` (${promotedNeeding})` : ""}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={refreshShip}
          className="rounded-md border-2 border-[#8eb6dc] bg-[#f4f7fc] px-3 py-2 font-body text-xs font-semibold disabled:opacity-50"
        >
          Refresh ship
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={copyCommit}
          className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-2 font-body text-xs font-semibold disabled:opacity-50"
        >
          Copy commit template
        </button>
      </div>

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

      {reel ? (
        <div className="rounded border border-[#ca913d]/40 bg-white p-3 font-body text-xs">
          <p className="font-heading text-xs font-bold text-[#000066]">
            Event reel · {reel.status} · {reel.stills.length} stills · {reel.exportAspects.join(" + ")}
          </p>
          <p className="mt-1 font-mono text-[10px] text-[#364272]">{reel.id}</p>
          <ul className="mt-1 max-h-28 list-disc overflow-auto pl-4 text-[#364272]">
            {reel.stills.map((s) => (
              <li key={s.photoId}>
                {s.photoId} · {s.county}
                {s.city && s.city !== "Unknown" ? ` · ${s.city}` : ""} · {s.durationSec}s
              </li>
            ))}
          </ul>
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

      {ship ? (
        <div className="rounded border border-[#000066]/15 bg-white p-3 font-body text-xs">
          <p className="font-heading text-xs font-bold text-[#000066]">
            Ship · overlays dirty {ship.totals.overlayJsonDirty} · photo binaries dirty{" "}
            {ship.totals.photoBinaryDirty} · promoted missing {ship.totals.promotedOverrideMissing}{" "}
            · gitignored overrides {ship.totals.promotedOverrideGitignored} · ready=
            {String(ship.checklistReady)}
          </p>
          <ul className="mt-1 list-disc pl-4 text-[#364272]">
            {ship.nextActions.slice(0, 5).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          {ship.dirtyPaths.length ? (
            <ul className="mt-2 max-h-28 overflow-auto font-mono text-[10px] text-[#364272]">
              {ship.dirtyPaths.slice(0, 20).map((d) => (
                <li key={d.path}>
                  {d.status} · {d.kind} · {d.path}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {commitTemplate ? (
        <div className="rounded border border-[#000066]/15 bg-white p-3">
          <p className="font-heading text-xs font-bold uppercase text-[#000066]">
            Commit message template
          </p>
          <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2 font-mono text-[10px]">
            {commitTemplate}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
