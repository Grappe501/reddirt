"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { COMMUNITY_DEFECT_SEVERITIES, COMMUNITY_PILOT_WORKBENCHES } from "@/lib/election-plan/community-workbench/pilot";
import type { CommunityPilotDefectRow } from "@/lib/election-plan/community-workbench/load-pilot-status";
import { cn } from "@/lib/utils";

type Props = {
  initialDefects: CommunityPilotDefectRow[];
  operatorInitials: string | null;
  workbenchSlug?: string;
  showWorkbenchPicker?: boolean;
};

export function CommunityWorkbenchDefectLogPanel({
  initialDefects,
  operatorInitials,
  workbenchSlug,
  showWorkbenchPicker = false,
}: Props) {
  const router = useRouter();
  const [defects, setDefects] = useState(initialDefects);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [slug, setSlug] = useState(workbenchSlug ?? "sherwood");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitDefect(e: React.FormEvent) {
    e.preventDefault();
    if (!operatorInitials) {
      setError("Sign in with operator initials to log defects.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/election-plan/workbenches/defects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workbenchSlug: slug, title, body, severity }),
      });
      const data = (await res.json()) as { error?: string; defect?: CommunityPilotDefectRow };
      if (!res.ok) {
        setError(data.error ?? "Failed to log defect");
        return;
      }
      if (data.defect) {
        setDefects((prev) => [
          {
            id: data.defect!.id,
            workbenchSlug: data.defect!.workbenchSlug,
            title: data.defect!.title,
            body: data.defect!.body,
            severity: data.defect!.severity,
            status: data.defect!.status,
            operatorInitials: data.defect!.operatorInitials,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      setTitle("");
      setBody("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    if (!operatorInitials) return;
    const res = await fetch("/api/election-plan/workbenches/defects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setDefects((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
      router.refresh();
    }
  }

  const openCount = defects.filter((d) => d.status === "open" || d.status === "triaged").length;

  return (
    <div>
      <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Field defect log</h3>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        {openCount} open · Sherwood & Jacksonville pilot only. No PII in defect descriptions.
      </p>

      <form onSubmit={submitDefect} className="mt-4 space-y-3 rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)] p-4">
        {showWorkbenchPicker ? (
          <label className="block text-sm">
            <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Workbench</span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
            >
              {COMMUNITY_PILOT_WORKBENCHES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm">
          <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Event save failed after AAR"
            className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">What happened?</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            placeholder="Steps to reproduce, browser, operator initials context — no real PII"
            className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Severity</span>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--ep-border)] px-3 py-2 text-sm"
          >
            {COMMUNITY_DEFECT_SEVERITIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--ep-navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Log defect"}
        </button>
      </form>

      <ul className="mt-4 divide-y divide-[var(--ep-border)] rounded-lg border border-[var(--ep-border)]">
        {defects.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm italic text-[var(--ep-navy-muted)]">No defects logged yet.</li>
        ) : (
          defects.map((d) => (
            <li key={d.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--ep-navy)]">
                    [{d.workbenchSlug}] {d.title}
                  </p>
                  <p className="mt-1 text-[var(--ep-navy-muted)]">{d.body}</p>
                  <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">
                    {d.severity} · {d.operatorInitials ?? "—"} · {new Date(d.createdAt).toLocaleString()}
                  </p>
                </div>
                <select
                  value={d.status}
                  onChange={(e) => updateStatus(d.id, e.target.value)}
                  className={cn(
                    "rounded border px-2 py-1 text-xs font-semibold",
                    d.status === "open" ? "border-red-300 bg-red-50" : "border-[var(--ep-border)] bg-white",
                  )}
                >
                  <option value="open">Open</option>
                  <option value="triaged">Triaged</option>
                  <option value="fixed">Fixed</option>
                  <option value="wontfix">Won&apos;t fix</option>
                </select>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
