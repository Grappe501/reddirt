"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ApprovalItem, ApprovalQueueStats } from "@/lib/compliance/approval/approval-types";
import type { NextItemExplanation } from "@/lib/compliance/approval/approval-burn-down";
import type { RuleReviewContext } from "@/lib/compliance/approval/rule-review-context";
import { evaluateApprovalGuards } from "@/lib/compliance/approval/approval-guards";
import { decisionAction, saveFieldEditsAction } from "./actions";
import { ComplianceWorkbenchStepper } from "./workbench-stepper";

type Props = {
  queueId: string;
  item: ApprovalItem;
  position: number;
  total: number;
  stats: ApprovalQueueStats;
  prevItemId?: string;
  nextBestExplanation?: NextItemExplanation | null;
  ruleReview?: RuleReviewContext | null;
};

export function LightningApprovalWorkbench({ queueId, item, position, total, prevItemId, nextBestExplanation, ruleReview }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [initials, setInitials] = useState("");
  const [note, setNote] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [dirty, setDirty] = useState<Record<string, string | number | boolean | null>>({});
  const [voiceLog, setVoiceLog] = useState<string[]>([]);
  const [overrideReason, setOverrideReason] = useState("");
  const guards = useMemo(() => evaluateApprovalGuards(item, { overrideReason }), [item, overrideReason]);
  const progress = total ? Math.round((position / total) * 100) : 0;

  const fieldValue = useCallback(
    (key: string, fallback?: string | number | boolean | null) => {
      if (key in dirty) return dirty[key];
      const field = item.fields.find((f) => f.key === key);
      return field?.value ?? fallback ?? "";
    },
    [dirty, item.fields],
  );

  const setField = (key: string, value: string) => {
    setDirty((current) => ({ ...current, [key]: value }));
  };

  const runDecision = useCallback(
    (decision: Parameters<typeof decisionAction>[0]["decision"]) => {
      if (!initials.trim()) {
        window.alert("Initials required for audit log.");
        return;
      }
      if ((decision === "approve" || decision === "approve_with_changes") && !guards.canApprove) {
        if (!overrideReason.trim()) {
          window.alert("Cannot approve yet. Resolve blockers or enter an override reason with initials.");
          return;
        }
        if (!note.trim()) {
          window.alert("Override requires a note for the audit log.");
          return;
        }
      }
      start(() =>
        decisionAction({
          itemId: item.id,
          queueId,
          decision,
          initials,
          note: note || overrideReason || undefined,
          edits: Object.keys(dirty).length ? dirty : undefined,
        }),
      );
    },
    [dirty, guards.canApprove, initials, item.id, note, overrideReason, queueId],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        if (event.key === "?" && event.shiftKey) setShowShortcuts((value) => !value);
        return;
      }
      if (event.key === "?") {
        setShowShortcuts((value) => !value);
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        runDecision("approve");
      }
      if (event.key === "Enter" && event.shiftKey) {
        event.preventDefault();
        runDecision("save_next");
      }
      if (event.key === "n" || event.key === "N") runDecision("needs_info");
      if (event.key === "r" || event.key === "R") runDecision("reject");
      if (event.key === "d" || event.key === "D") runDecision("duplicate");
      if (event.key === "s" || event.key === "S") runDecision("skip");
      if (event.key === "ArrowLeft" && prevItemId) router.push(`/admin/compliance/approval/${queueId}/item/${prevItemId}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevItemId, queueId, router, runDecision]);

  const startVoice = () => {
    const W = window as unknown as { webkitSpeechRecognition?: new () => { start: () => void; onresult: (event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void } };
    const Recognition = W.webkitSpeechRecognition;
    if (!Recognition) {
      window.alert("Voice not supported in this browser.");
      return;
    }
    const recognition = new Recognition();
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) return;
      setVoiceLog((log) => [...log, transcript]);
      const lower = transcript.toLowerCase();
      if (lower.includes("approve this item")) runDecision("approve");
      else if (lower.includes("approve with changes")) runDecision("approve_with_changes");
      else if (lower.includes("save and next")) runDecision("save_next");
      else if (lower.includes("needs info")) runDecision("needs_info");
      else if (lower.includes("reject this")) runDecision("reject");
      else if (lower.includes("mark duplicate")) runDecision("duplicate");
      else if (lower.startsWith("change amount to")) {
        const amount = lower.replace("change amount to", "").replace(/dollars?/, "").trim();
        setField("amount", amount);
        setField("total", amount);
      } else if (lower.startsWith("set employer to")) setField("employer", lower.replace("set employer to", "").trim());
      else if (lower.startsWith("set tip to")) setField("tip", lower.replace("set tip to", "").replace(/dollars?/, "").trim());
    };
    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-kelly-page">
      <header className="border-b border-kelly-text/10 bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-widest text-kelly-slate">
              Item {position} of {total}
            </p>
            <h1 className="font-heading text-2xl font-bold text-kelly-text">{item.title}</h1>
            {item.subtitle ? <p className="text-sm text-kelly-text/70">{item.subtitle}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-kelly-wash px-3 py-1 text-xs font-semibold">Confidence {item.confidenceScore}%</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskClass(item.riskLevel)}`}>Risk: {item.riskLevel}</span>
            <Link href={`/admin/compliance/approval/${queueId}`} className="text-sm font-semibold text-kelly-navy underline">
              Exit workbench
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-3 h-2 max-w-7xl overflow-hidden rounded-full bg-kelly-wash">
          <div className="h-full bg-kelly-navy transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-2 lg:p-6">
        <section className="overflow-y-auto rounded-2xl border border-kelly-text/10 bg-white p-4 shadow-sm">
          <h2 className="font-heading text-lg font-bold">Evidence</h2>
          {item.evidence.length ? (
            <div className="mt-4 space-y-3">
              {item.evidence.map((evidence) => {
                const isApril26Image =
                  evidence.path &&
                  /\.(jpe?g|png|heic|webp)$/i.test(evidence.path) &&
                  !evidence.path.includes("..");
                return (
                  <article key={evidence.id} className="rounded-xl border border-kelly-text/10 p-3">
                    <p className="text-xs font-bold uppercase text-kelly-slate">{evidence.type.replace(/_/g, " ")}</p>
                    <p className="font-semibold">{evidence.title}</p>
                    {evidence.summary ? <p className="text-sm text-kelly-text/70">{evidence.summary}</p> : null}
                    {isApril26Image ? (
                      <a
                        href={`/api/admin/compliance/april26-image?rel=${encodeURIComponent(evidence.path!)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/admin/compliance/april26-image?rel=${encodeURIComponent(evidence.path!)}`}
                          alt={evidence.title}
                          className="max-h-[min(70vh,520px)] w-full rounded-lg border border-kelly-text/10 object-contain bg-kelly-wash"
                        />
                      </a>
                    ) : null}
                    {evidence.path ? <p className="mt-1 font-mono text-xs break-all">{evidence.path}</p> : null}
                    {item.source === "in_kind_contribution" && isApril26Image ? (
                      <Link
                        href="/admin/compliance/in-kind/ozark-auction"
                        className="mt-2 inline-block text-sm font-bold text-kelly-navy underline"
                      >
                        Open Ozark Forward auction spreadsheet (all line items)
                      </Link>
                    ) : null}
                    {item.source === "check_contribution" ? (
                      <Link
                        href="/admin/compliance/checks/sos-entry"
                        className="mt-2 inline-block text-sm font-bold text-kelly-navy underline"
                      >
                        Open SOS check copy board
                      </Link>
                    ) : null}
                    {evidence.textPreview ? (
                      <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-kelly-wash p-2 text-xs whitespace-pre-wrap">{evidence.textPreview}</pre>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-900">
              Evidence missing — approval blocked unless override reason is entered.
            </p>
          )}
        </section>

        <section className="flex flex-col overflow-y-auto rounded-2xl border border-kelly-text/10 bg-white p-4 shadow-sm">
          <ComplianceWorkbenchStepper
            item={item}
            ruleReview={ruleReview}
            canApprove={guards.canApprove}
            hasOverride={Boolean(overrideReason.trim())}
          />
          {ruleReview ? (
            <div className="mb-3 rounded-lg border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-bold">Rule review — human required</p>
              <p className="mt-1">Topic: {ruleReview.topicLabel}</p>
              <p className="mt-1">{ruleReview.whyHumanReview}</p>
              <p className="mt-2 font-semibold">Suggested action</p>
              <p>{ruleReview.suggestedAction}</p>
              {ruleReview.missingEvidence.length ? <p className="mt-2">Missing: {ruleReview.missingEvidence.join("; ")}</p> : null}
              <p className="mt-2 text-xs">Batch approval: not allowed. Affects filing readiness: yes.</p>
              <Link href="/admin/compliance/rules" className="mt-2 inline-block font-bold underline">
                Open rules dashboard
              </Link>
            </div>
          ) : null}
          {nextBestExplanation ? (
            <div className="mb-3 rounded-lg border border-[#0f2744]/20 bg-slate-50 p-3 text-xs">
              <p className="font-bold text-[#0f2744]">Why this is next best</p>
              <ul className="mt-1 list-disc pl-4">
                {nextBestExplanation.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-xl bg-kelly-wash p-4">
            <p className="text-xs font-bold uppercase text-kelly-slate">AI summary (not legal certification)</p>
            <p className="mt-2 text-sm leading-relaxed">{item.aiSummary}</p>
            <p className="mt-2 text-xs">
              Recommendation: <strong>{item.aiRecommendation.replace(/_/g, " ")}</strong>
            </p>
          </div>

          {item.sourceUpdatePending ? (
            <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
              Source update pending — decision is on workbench; upstream write may still be queued.
            </p>
          ) : null}
          {guards.blockers.length ? (
            <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              <p className="font-bold">Approval blocked</p>
              {guards.blockers.map((blocker) => (
                <p key={blocker}>{blocker}</p>
              ))}
            </div>
          ) : null}
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-bold">What happens when you approve?</p>
            <ul className="mt-1 list-disc pl-5">
              <li>Item marked approved; source updated if supported.</li>
              <li>May help filing readiness after other gates pass.</li>
              <li>Stays unreconciled until bank match approved.</li>
            </ul>
          </div>
          {guards.overrideAllowed ? (
            <label className="mt-3 block text-sm">
              <span className="font-semibold">Override reason</span>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
            </label>
          ) : null}

          <div className="mt-4 grid gap-3">
            {item.fields.map((field) => (
              <label key={field.key} className="block text-sm">
                <span className="font-semibold">
                  {field.label}
                  {field.required ? " *" : ""}
                  <span className="ml-2 text-xs text-kelly-slate">({field.validationStatus})</span>
                </span>
                <input
                  className="mt-1 w-full rounded-lg border border-kelly-text/20 px-3 py-2"
                  value={String(fieldValue(field.key, field.value ?? ""))}
                  disabled={!field.editable || pending}
                  onChange={(event) => setField(field.key, event.target.value)}
                />
              </label>
            ))}
          </div>

          <label className="mt-4 block text-sm">
            <span className="font-semibold">Your initials *</span>
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={initials} onChange={(event) => setInitials(event.target.value.toUpperCase())} />
          </label>
          <label className="mt-2 block text-sm">
            <span className="font-semibold">Note</span>
            <textarea className="mt-1 w-full rounded-lg border px-3 py-2" rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>

          {Object.keys(dirty).length ? (
            <button
              type="button"
              disabled={pending || !initials.trim()}
              className="mt-3 w-full rounded-full border border-kelly-navy px-4 py-2 text-sm font-semibold text-kelly-navy"
              onClick={() => start(() => saveFieldEditsAction({ itemId: item.id, queueId, edits: dirty, initials }))}
            >
              Save Changes
            </button>
          ) : null}

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <ActionButton label="Approve & Next" sub="Enter" disabled={pending} onClick={() => runDecision("approve")} primary />
            <ActionButton label="Approve w/ Changes & Next" disabled={pending} onClick={() => runDecision("approve_with_changes")} />
            <ActionButton label="Save & Next" sub="Shift+Enter" disabled={pending} onClick={() => runDecision("save_next")} />
            <ActionButton label="Needs Info & Next" sub="N" disabled={pending} onClick={() => runDecision("needs_info")} />
            <ActionButton label="Reject & Next" sub="R" disabled={pending} onClick={() => runDecision("reject")} danger />
            <ActionButton label="Duplicate & Next" sub="D" disabled={pending} onClick={() => runDecision("duplicate")} />
            <ActionButton label="Skip" sub="S" disabled={pending} onClick={() => runDecision("skip")} />
            {prevItemId ? (
              <Link href={`/admin/compliance/approval/${queueId}/item/${prevItemId}`} className="rounded-full border px-4 py-3 text-center text-sm font-semibold">
                ← Back
              </Link>
            ) : null}
          </div>

          <button type="button" className="mt-3 text-sm font-semibold text-kelly-navy underline" onClick={startVoice}>
            Voice commands (say &quot;approve this item&quot;)
          </button>
          {voiceLog.length ? <pre className="mt-2 text-xs whitespace-pre-wrap">{voiceLog.join("\n")}</pre> : null}
          {showShortcuts ? (
            <p className="mt-4 rounded-lg border p-3 text-xs">
              Enter = Approve · Shift+Enter = Save & Next · N = Needs info · R = Reject · D = Duplicate · S = Skip · ? = Shortcuts
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function riskClass(risk: ApprovalItem["riskLevel"]) {
  if (risk === "low") return "bg-emerald-100 text-emerald-900";
  if (risk === "medium") return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-900";
}

function ActionButton({
  label,
  sub,
  disabled,
  onClick,
  primary,
  danger,
}: {
  label: string;
  sub?: string;
  disabled?: boolean;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  const className = primary
    ? "rounded-full bg-kelly-text px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
    : danger
      ? "rounded-full border border-red-700 px-4 py-3 text-sm font-semibold text-red-900 disabled:opacity-50"
      : "rounded-full border border-kelly-text/20 px-4 py-3 text-sm font-semibold disabled:opacity-50";
  return (
    <button type="button" disabled={disabled} className={className} onClick={onClick}>
      {label}
      {sub ? <span className="block text-[10px] opacity-70">{sub}</span> : null}
    </button>
  );
}
