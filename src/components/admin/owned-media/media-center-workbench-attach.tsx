"use client";

import { useState, useTransition } from "react";
import { SocialContentMediaRefPurpose } from "@prisma/client";
import { attachOwnedMediaToSocialAction } from "@/app/admin/media-library-actions";
import { socialEnumLabel } from "@/lib/social/enum-labels";

const PURPOSES: { purpose: SocialContentMediaRefPurpose; label: string; hint: string }[] = [
  { purpose: SocialContentMediaRefPurpose.SOCIAL_PLAN, label: "Plan", hint: "SOCIAL_PLAN" },
  { purpose: SocialContentMediaRefPurpose.VIDEO_REPURPOSE, label: "Repurpose", hint: "VIDEO_REPURPOSE" },
  { purpose: SocialContentMediaRefPurpose.VISUAL, label: "Visual", hint: "VISUAL" },
];

type Col = { id: string; name: string };

type Props = {
  ownedMediaId: string;
  /** Pre-approved: attach works without extra confirm. */
  approvedForSocial: boolean;
  collections: Col[];
};

/**
 * Server actions keep `SocialContentMediaRef` as the only join; this panel only calls `attachOwnedMediaToSocialAction`.
 * PLATFORM_VARIANT: pick variant in Social Workbench (needs id per variant) — see TODO below.
 */
export function MediaCenterWorkbenchAttach({ ownedMediaId, approvedForSocial, collections }: Props) {
  const [workId, setWorkId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmUnapproved, setConfirmUnapproved] = useState(false);
  const [pend, start] = useTransition();

  function run(purpose: SocialContentMediaRefPurpose) {
    const id = workId.trim();
    if (!id) {
      setMsg("Enter a Social work item id (from the workbench or URL).");
      return;
    }
    setMsg(null);
    start(async () => {
      const r = await attachOwnedMediaToSocialAction(id, ownedMediaId, purpose, {
        confirmUnapproved: approvedForSocial ? undefined : confirmUnapproved,
      });
      if (r.ok) {
        setMsg("Attached. Refresh the workbench to see the ref.");
      } else if (r.error === "UNAPPROVED_NEEDS_CONFIRM") {
        setMsg("Not approved for social — check “confirm” or toggle approval in triage first.");
      } else {
        setMsg(r.error);
      }
    });
  }

  return (
    <div className="mt-3 space-y-2 border-t border-kelly-text/10 pt-3">
      <h4 className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Social workbench</h4>
      <p className="text-[10px] text-kelly-text/55">Paste a work item id, then pick a ref purpose. Same spine as <code className="rounded bg-kelly-text/5 px-0.5">SocialContentMediaRef</code>.</p>
      <label className="block font-body text-[10px] text-kelly-text/70">
        SocialContentItem id
        <input
          value={workId}
          onChange={(e) => setWorkId(e.target.value)}
          className="mt-0.5 w-full rounded border border-kelly-text/15 bg-white px-1.5 py-1 font-mono text-[10px]"
          placeholder="cuid from admin URL or list"
          autoComplete="off"
        />
      </label>
      {!approvedForSocial ? (
        <label className="flex items-center gap-1.5 font-body text-[10px] text-kelly-text/80">
          <input type="checkbox" checked={confirmUnapproved} onChange={(e) => setConfirmUnapproved(e.target.checked)} />
          Confirm attach while not “approved for social”
        </label>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {PURPOSES.map((p) => (
          <button
            key={p.purpose}
            type="button"
            disabled={pend}
            onClick={() => run(p.purpose)}
            className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 text-[10px] font-semibold text-kelly-text hover:bg-kelly-text/5"
            title={p.hint}
          >
            {p.label} · {socialEnumLabel(p.purpose)}
          </button>
        ))}
      </div>
      <p className="text-[9px] text-amber-800/90">
        TODO: pin to a <strong>platform variant</strong> in the workbench (PLATFORM_VARIANT) — needs variant id.
      </p>
      {msg ? <p className="text-[10px] text-kelly-slate">{msg}</p> : null}
      {collections.length > 0 ? (
        <p className="text-[9px] text-kelly-text/50">
          Collections: use the sidebar or the collection picker in triage. Smart rule evaluation: TODO.
        </p>
      ) : null}
    </div>
  );
}
