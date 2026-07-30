"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  applyCuratedPlacementAction,
  listCuratedPlacementProposalsAction,
  proposeCuratedPlacementAction,
  undoCuratedPlacementAction,
  writeCuratedPlacementStubAction,
} from "@/app/admin/evidence-workbench-actions";
import type { CuratedPlacementProposal } from "@/lib/campaign-media/curated-placement-types";

type CurrentSnap = {
  homepageIds: string[];
  acrossIds: string[];
  meetKellyId: string | null;
  heroId: string | null;
};

type Props = {
  initialProposal: CuratedPlacementProposal | null;
  current: CurrentSnap;
};

export function EvidencePlacementPanel({ initialProposal, current }: Props) {
  const [proposal, setProposal] = useState<CuratedPlacementProposal | null>(initialProposal);
  const [allowHero, setAllowHero] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    setProposal(initialProposal);
  }, [initialProposal]);

  function refreshList() {
    start(async () => {
      const res = await listCuratedPlacementProposalsAction();
      setProposal(res.proposals?.[0] ?? null);
      setMessage(res.message);
    });
  }

  function propose() {
    start(async () => {
      const res = await proposeCuratedPlacementAction({ allowHero, persist: true });
      setMessage(res.message);
      if (res.proposal) setProposal(res.proposal);
    });
  }

  function writeStub() {
    if (!proposal) {
      setMessage("Propose first.");
      return;
    }
    const proposalId = proposal.id;
    start(async () => {
      const res = await writeCuratedPlacementStubAction({ proposalId });
      setMessage(res.message);
    });
  }

  function apply() {
    if (!proposal) {
      setMessage("Propose first.");
      return;
    }
    if (
      !window.confirm(
        `Apply curated placement ${proposal.id} to homepage-campaign-photos.ts?\n\nThis rewrites HOMEPAGE_* constants. An undo snapshot will be saved.`,
      )
    ) {
      return;
    }
    const proposalId = proposal.id;
    start(async () => {
      const res = await applyCuratedPlacementAction({ proposalId, confirmCurate: true });
      setMessage(res.message);
      refreshList();
    });
  }

  function undo() {
    if (!proposal?.undoSnapshotId) {
      setMessage("No undo snapshot on this proposal.");
      return;
    }
    if (!window.confirm(`Undo curation using snapshot ${proposal.undoSnapshotId}?`)) return;
    const undoSnapshotId = proposal.undoSnapshotId;
    start(async () => {
      const res = await undoCuratedPlacementAction({ undoSnapshotId, confirmCurate: true });
      setMessage(res.message);
    });
  }

  return (
    <div className="space-y-4 text-[#12124a]">
      <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold text-[#000066]">
          Placement — curated HOMEPAGE_* propose
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Fit flags alone do not reorder the homepage. This proposes ordered ID diffs for gallery /
          Across Arkansas / Meet Kelly / hero. Apply only with explicit confirm — never silent.
        </p>
      </div>

      <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
          Current curated (live TS)
        </p>
        <div className="mt-2 grid gap-2 lg:grid-cols-2">
          <div>
            <p className="font-body text-[11px] font-semibold">Homepage gallery</p>
            <ul className="mt-1 max-h-36 overflow-y-auto font-mono text-[10px] text-[#364272]">
              {current.homepageIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-body text-[11px] font-semibold">Across Arkansas</p>
            <ul className="mt-1 max-h-36 overflow-y-auto font-mono text-[10px] text-[#364272]">
              {current.acrossIds.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
            <p className="mt-2 font-body text-[11px]">
              Meet Kelly: <span className="font-mono">{current.meetKellyId ?? "—"}</span>
            </p>
            <p className="font-body text-[11px]">
              Hero: <span className="font-mono">{current.heroId ?? "null"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-1.5 font-body text-[11px]">
          <input type="checkbox" checked={allowHero} onChange={(e) => setAllowHero(e.target.checked)} />
          Allow hero propose (Gold / HERO + known county only)
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={propose}
          className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
        >
          Propose placement
        </button>
        <button
          type="button"
          disabled={pending || !proposal}
          onClick={writeStub}
          className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
        >
          Write stub
        </button>
        <button
          type="button"
          disabled={pending || !proposal || proposal.status === "applied"}
          onClick={apply}
          className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
        >
          Apply (confirmCurate)
        </button>
        <button
          type="button"
          disabled={pending || !proposal?.undoSnapshotId}
          onClick={undo}
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold disabled:opacity-50"
        >
          Undo apply
        </button>
        <Link
          href="/admin/evidence-workbench?tab=ship"
          className="rounded border-2 border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold"
        >
          Ship
        </Link>
      </div>

      {message ? (
        <p className="rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] px-3 py-2 font-body text-xs">
          {message}
        </p>
      ) : null}

      {proposal ? (
        <div className="space-y-3">
          <div className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
            <p className="font-heading text-xs font-bold uppercase text-[#000066]">
              Proposal · {proposal.status} · {proposal.id}
            </p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">
              Meet Kelly → {proposal.meetKellyId ?? "—"} · Hero → {proposal.heroId ?? "null"} · allowHero=
              {String(proposal.allowHero)}
            </p>
            {proposal.warnings.length ? (
              <ul className="mt-2 list-disc pl-4 font-body text-[11px] text-[#ca913d]">
                {proposal.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {proposal.diffs.map((d) => (
            <div key={d.surface} className="rounded-lg border-2 border-[#000066]/15 bg-white p-3">
              <p className="font-heading text-xs font-bold uppercase text-[#000066]">{d.surface}</p>
              <p className="mt-1 font-body text-[11px] text-[#364272]">{d.rationale}</p>
              <p className="mt-1 font-body text-[10px] text-[#364272]">
                +{d.added.length} / −{d.removed.length}
                {d.reordered ? " · reordered" : ""}
              </p>
              <div className="mt-2 grid gap-2 lg:grid-cols-2">
                <div>
                  <p className="font-body text-[10px] font-semibold">Current</p>
                  <ul className="mt-1 max-h-40 overflow-y-auto rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] p-2 font-mono text-[10px]">
                    {d.current.length ? d.current.map((id) => <li key={`c-${id}`}>{id}</li>) : <li>—</li>}
                  </ul>
                </div>
                <div>
                  <p className="font-body text-[10px] font-semibold">Proposed</p>
                  <ul className="mt-1 max-h-40 overflow-y-auto rounded border border-[#8eb6dc]/30 bg-[#f4f7fc] p-2 font-mono text-[10px]">
                    {d.proposed.length ? (
                      d.proposed.map((id) => <li key={`p-${id}`}>{id}</li>)
                    ) : (
                      <li>—</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-xs text-[#364272]">No proposal yet — click Propose placement.</p>
      )}
    </div>
  );
}
