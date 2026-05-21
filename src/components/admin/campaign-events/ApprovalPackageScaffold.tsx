"use client";

import { useEffect, useState } from "react";
import type { WorkbenchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import type { ApprovalPackagePayload } from "@/lib/campaign-events/approval-package";
import { loadApprovalPackageBundleAction } from "@/app/admin/(board)/campaign-events/approval-email-actions";
import { ApprovalPackagePreviewPanel } from "./ApprovalPackagePreviewPanel";

export function ApprovalPackageScaffold({ row }: { row: WorkbenchEventRow | null }) {
  const [payload, setPayload] = useState<ApprovalPackagePayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!row) {
      setPayload(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadApprovalPackageBundleAction(row.recordId).then((res) => {
      if (cancelled) return;
      setPayload(res.ok ? res.payload : null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [row?.recordId]);

  if (!row) {
    return (
      <section className="rounded-2xl border border-dashed border-kelly-text/20 bg-kelly-wash p-6 text-center font-body text-sm text-kelly-text/55">
        Select an event to preview the approval email package (send gated by config).
      </section>
    );
  }

  if (loading && !payload) {
    return (
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-wash p-6 text-center font-body text-sm text-kelly-text/55">
        Loading approval package…
      </section>
    );
  }

  if (!payload) {
    return (
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-wash p-6 text-center font-body text-sm text-kelly-text/55">
        Could not load approval package for this event.
      </section>
    );
  }

  return <ApprovalPackagePreviewPanel payload={payload} recordId={row.recordId} />;
}
