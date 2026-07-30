"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  applySpeechPlacementAction,
  listSpeechPlacementProposalsAction,
  proposeSpeechPlacementAction,
  undoSpeechPlacementAction,
  writeSpeechPlacementStubAction,
} from "@/app/admin/evidence-workbench-actions";
import type { SpeechPlacementProposal } from "@/lib/campaign-media/speech-placement";

type Props = {
  initialPlacement: SpeechPlacementProposal | null;
  placementCurrent: { primaryId: string; acrossId: string };
};

/** Speech homepage placement — used on Public Surface Desk + Videos Place stage. */
export function EvidenceSpeechPlacementStrip({ initialPlacement, placementCurrent }: Props) {
  const [proposal, setProposal] = useState<SpeechPlacementProposal | null>(initialPlacement);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    setProposal(initialPlacement);
  }, [initialPlacement]);

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
      const list = await listSpeechPlacementProposalsAction();
      setProposal(list.proposals?.[0] ?? null);
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
    });
  }

  return (
    <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3 text-[#12124a]">
      <p className="font-heading text-xs font-bold uppercase text-[#000066]">
        Homepage video placement (Kelly Speaks / primary / Across AR)
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
        <Link
          href="/admin/evidence-workbench?tab=speeches"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold"
        >
          Videos desk
        </Link>
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
      {message ? <p className="mt-2 font-body text-xs text-[#364272]">{message}</p> : null}
    </div>
  );
}
