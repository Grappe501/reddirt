"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimReviewActions({
  claimId,
  verificationStatus,
  classification,
}: {
  claimId: string;
  verificationStatus: string;
  classification: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  async function act(action: string) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/intelligence/claim-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, action, notes, reviewer: "admin-operator" }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      setMessage(data.ok ? "Action recorded — refresh to see status" : data.error ?? "Failed");
      if (data.ok) router.refresh();
    } catch {
      setMessage("Request failed");
    } finally {
      setLoading(false);
    }
  }

  const blocked = classification === "UNSUPPORTED";

  return (
    <section className="mb-6 rounded-xl border border-violet-200/50 bg-violet-50/30 p-4">
      <h2 className="text-sm font-bold uppercase text-violet-950">Human review (no auto-promote)</h2>
      <p className="mt-1 text-xs text-kelly-muted">Status: {verificationStatus} · Classification: {classification}</p>
      {blocked ? (
        <p className="mt-2 text-xs font-bold text-rose-900">UNSUPPORTED claims cannot be approved.</p>
      ) : null}
      <textarea
        className="mt-3 w-full rounded border border-kelly-text/20 p-2 text-xs"
        rows={2}
        placeholder="Reviewer notes (required for approval)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" disabled={loading} onClick={() => act("submit_review")} className="rounded border px-2 py-1 text-xs font-semibold">
          Submit for review
        </button>
        <button type="button" disabled={loading || blocked} onClick={() => act("approve_internal")} className="rounded border border-emerald-600 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-900 disabled:opacity-40">
          Approve internal use
        </button>
        <button type="button" disabled={loading || blocked} onClick={() => act("approve_public_adaptation")} className="rounded border border-kelly-navy/30 bg-kelly-navy px-2 py-1 text-xs font-bold text-white disabled:opacity-40">
          Approve public adaptation
        </button>
        <button type="button" disabled={loading} onClick={() => act("require_evidence")} className="rounded border px-2 py-1 text-xs font-semibold">
          Require more evidence
        </button>
        <button type="button" disabled={loading} onClick={() => act("reject")} className="rounded border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-900">
          Reject
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-kelly-muted">{message}</p> : null}
      <p className="mt-2 text-[10px] text-violet-900">No publish/send/export — promotion is status-only until export control approves.</p>
    </section>
  );
}
