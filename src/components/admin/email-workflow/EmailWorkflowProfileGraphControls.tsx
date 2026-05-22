"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  parseAudienceIntelligenceV2FromHintMetadata,
  parseProfileIntelligenceV2FromSuggestionMetadata,
} from "@/lib/email-command-center/ai-profile-intelligence";
import {
  approveEmailAudienceHintAction,
  approveEmailProfileFactSuggestionAction,
  generateProfileSuggestionsFromEmailAiAction,
  rejectEmailAudienceHintAction,
  rejectEmailProfileFactSuggestionAction,
} from "@/app/admin/email-profile-graph-actions";

export function GenerateProfileSuggestionsFromAiButton({
  itemId,
  disabled,
}: {
  itemId: string;
  disabled?: boolean;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, trans] = useTransition();
  const router = useRouter();

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={pending || disabled}
        onClick={() => {
          setMsg(null);
          const fd = new FormData();
          fd.set("itemId", itemId);
          trans(async () => {
            const r = await generateProfileSuggestionsFromEmailAiAction(fd);
            if (!r.ok) {
              setMsg(r.error);
            } else {
              setMsg(
                `Created ${r.createdFacts} profile suggestion(s), ${r.createdHints} audience hint(s) (skipped duplicates already pending).`
              );
            }
            router.refresh();
          });
        }}
        className="rounded border border-kelly-forest/40 bg-white px-2 py-1 text-[11px] font-bold text-kelly-navy hover:bg-kelly-fog/50 disabled:opacity-50"
      >
        {pending ? "Staging…" : "Generate suggestions from AI analysis"}
      </button>
      {msg ? <p className="mt-1 text-[10px] text-kelly-text/75">{msg}</p> : null}
    </div>
  );
}

export type ProfileFactSuggestionListItem = {
  id: string;
  factValue: string;
  status: string;
  factKey?: string | null;
  suggestionType?: string | null;
  confidence?: number | null;
  rationale?: string | null;
  metadataJson?: unknown;
};

function SuggestionRow({
  itemId,
  suggestionId,
  factValue,
  status,
  factKey,
  suggestionType,
  confidence,
  rationale,
  metadataJson,
}: ProfileFactSuggestionListItem & { itemId: string; suggestionId: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, trans] = useTransition();
  const router = useRouter();
  const isPending = status === "PENDING";
  const pi2 = parseProfileIntelligenceV2FromSuggestionMetadata(metadataJson);

  return (
    <li className="rounded border border-kelly-text/10 bg-white px-2 py-1 text-[11px] text-kelly-text/85">
      <p>{factValue}</p>
      <div className="mt-0.5 flex flex-wrap gap-1 text-[9px] text-kelly-muted">
        <span>{status}</span>
        {suggestionType ? <span>· {suggestionType}</span> : null}
        {factKey ? <span>· {factKey}</span> : null}
        {confidence != null ? <span>· conf {confidence.toFixed(2)}</span> : null}
      </div>
      {pi2 ? (
        <div className="mt-1 space-y-1 rounded border border-kelly-text/8 bg-kelly-page/40 px-1.5 py-1 text-[10px] text-kelly-text/80">
          <p>
            <span className="font-semibold text-kelly-muted">Why suggested:</span> {pi2.whySuggested}
          </p>
          <p className="font-mono text-[9px] text-kelly-muted">
            <span className="font-sans font-semibold">Evidence:</span> {pi2.evidenceText.slice(0, 600)}
            {pi2.evidenceText.length > 600 ? "…" : ""}
          </p>
          <p className="text-[9px]">
            risk {pi2.riskLevel} · source {pi2.sourceType} · type {pi2.factType}
            {pi2.needsHumanReview ? " · needs review" : ""}
          </p>
          {pi2.shouldNotStoreReason ? (
            <p className="rounded bg-rose-50/90 px-1 py-0.5 text-rose-950">
              <strong>Do not store:</strong> {pi2.shouldNotStoreReason}
            </p>
          ) : null}
        </div>
      ) : rationale ? (
        <p className="mt-1 whitespace-pre-wrap text-[9px] text-kelly-muted">{rationale.slice(0, 800)}</p>
      ) : null}
      {isPending ? (
        <div className="mt-1 flex flex-wrap gap-1">
          <button
            type="button"
            disabled={pending}
            className="rounded bg-kelly-forest/90 px-2 py-0.5 text-[10px] font-bold text-white disabled:opacity-50"
            onClick={() => {
              setErr(null);
              trans(async () => {
                const fd = new FormData();
                fd.set("suggestionId", suggestionId);
                fd.set("emailWorkflowItemId", itemId);
                const r = await approveEmailProfileFactSuggestionAction(fd);
                if (!r.ok) setErr(r.error);
                router.refresh();
              });
            }}
          >
            Approve → fact
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded border border-rose-300/60 bg-white px-2 py-0.5 text-[10px] font-semibold text-rose-950 disabled:opacity-50"
            onClick={() => {
              setErr(null);
              trans(async () => {
                const fd = new FormData();
                fd.set("suggestionId", suggestionId);
                fd.set("emailWorkflowItemId", itemId);
                const r = await rejectEmailProfileFactSuggestionAction(fd);
                if (!r.ok) setErr(r.error);
                router.refresh();
              });
            }}
          >
            Reject
          </button>
        </div>
      ) : null}
      {err ? <p className="mt-1 text-[10px] text-rose-800">{err}</p> : null}
    </li>
  );
}

