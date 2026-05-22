"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { askCampaignAgentAction } from "@/app/admin/agent-runtime/actions";
import { routeCampaignPaletteQueryAction } from "@/app/admin/dashboard-nav/actions";
import { getPromptsForPath } from "@/lib/agents/runtime/page-aware-prompts";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import type { AgentRuntimeResponse } from "@/lib/agents/runtime/agent-runtime-types";
import type { PaletteQueryResult } from "@/lib/dashboard-orchestration/palette-query-router";
import { useAgentObservation } from "@/components/agents/AgentObservationTracker";
import { useOperatorContext } from "./OperatorContextProvider";

export function GlobalAiCommandPalette({
  role,
  pathname,
  period,
  eventRecordId,
  paletteHints,
}: {
  role: CampaignUserRole | string;
  pathname: string;
  period: string;
  eventRecordId?: string | null;
  paletteHints?: PaletteQueryResult | null;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<AgentRuntimeResponse | null>(null);
  const [localRoute, setLocalRoute] = useState<PaletteQueryResult | null>(null);
  const [pending, startTransition] = useTransition();
  const { track } = useAgentObservation();
  const { session, recordQuery } = useOperatorContext();
  const prompts = getPromptsForPath(pathname);

  const toggle = useCallback(() => {
    setOpen((o) => {
      const next = !o;
      if (next) track("ai_command_palette_used", { task: "opened" });
      return next;
    });
  }, [track]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const submit = (text: string) => {
    const q = text.trim();
    if (!q) return;
    recordQuery(q);
    track("ai_command_palette_used", { task: q.slice(0, 80) });

    setMessage(q);
    setLocalRoute(null);
    startTransition(async () => {
      const routed = await routeCampaignPaletteQueryAction(q, period);
      if (routed?.matched) {
        setLocalRoute(routed);
        setResponse(null);
        return;
      }

      const res = await askCampaignAgentAction({
        message: q,
        pathname,
        role: role as CampaignUserRole,
        period,
        eventRecordId,
      });
      if (res.ok) {
        setResponse(res.response);
        track("navigation_shortcut_used", { actionId: "agent_runtime", task: res.response.interpretedIntent.task });
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-kelly-navy text-lg font-bold text-white shadow-lg transition hover:scale-105"
        aria-label="Open AI command palette (Ctrl+K)"
        title="Campaign OS command palette (Ctrl+K)"
      >
        AI
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-kelly-navy/40 p-4 pt-[10vh] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="AI command palette"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Campaign OS command palette</p>
            <p className="mt-1 text-xs text-kelly-text/55">
              Plain language → routes, blockers, summaries. No autonomous sends or writes.
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                submit(message);
              }}
            >
              <input
                autoFocus
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Try "Close March reimbursement"…'
                className="min-w-0 flex-1 rounded-lg border border-kelly-text/15 px-3 py-2.5 text-sm"
                disabled={pending}
              />
              <button
                type="submit"
                disabled={pending || !message.trim()}
                className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {pending ? "…" : "Go"}
              </button>
            </form>
            <div className="mt-2 flex flex-wrap gap-1">
              {prompts.slice(0, 4).map((p) => (
                <button
                  key={p}
                  type="button"
                  className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                  onClick={() => submit(p)}
                  disabled={pending}
                >
                  {p}
                </button>
              ))}
            </div>
            {session.commandPaletteHistory.length > 0 ? (
              <p className="mt-3 text-[10px] text-kelly-text/45">
                Recent: {session.commandPaletteHistory.slice(0, 3).join(" · ")}
              </p>
            ) : null}

            {localRoute?.matched ? (
              <PaletteResultPanel result={localRoute} onClose={() => setLocalRoute(null)} track={track} />
            ) : null}
            {response ? (
              <div className="mt-4 space-y-2 rounded-xl border bg-kelly-wash p-3 text-xs">
                <p className="whitespace-pre-wrap">{response.responseCopy}</p>
                <p className="text-[10px] text-kelly-slate">{response.calmSummary}</p>
                <ul className="flex flex-wrap gap-2">
                  {response.nextLinks.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="font-bold text-kelly-navy underline" onClick={() => setOpen(false)}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function PaletteResultPanel({
  result,
  onClose,
  track,
}: {
  result: PaletteQueryResult;
  onClose: () => void;
  track: (event: string, meta?: Record<string, string | number | boolean | null>) => void;
}) {
  return (
    <div className="mt-4 space-y-2 rounded-xl border border-kelly-navy/20 bg-kelly-navy/[0.03] p-3 text-xs">
      <p className="font-bold text-kelly-navy">{result.summary}</p>
      {result.readinessHint ? <p className="text-kelly-slate">{result.readinessHint}</p> : null}
      {result.blockers.length > 0 ? (
        <ul className="rounded-lg border border-amber-200/50 bg-amber-50/80 p-2 text-amber-950">
          {result.blockers.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
      ) : null}
      <ul className="flex flex-wrap gap-2">
        {result.links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="font-bold text-kelly-navy underline"
              onClick={() => {
                track("workflow_guidance_followed", {
                  actionId: l.href.slice(0, 48),
                  task: l.label.slice(0, 80),
                });
                onClose();
              }}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
