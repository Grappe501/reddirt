"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  applySpeechPlacementAction,
  batchPublishSpeechesAction,
  batchSaveSpeechEvidenceAction,
  getSpeechConfirmQueueAction,
  getSpeechReadinessMatrixAction,
  listSpeechPlacementProposalsAction,
  proposeSpeechPlacementAction,
  undoBatchSpeechPublishAction,
  undoSpeechPlacementAction,
  writeSpeechPlacementStubAction,
} from "@/app/admin/evidence-workbench-actions";
import type { SpeechConfirmQueue } from "@/lib/campaign-media/speech-confirm-queue";
import type { SpeechPlacementProposal } from "@/lib/campaign-media/speech-placement";
import type { SpeechReadinessRow } from "@/lib/campaign-media/speech-readiness";
import { EVIDENCE_FIELD_CLASS } from "@/components/admin/evidence-workbench/field-styles";

type SpeechLite = {
  id: string;
  title: string;
};

type Props = {
  speeches: SpeechLite[];
  initialQueue: SpeechConfirmQueue;
  initialRows: SpeechReadinessRow[];
  initialPlacement: SpeechPlacementProposal | null;
  placementCurrent: { primaryId: string; acrossId: string };
};

export function EvidenceSpeechConfirmPanel({
  speeches,
  initialQueue,
  initialRows,
  initialPlacement,
  placementCurrent,
}: Props) {
  const [queue, setQueue] = useState(initialQueue);
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [batchCounties, setBatchCounties] = useState("");
  const [batchProof, setBatchProof] = useState("");
  const [batchDoNotClaim, setBatchDoNotClaim] = useState("");
  const [proposal, setProposal] = useState<SpeechPlacementProposal | null>(initialPlacement);

  useEffect(() => {
    setQueue(initialQueue);
    setRows(initialRows);
    setProposal(initialPlacement);
  }, [initialQueue, initialRows, initialPlacement]);

  const selectedIds = useMemo(() => [...selected], [selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectBucket(ids: string[]) {
    setSelected(new Set(ids));
  }

  function refresh() {
    start(async () => {
      const [q, m, p] = await Promise.all([
        getSpeechConfirmQueueAction(),
        getSpeechReadinessMatrixAction(),
        listSpeechPlacementProposalsAction(),
      ]);
      if (q.queue) setQueue(q.queue);
      if (m.rows) setRows(m.rows);
      setProposal(p.proposals?.find((x) => x.status === "pending") ?? p.proposals?.[0] ?? null);
      setMessage([q.message, m.message, p.message].filter(Boolean).join(" · "));
    });
  }

  function batchFields() {
    if (!selectedIds.length) {
      setMessage("Select speeches first.");
      return;
    }
    const applyFields: string[] = [];
    const patch: Record<string, unknown> = {};
    if (batchCounties.trim()) {
      applyFields.push("counties");
      patch.counties = batchCounties;
    }
    if (batchProof.trim()) {
      applyFields.push("whatThisProves");
      patch.whatThisProves = batchProof;
    }
    if (batchDoNotClaim.trim()) {
      applyFields.push("doNotClaim");
      patch.doNotClaim = batchDoNotClaim;
    }
    if (!applyFields.length) {
      setMessage("Enter counties, proof, and/or do-not-claim for batch Save.");
      return;
    }
    start(async () => {
      const res = await batchSaveSpeechEvidenceAction({
        speechIds: selectedIds,
        applyFields,
        patch,
      });
      setMessage(res.message);
      refresh();
    });
  }

  function batchPublish(action: string) {
    if (!selectedIds.length) {
      setMessage("Select speeches first.");
      return;
    }
    if (
      !window.confirm(
        `Speech batch ${action} on ${selectedIds.length} video(s)? Empty-county skipped on public-raising actions.`,
      )
    ) {
      return;
    }
    start(async () => {
      const res = await batchPublishSpeechesAction({ speechIds: selectedIds, action });
      setMessage(res.message);
      refresh();
    });
  }

  function undoPublish() {
    start(async () => {
      const res = await undoBatchSpeechPublishAction({});
      setMessage(res.message);
      refresh();
    });
  }

  function proposePlacement() {
    start(async () => {
      const res = await proposeSpeechPlacementAction({ persist: true });
      setMessage(res.message);
      if (res.proposal) setProposal(res.proposal);
    });
  }

  function applyPlacement() {
    if (!proposal) {
      setMessage("Propose placement first.");
      return;
    }
    if (
      !window.confirm(
        `Apply speech placement ${proposal.id} to homepage-campaign-videos.ts?\nUndo snapshot will be saved.`,
      )
    ) {
      return;
    }
    const proposalId = proposal.id;
    start(async () => {
      const res = await applySpeechPlacementAction({ proposalId, confirmCurate: true });
      setMessage(res.message);
      refresh();
    });
  }

  function undoPlacement() {
    if (!proposal?.undoSnapshotId) {
      setMessage("No placement undo on this proposal.");
      return;
    }
    if (!window.confirm(`Undo speech placement snapshot ${proposal.undoSnapshotId}?`)) return;
    const undoSnapshotId = proposal.undoSnapshotId;
    start(async () => {
      const res = await undoSpeechPlacementAction({ undoSnapshotId, confirmCurate: true });
      setMessage(res.message);
      refresh();
    });
  }

  return (
    <div className="mb-6 space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold text-[#000066]">
          Speech confirm / publish parity
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Batch county / status / do-not-claim · readiness matrix · homepage video placement propose.
          Approve/Publish never silent; empty-county skipped on public-raising actions.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="No county" value={queue.totals.noCounty} />
          <Stat label="Needs publish" value={queue.totals.needsPublish} />
          <Stat label="Published" value={queue.totals.published} />
          <Stat label="Overlays" value={queue.totals.overlaysSaved} />
          <Stat label="Prep ready" value={queue.totals.prepReady} />
          <Stat label="Selected" value={selectedIds.length} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={refresh}
            className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => selectBucket(queue.buckets.noCounty.map((i) => i.id))}
            className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Select no-county
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => selectBucket(queue.buckets.needsPublish.map((i) => i.id))}
            className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Select needs-publish
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setSelected(new Set())}
            className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Clear selection
          </button>
          <Link
            href="/admin/evidence-workbench?tab=queue"
            className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold"
          >
            Publish Queue
          </Link>
        </div>
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase text-[#000066]">Batch confirm fields</p>
        <div className="mt-2 grid gap-2 lg:grid-cols-3">
          <label className="font-body text-[11px]">
            Counties (comma-separated)
            <input
              className={`mt-1 w-full ${EVIDENCE_FIELD_CLASS}`}
              value={batchCounties}
              onChange={(e) => setBatchCounties(e.target.value)}
              placeholder="Pulaski, Benton"
            />
          </label>
          <label className="font-body text-[11px]">
            What this proves
            <input
              className={`mt-1 w-full ${EVIDENCE_FIELD_CLASS}`}
              value={batchProof}
              onChange={(e) => setBatchProof(e.target.value)}
              placeholder="Spoke with clerks about…"
            />
          </label>
          <label className="font-body text-[11px]">
            Do-not-claim (one per line)
            <textarea
              className={`mt-1 w-full ${EVIDENCE_FIELD_CLASS}`}
              rows={2}
              value={batchDoNotClaim}
              onChange={(e) => setBatchDoNotClaim(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || !selectedIds.length}
            onClick={batchFields}
            className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
          >
            Batch Save fields
          </button>
          <button
            type="button"
            disabled={pending || !selectedIds.length}
            onClick={() => batchPublish("approve")}
            className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Batch Approve
          </button>
          <button
            type="button"
            disabled={pending || !selectedIds.length}
            onClick={() => batchPublish("publish")}
            className="rounded border-2 border-[#000066] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Batch Publish
          </button>
          <button
            type="button"
            disabled={pending || !selectedIds.length}
            onClick={() => batchPublish("hold")}
            className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Batch Hold
          </button>
          <button
            type="button"
            disabled={pending || !selectedIds.length}
            onClick={() => batchPublish("homepage_on")}
            className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Homepage on
          </button>
          <button
            type="button"
            disabled={pending || !selectedIds.length}
            onClick={() => batchPublish("homepage_off")}
            className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Homepage off
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={undoPublish}
            className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Undo last publish batch
          </button>
        </div>
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase text-[#000066]">Readiness matrix</p>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full border-collapse font-body text-[11px]">
            <thead>
              <tr className="border-b border-[#8eb6dc]/40 text-left text-[#000066]">
                <th className="py-1 pr-2">Sel</th>
                <th className="py-1 pr-2">Id</th>
                <th className="py-1 pr-2">County</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2">Score</th>
                <th className="py-1 pr-2">Master</th>
                <th className="py-1 pr-2">Clips</th>
                <th className="py-1">Next</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 40).map((r) => (
                <tr key={r.id} className="border-b border-[#8eb6dc]/20 align-top">
                  <td className="py-1 pr-2">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                      aria-label={`Select ${r.id}`}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Link
                      href={`/admin/evidence-workbench?tab=speeches&id=${encodeURIComponent(r.id)}`}
                      className="font-mono text-[#000066] underline"
                    >
                      {r.id}
                    </Link>
                  </td>
                  <td className="py-1 pr-2">{r.hasConfirmedCounty ? r.counties.join(", ") : "—"}</td>
                  <td className="py-1 pr-2">
                    {r.publicationStatus}
                    {r.approvedForPublic ? " · approved" : ""}
                    {r.kellySpeaksEligible ? " · live" : ""}
                  </td>
                  <td className="py-1 pr-2">{r.readinessScore}</td>
                  <td className="py-1 pr-2">{r.hasMaster ? "yes" : "—"}</td>
                  <td className="py-1 pr-2">{r.clipCount}</td>
                  <td className="py-1 text-[#364272]">{r.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length ? (
          <p className="mt-2 font-body text-xs text-[#364272]">No speeches in registry.</p>
        ) : null}
        <p className="mt-2 font-body text-[10px] text-[#364272]">
          Showing {Math.min(rows.length, 40)} of {speeches.length} · path: {queue.pathSteps.join(" → ")}
        </p>
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase text-[#000066]">
          Homepage video placement propose
        </p>
        <p className="mt-1 font-body text-[11px] text-[#364272]">
          Current · primary <span className="font-mono">{placementCurrent.primaryId}</span> · across{" "}
          <span className="font-mono">{placementCurrent.acrossId}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={proposePlacement}
            className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
          >
            Propose placement
          </button>
          <button
            type="button"
            disabled={pending || !proposal}
            onClick={() => {
              if (!proposal) return;
              const proposalId = proposal.id;
              start(async () => {
                const res = await writeSpeechPlacementStubAction({ proposalId });
                setMessage(res.message);
              });
            }}
            className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Write stub
          </button>
          <button
            type="button"
            disabled={pending || !proposal || proposal.status === "applied"}
            onClick={applyPlacement}
            className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Apply (confirmCurate)
          </button>
          <button
            type="button"
            disabled={pending || !proposal?.undoSnapshotId}
            onClick={undoPlacement}
            className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
          >
            Undo apply
          </button>
        </div>
        {proposal ? (
          <div className="mt-2 space-y-1 font-body text-[11px]">
            <p>
              Proposal {proposal.id} · {proposal.status}
            </p>
            {proposal.diffs.map((d) => (
              <p key={d.slot} className="font-mono text-[10px] text-[#364272]">
                {d.slot}: {d.currentId} → {d.proposedId}
                {d.changed ? " *" : ""}
              </p>
            ))}
            {proposal.warnings.map((w) => (
              <p key={w} className="text-[#ca913d]">
                {w}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-2 font-body text-xs text-[#364272]">No placement proposal yet.</p>
        )}
      </div>

      {message ? (
        <p className="whitespace-pre-wrap rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] px-3 py-2 font-body text-xs">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] px-2 py-1.5">
      <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">{label}</p>
      <p className="font-body text-lg font-semibold text-[#12124a]">{value}</p>
    </div>
  );
}