export type ProfileAudienceHintListItem = {
  id: string;
  label: string;
  status: string;
  hintType?: string | null;
  confidence?: number | null;
  rationale?: string | null;
  metadataJson?: unknown;
};

function HintRow({
  itemId,
  hintId,
  label,
  status,
  hintType,
  confidence,
  rationale,
  metadataJson,
}: ProfileAudienceHintListItem & { itemId: string; hintId: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, trans] = useTransition();
  const router = useRouter();
  const isPending = status === "PENDING";
  const hi2 = parseAudienceIntelligenceV2FromHintMetadata(metadataJson);

  return (
    <li className="rounded border border-kelly-text/10 bg-white px-2 py-1 text-[11px] text-kelly-text/85">
      <p>{label}</p>
      <div className="mt-0.5 flex flex-wrap gap-1 text-[9px] text-kelly-muted">
        <span>{status}</span>
        {hintType ? <span>· {hintType}</span> : null}
        {confidence != null ? <span>· conf {confidence.toFixed(2)}</span> : null}
      </div>
      {hi2 ? (
        <div className="mt-1 space-y-1 rounded border border-kelly-text/8 bg-kelly-page/40 px-1.5 py-1 text-[10px] text-kelly-text/80">
          <p>
            <span className="font-semibold text-kelly-muted">Why suggested:</span> {hi2.whySuggested}
          </p>
          <p className="font-mono text-[9px] text-kelly-muted">
            <span className="font-sans font-semibold">Evidence:</span> {hi2.evidenceText.slice(0, 600)}
            {hi2.evidenceText.length > 600 ? "…" : ""}
          </p>
          <p className="text-[9px]">
            risk {hi2.riskLevel} · source {hi2.sourceType}
            {hi2.needsHumanReview ? " · needs review" : ""}
          </p>
          {hi2.shouldNotStoreReason ? (
            <p className="rounded bg-rose-50/90 px-1 py-0.5 text-rose-950">
              <strong>Do not store:</strong> {hi2.shouldNotStoreReason}
            </p>
          ) : null}
        </div>
      ) : rationale ? (
        <p className="mt-1 whitespace-pre-wrap text-[9px] text-kelly-muted">{rationale.slice(0, 800)}</p>
      ) : null}
      {isPending ? (
        <div className="mt-1 flex flex-wrap gap-1">
          <button
            type="button"
            disabled={pending}
            className="rounded bg-amber-800/85 px-2 py-0.5 text-[10px] font-bold text-white disabled:opacity-50"
            onClick={() => {
              setErr(null);
              trans(async () => {
                const fd = new FormData();
                fd.set("hintId", hintId);
                fd.set("emailWorkflowItemId", itemId);
                const r = await approveEmailAudienceHintAction(fd);
                if (!r.ok) setErr(r.error);
                router.refresh();
              });
            }}
          >
            Approve hint (audit only)
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded border border-rose-300/60 px-2 py-0.5 text-[10px] font-semibold text-rose-950 disabled:opacity-50"
            onClick={() => {
              setErr(null);
              trans(async () => {
                const fd = new FormData();
                fd.set("hintId", hintId);
                fd.set("emailWorkflowItemId", itemId);
                const r = await rejectEmailAudienceHintAction(fd);
                if (!r.ok) setErr(r.error);
                router.refresh();
              });
            }}
          >
            Reject
          </button>
        </div>
      ) : null}
      {err ? <p className="mt-1 text-[10px] text-rose-800">{err}</p> : null}
    </li>
  );
}

export function ProfileFactSuggestionsList(props: {
  itemId: string;
  suggestions: ProfileFactSuggestionListItem[];
}) {
  if (!props.suggestions.length) {
    return <p className="text-[11px] text-kelly-muted">No suggestions yet for this queue item.</p>;
  }
  return (
    <ul className="mt-1 space-y-1">
      {props.suggestions.map((s) => (
        <SuggestionRow
          key={s.id}
          itemId={props.itemId}
          suggestionId={s.id}
          id={s.id}
          factValue={s.factValue}
          status={s.status}
          factKey={s.factKey}
          suggestionType={s.suggestionType}
          confidence={s.confidence}
          rationale={s.rationale}
          metadataJson={s.metadataJson}
        />
      ))}
    </ul>
  );
}

export function ProfileAudienceHintsList(props: {
  itemId: string;
  hints: ProfileAudienceHintListItem[];
}) {
  if (!props.hints.length) {
    return <p className="text-[11px] text-kelly-muted">No audience hints staged.</p>;
  }
  return (
    <ul className="mt-1 space-y-1">
      {props.hints.map((h) => (
        <HintRow
          key={h.id}
          itemId={props.itemId}
          hintId={h.id}
          id={h.id}
          label={h.label}
          status={h.status}
          hintType={h.hintType}
          confidence={h.confidence}
          rationale={h.rationale}
          metadataJson={h.metadataJson}
        />
      ))}
    </ul>
  );
}
