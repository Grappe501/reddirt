"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MessageStudioLocalDraft } from "@/components/admin/email-command-center/message-studio-local-drafts";
import {
  SEND_PACKET_APPROVAL_KEYS,
  SEND_PACKET_SUPPRESSION_KEYS,
  buildMessageStudioSendPacket,
  buildSendPacketPlainText,
  buildSendPacketSummaryText,
  type MessageStudioSendPacket,
  type SendPacketApprovalKey,
  type SendPacketSuppressionKey,
} from "@/components/admin/email-command-center/message-studio-send-packet";
import { EDITORIAL_REVIEW_OWNER_OPTIONS } from "@/lib/email-command-center/message-studio-editorial-review-model";

const SEND_EXECUTION_PATH = "/admin/workbench/email-command-center/send-execution";

const SUPPRESSION_LABELS: Record<SendPacketSuppressionKey, string> = {
  audience_source_reviewed: "Audience source reviewed",
  imported_contacts_consent_reviewed: "Imported contacts — consent / source reviewed",
  suppression_scan_required_before_send: "Suppression scan required before send",
  unsubscribes_must_be_excluded: "Unsubscribes must be excluded",
  bounces_spam_complaints_excluded: "Bounces / spam complaints excluded",
  final_send_list_not_generated_here: "Final send list not generated from this page",
};

const APPROVAL_LABELS: Record<SendPacketApprovalKey, string> = {
  operator_reviewed: "Operator reviewed",
  comms_reviewed: "Comms reviewed",
  candidate_principal_if_needed: "Candidate / principal review if needed",
  legal_compliance_if_needed: "Legal / compliance review if needed",
  finance_if_fundraising: "Finance review if fundraising",
  final_send_operator_not_authorized: "Final send operator not yet authorized",
};

function defaultSuppressionRecord(): Record<SendPacketSuppressionKey, boolean> {
  return Object.fromEntries(SEND_PACKET_SUPPRESSION_KEYS.map((k) => [k, false])) as Record<
    SendPacketSuppressionKey,
    boolean
  >;
}

function defaultApprovalRecord(): Record<SendPacketApprovalKey, boolean> {
  return Object.fromEntries(SEND_PACKET_APPROVAL_KEYS.map((k) => [k, false])) as Record<SendPacketApprovalKey, boolean>;
}

function ownerLabel(owner: MessageStudioLocalDraft["editorialReviewOwner"]): string {
  return EDITORIAL_REVIEW_OWNER_OPTIONS.find((o) => o.value === owner)?.label ?? owner;
}

function tryParseStoredPacket(raw: string): Partial<MessageStudioSendPacket> | null {
  try {
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object") return null;
    return p as Partial<MessageStudioSendPacket>;
  } catch {
    return null;
  }
}

export type MessageStudioSendPacketPanelProps = {
  activeDraft: MessageStudioLocalDraft;
  patchActive: (patch: Partial<MessageStudioLocalDraft>) => void;
  copyText: (label: string, text: string) => void | Promise<void>;
};

