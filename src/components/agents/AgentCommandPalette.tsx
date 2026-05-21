"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { askCampaignAgentAction } from "@/app/admin/agent-runtime/actions";
import { getPromptsForPath } from "@/lib/agents/runtime/page-aware-prompts";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import type { AgentRuntimeResponse } from "@/lib/agents/runtime/agent-runtime-types";
import { useAgentObservation } from "./AgentObservationTracker";

export function AgentCommandPalette({
  role,
  pathname,
  period,
  eventRecordId,
  compact,
}: {
  role: CampaignUserRole | string;
  pathname: string;
  period: string;
  eventRecordId?: string | null;
  compact?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<AgentRuntimeResponse | null>(null);
  const [pending, startTransition] = useTransition();
  const { track } = useAgentObservation();
  const prompts = getPromptsForPath(pathname);

  const submit = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessage(q);
    startTransition(async () => {
      const res = await askCampaignAgentAction({
        message: q,
        pathname,
        role: role as CampaignUserRole,
        period,
        eventRecordId,
      });
      if (res.ok) {
        setResponse(res.response);
        track("suggestion_accepted", { actionId: "agent_runtime", task: res.response.interpretedIntent.task });
      }
    });
  };

  return (
    <section
      className={`rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.03] font-body text-sm ${compact ? "p-3" : "p-4"}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Ask the Campaign Agent</p>
      {!compact ? (
        <p className="mt-1 text-xs text-kelly-text/55">Routes and recommends only — no autonomous sends or writes.</p>
      ) : null}
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(message);
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask the Campaign Agent…"
          className="min-w-[200px] flex-1 rounded-lg border border-kelly-text/15 px-3 py-2 text-sm"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !message.trim()}
          className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          {pending ? "Thinking…" : "Ask"}
        </button>
      </form>
      <div className="mt-2 flex flex-wrap gap-1">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            className="rounded-full border border-kelly-text/15 px-2 py-0.5 text-[10px] font-semibold text-kelly-navy"
            onClick={() => submit(p)}
            disabled={pending}
          >
            {p}
          </button>
        ))}
      </div>
      {response ? (
        <div className="mt-4 space-y-3 rounded-xl border border-kelly-text/10 bg-kelly-page p-3 text-xs">
          <p className="whitespace-pre-wrap text-kelly-text/80">{response.responseCopy}</p>
          <p className="text-[10px] text-kelly-slate">{response.calmSummary}</p>
          {response.blockedActions.length ? (
            <ul className="rounded-lg border border-red-200/40 bg-red-50/50 p-2 text-red-900">
              {response.blockedActions.map((b) => (
                <li key={b.action}>
                  <strong>{b.action}:</strong> {b.reason}
                </li>
              ))}
            </ul>
          ) : null}
          <ul className="flex flex-wrap gap-2">
            {response.nextLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-bold text-kelly-navy underline"
                  onClick={() => track("next_action_clicked", { href: l.href, label: l.label })}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-kelly-text/45">{response.humanControlNote}</p>
        </div>
      ) : null}
    </section>
  );
}
