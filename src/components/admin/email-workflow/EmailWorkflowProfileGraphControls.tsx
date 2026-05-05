"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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

function SuggestionRow({
  itemId,
  suggestionId,
  factValue,
  status,
}: {
  itemId: string;
  suggestionId: string;
  factValue: string;
  status: string;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, trans] = useTransition();
  const router = useRouter();
  const isPending = status === "PENDING";

  return (
    <li className="rounded border border-kelly-text/10 bg-white px-2 py-1 text-[11px] text-kelly-text/85">
      <p>{factValue}</p>
      <p className="text-[9px] text-kelly-text/50">{status}</p>
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

function HintRow({
  itemId,
  hintId,
  label,
  status,
}: {
  itemId: string;
  hintId: string;
  label: string;
  status: string;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, trans] = useTransition();
  const router = useRouter();
  const isPending = status === "PENDING";

  return (
    <li className="rounded border border-kelly-text/10 bg-white px-2 py-1 text-[11px] text-kelly-text/85">
      <p>{label}</p>
      <p className="text-[9px] text-kelly-text/50">{status}</p>
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
  suggestions: Array<{ id: string; factValue: string; status: string }>;
}) {
  if (!props.suggestions.length) {
    return <p className="text-[11px] text-kelly-text/55">No suggestions yet for this queue item.</p>;
  }
  return (
    <ul className="mt-1 space-y-1">
      {props.suggestions.map((s) => (
        <SuggestionRow
          key={s.id}
          itemId={props.itemId}
          suggestionId={s.id}
          factValue={s.factValue}
          status={s.status}
        />
      ))}
    </ul>
  );
}

export function ProfileAudienceHintsList(props: {
  itemId: string;
  hints: Array<{ id: string; label: string; status: string }>;
}) {
  if (!props.hints.length) {
    return <p className="text-[11px] text-kelly-text/55">No audience hints staged.</p>;
  }
  return (
    <ul className="mt-1 space-y-1">
      {props.hints.map((h) => (
        <HintRow key={h.id} itemId={props.itemId} hintId={h.id} label={h.label} status={h.status} />
      ))}
    </ul>
  );
}