export function MessageStudioSendPacketPanel({ activeDraft, patchActive, copyText }: MessageStudioSendPacketPanelProps) {
  const [suppression, setSuppression] = useState(defaultSuppressionRecord);
  const [approval, setApproval] = useState(defaultApprovalRecord);
  const [operatorNotes, setOperatorNotes] = useState("");

  useEffect(() => {
    const raw = activeDraft.lastSendPacketJson?.trim();
    if (!raw) {
      setSuppression(defaultSuppressionRecord());
      setApproval(defaultApprovalRecord());
      setOperatorNotes("");
      return;
    }
    const p = tryParseStoredPacket(raw);
    if (!p) {
      setSuppression(defaultSuppressionRecord());
      setApproval(defaultApprovalRecord());
      setOperatorNotes("");
      return;
    }
    const nextS = defaultSuppressionRecord();
    for (const k of SEND_PACKET_SUPPRESSION_KEYS) {
      if (p.suppressionChecklist && typeof p.suppressionChecklist[k] === "boolean") {
        nextS[k] = p.suppressionChecklist[k];
      }
    }
    const nextA = defaultApprovalRecord();
    for (const k of SEND_PACKET_APPROVAL_KEYS) {
      if (p.approvalChecklist && typeof p.approvalChecklist[k] === "boolean") {
        nextA[k] = p.approvalChecklist[k];
      }
    }
    setSuppression(nextS);
    setApproval(nextA);
    setOperatorNotes(typeof p.operatorNotes === "string" ? p.operatorNotes : "");
  }, [activeDraft.id, activeDraft.lastSendPacketJson]);

  const packet = useMemo(
    () =>
      buildMessageStudioSendPacket(activeDraft, {
        suppressionChecklist: suppression,
        approvalChecklist: approval,
        operatorNotes,
      }),
    [activeDraft, suppression, approval, operatorNotes],
  );

  const pre = packet.preSendChecklist;

  const completenessRows: { key: string; label: string; ok: boolean }[] = [
    { key: "subject", label: "Subject present", ok: pre.subjectPresent },
    { key: "preheader", label: "Preheader present", ok: pre.preheaderPresent },
    { key: "body", label: "Body present", ok: pre.bodyPresent },
    { key: "cta", label: "CTA present", ok: pre.ctaPresent },
    { key: "audience", label: "Audience / context present", ok: pre.audienceContextPresent },
    { key: "owner", label: "Approval owner selected", ok: pre.approvalOwnerSelected },
    { key: "ed", label: "Editorial review status ready for send governance", ok: pre.editorialReviewStatusReady },
    { key: "claims", label: "No unresolved high-risk claim / source checks", ok: pre.editorialClaimSourceRowsClear },
    { key: "comp", label: "Compliance reminders acknowledged", ok: pre.complianceRemindersAcknowledged },
    { key: "gov", label: "Send governance required (doctrine)", ok: pre.sendGovernanceRequired },
  ];

  const saveSnapshotToDraft = useCallback(() => {
    const json = JSON.stringify(packet, null, 2);
    patchActive({
      lastSendPacketJson: json,
      lastSendPacketGeneratedAt: packet.generatedAt,
    });
  }, [packet, patchActive]);

  const downloadTextFile = (filename: string, body: string, mime: string) => {
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shortId = activeDraft.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 12) || "draft";
  const stamp = packet.generatedAt.replace(/[:.]/g, "-").slice(0, 19);

  return (
    <section
      id="send-packet-builder"
      className="rounded-lg border border-teal-200/80 bg-gradient-to-b from-teal-50/90 to-white/95 px-3 py-3 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-[10px] font-bold uppercase tracking-wider text-teal-950/75">
            Send Packet Builder — EMAIL-SEND-PACKET-BUILDER-1.0
          </h2>
          <p className="mt-1 max-w-3xl font-body text-[10px] text-teal-950/90">
            Assemble a <strong>no-send review packet</strong> from this local draft for Send Execution Governance. Copy or
            export JSON/text only — no provider APIs, no campaigns, no mail.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Link
            href={SEND_EXECUTION_PATH}
            className="rounded border border-teal-600/40 bg-teal-700/10 px-2 py-1 text-[10px] font-bold text-teal-950 hover:bg-teal-700/15"
          >
            Open Send Execution
          </Link>
          {activeDraft.linkedServerDraftId ? (
            <Link
              href={`${SEND_EXECUTION_PATH}?draftId=${encodeURIComponent(activeDraft.linkedServerDraftId)}#ops`}
              className="rounded border border-violet-500/40 bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-950 hover:bg-violet-100"
            >
              Create Send Execution (this shared draft)
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded border border-teal-100 bg-white/95 px-2.5 py-2">
          <h3 className="font-heading text-[9px] font-bold uppercase tracking-wide text-teal-900/55">1. Packet summary</h3>
          <dl className="mt-1.5 space-y-1 font-body text-[10px] text-teal-950/95">
            <div>
              <dt className="font-bold text-teal-900">Draft</dt>
              <dd>{packet.draftTitle.trim() || "(untitled)"}</dd>
            </div>
            <div>
              <dt className="font-bold text-teal-900">Draft type</dt>
              <dd>{packet.draftType.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="font-bold text-teal-900">Subject</dt>
              <dd className="line-clamp-2">{packet.subject.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="font-bold text-teal-900">Future send rail (advisory)</dt>
              <dd>{packet.futureSendRail}</dd>
            </div>
            <div>
              <dt className="font-bold text-teal-900">Readiness tier</dt>
              <dd className="font-mono text-[9px]">{packet.editorialReadinessTier.replace(/_/g, " ")}</dd>
            </div>
            <div>
              <dt className="font-bold text-teal-900">Editorial owner</dt>
              <dd>{ownerLabel(packet.editorialReviewOwner)}</dd>
            </div>
            <div>
              <dt className="font-bold text-teal-900">Last template applied</dt>
              <dd className="font-mono text-[9px]">{packet.templateIdLastApplied.trim() || "—"}</dd>
            </div>
            <div>
              <dt className="font-bold text-teal-900">Campaign voice</dt>
              <dd>
                Tone: {packet.toneLabel} · Issue: {packet.issueFrameLabel} · Audience frame: {packet.audienceFrameLabel} ·
                CTA frame: {packet.ctaFrameLabel}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded border border-teal-100 bg-white/95 px-2.5 py-2">
          <h3 className="font-heading text-[9px] font-bold uppercase tracking-wide text-teal-900/55">2. Packet completeness</h3>
          <ul className="mt-1.5 space-y-1 font-body text-[10px]">
            {completenessRows.map((row) => (
              <li key={row.key} className="flex items-start gap-1.5">
                <span className={row.ok ? "text-emerald-700" : "text-amber-800"}>{row.ok ? "✓" : "○"}</span>
                <span className={row.ok ? "text-teal-950/90" : "text-teal-950/75"}>{row.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded border border-teal-100 bg-white/95 px-2.5 py-2">
          <h3 className="font-heading text-[9px] font-bold uppercase tracking-wide text-teal-900/55">
            3. Suppression / consent checklist
          </h3>
          <p className="mt-1 font-body text-[9px] text-teal-900/75">Manual operator attestations — not verified by this UI.</p>
          <ul className="mt-2 space-y-1.5 font-body text-[10px] text-teal-950">
            {SEND_PACKET_SUPPRESSION_KEYS.map((k) => (
              <li key={k} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={`sup-${k}`}
                  checked={suppression[k]}
                  onChange={(e) => setSuppression((prev) => ({ ...prev, [k]: e.target.checked }))}
                  className="mt-0.5"
                />
                <label htmlFor={`sup-${k}`} className="cursor-pointer select-none">
                  {SUPPRESSION_LABELS[k]}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border border-teal-100 bg-white/95 px-2.5 py-2">
          <h3 className="font-heading text-[9px] font-bold uppercase tracking-wide text-teal-900/55">4. Approval checklist</h3>
          <p className="mt-1 font-body text-[9px] text-teal-900/75">Manual sign-off tracking — still not send authorization.</p>
          <ul className="mt-2 space-y-1.5 font-body text-[10px] text-teal-950">
            {SEND_PACKET_APPROVAL_KEYS.map((k) => (
              <li key={k} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id={`app-${k}`}
                  checked={approval[k]}
                  onChange={(e) => setApproval((prev) => ({ ...prev, [k]: e.target.checked }))}
                  className="mt-0.5"
                />
                <label htmlFor={`app-${k}`} className="cursor-pointer select-none">
                  {APPROVAL_LABELS[k]}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded border border-teal-100 bg-white/95 px-2.5 py-2">
        <label htmlFor="send-packet-operator-notes" className="font-heading text-[9px] font-bold uppercase text-teal-900/55">
          Operator notes (included in export)
        </label>
        <textarea
          id="send-packet-operator-notes"
          value={operatorNotes}
          onChange={(e) => setOperatorNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full resize-y rounded border border-teal-200/80 bg-white px-2 py-1 font-body text-[11px] text-teal-950"
          placeholder="Routing, timing, or governance context for the next human…"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => void copyText("Send packet summary", buildSendPacketSummaryText(packet))}
          className="rounded border border-teal-600/35 bg-white px-2 py-1 text-[10px] font-bold text-teal-950"
        >
          Copy send packet summary
        </button>
        <button
          type="button"
          onClick={() =>
            void copyText(
              "Subject + preheader + body",
              [packet.subject, packet.preheader, packet.body].filter(Boolean).join("\n\n"),
            )
          }
          className="rounded border border-teal-600/35 bg-white px-2 py-1 text-[10px] font-bold text-teal-950"
        >
          Copy subject + preheader + body
        </button>
        <button
          type="button"
          onClick={() => {
            const json = JSON.stringify(packet, null, 2);
            downloadTextFile(`send-packet-${shortId}-${stamp}.json`, json, "application/json");
          }}
          className="rounded border border-teal-600/35 bg-white px-2 py-1 text-[10px] font-bold text-teal-950"
        >
          Export packet .json
        </button>
        <button
          type="button"
          onClick={() => {
            downloadTextFile(`send-packet-${shortId}-${stamp}.txt`, buildSendPacketPlainText(packet), "text/plain;charset=utf-8");
          }}
          className="rounded border border-teal-600/35 bg-white px-2 py-1 text-[10px] font-bold text-teal-950"
        >
          Export packet .txt
        </button>
        <button
          type="button"
          onClick={saveSnapshotToDraft}
          className="rounded border border-teal-700/50 bg-teal-800/10 px-2 py-1 text-[10px] font-bold text-teal-950"
        >
          Save packet snapshot to draft
        </button>
        <Link
          href={SEND_EXECUTION_PATH}
          className="inline-flex items-center rounded border border-teal-700/40 bg-teal-900/5 px-2 py-1 text-[10px] font-bold text-teal-950"
        >
          Open Send Execution Governance
        </Link>
      </div>

      {activeDraft.lastSendPacketGeneratedAt ? (
        <p className="mt-2 font-mono text-[9px] text-teal-900/70">
          Last snapshot saved: {activeDraft.lastSendPacketGeneratedAt}
        </p>
      ) : null}

      <div
        className="mt-3 rounded border border-amber-300/60 bg-amber-50/90 px-2.5 py-2 font-body text-[10px] text-amber-950"
        role="status"
      >
        <p className="font-bold text-amber-950">Governance notice</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          <li>This packet does not send email.</li>
          <li>This packet does not create a SendGrid campaign.</li>
          <li>This packet does not create Gmail replies.</li>
          <li>This packet is a review artifact for future governed send execution.</li>
        </ul>
        <p className="mt-2 text-[9px] text-amber-900/90">
          <code className="rounded bg-white/80 px-0.5">sendGovernanceRequired</code> = true ·{" "}
          <code className="rounded bg-white/80 px-0.5">canSendFromPacket</code> = false ·{" "}
          <code className="rounded bg-white/80 px-0.5">canSendFromQueue</code> = false
        </p>
      </div>
    </section>
  );
}
