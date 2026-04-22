"use client";

import { useState, useTransition } from "react";
import {
  draftMessageAiAction,
  rewriteMessageAiAction,
  sendEmailFromWorkbenchAction,
  sendGmailFromWorkbenchAction,
  sendSmsFromWorkbenchAction,
} from "@/app/admin/workbench-comms-actions";
import type { AiRewriteTone } from "@/lib/comms/ai";

const tones: { id: AiRewriteTone; label: string }[] = [
  { id: "urgent", label: "Urgent" },
  { id: "warm", label: "Warm" },
  { id: "concise", label: "Concise" },
  { id: "motivational", label: "Motivational" },
  { id: "reminder", label: "Reminder" },
];

type Props = {
  threadId: string;
  canSms: boolean;
  canEmail: boolean;
  defaultMode: "SMS" | "EMAIL";
  initialSubject: string;
  /** When set, outbound SMS is disabled (e.g. STOP). */
  smsBlocked?: string | null;
  /** When set, outbound email is disabled (e.g. unsubscribe). */
  emailBlocked?: string | null;
  /** Staff `StaffGmailAccount` present for `ADMIN_ACTOR_USER_EMAIL` user. */
  gmailConnected?: boolean;
  gmailSendAs?: string | null;
  /** Prior GMAIL outbound row id to improve threading on next Gmail send. */
  gmailReplyAnchorId?: string | null;
};

export function WorkbenchMessageComposer(p: Props) {
  const [mode, setMode] = useState<"SMS" | "EMAIL" | "GMAIL">(
    p.defaultMode === "EMAIL" && p.canEmail ? "EMAIL" : p.canSms ? "SMS" : "EMAIL"
  );
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState(p.initialSubject);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function send() {
    setErr(null);
    const fd = new FormData();
    fd.set("threadId", p.threadId);
    fd.set("body", body);
    if (mode === "EMAIL") {
      fd.set("subject", subject);
      start(async () => {
        const r = await sendEmailFromWorkbenchAction(fd);
        if (!r.ok) setErr(r.error);
        else setBody("");
      });
    } else if (mode === "GMAIL") {
      fd.set("subject", subject);
      if (p.gmailReplyAnchorId) fd.set("replyToMessageId", p.gmailReplyAnchorId);
      start(async () => {
        const r = await sendGmailFromWorkbenchAction(fd);
        if (!r.ok) setErr(r.error);
        else setBody("");
      });
    } else {
      start(async () => {
        const r = await sendSmsFromWorkbenchAction(fd);
        if (!r.ok) setErr(r.error);
        else setBody("");
      });
    }
  }

  function draft() {
    setErr(null);
    const fd = new FormData();
    fd.set("threadId", p.threadId);
    fd.set("channel", mode === "GMAIL" ? "EMAIL" : mode);
    start(async () => {
      const r = await draftMessageAiAction(fd);
      if (!r.ok) {
        setErr("error" in r ? r.error : "Failed");
        return;
      }
      if ("text" in r) setBody(r.text);
    });
  }

  function rewrite() {
    setErr(null);
    if (!body.trim()) {
      setErr("Add message text to rewrite first.");
      return;
    }
    const fd = new FormData();
    fd.set("body", body);
    fd.set("tone", "concise");
    start(async () => {
      const r = await rewriteMessageAiAction(fd);
      if (!r.ok) {
        setErr("error" in r ? r.error : "Failed");
        return;
      }
      if ("text" in r) setBody(r.text);
    });
  }

  function rewriteWithTone(tone: AiRewriteTone) {
    setErr(null);
    if (!body.trim()) {
      setErr("Add message text to rewrite first.");
      return;
    }
    const fd = new FormData();
    fd.set("body", body);
    fd.set("tone", tone);
    start(async () => {
      const r = await rewriteMessageAiAction(fd);
      if (!r.ok) {
        setErr("error" in r ? r.error : "Failed");
        return;
      }
      if ("text" in r) setBody(r.text);
    });
  }

  return (
    <div className="border-t border-deep-soil/10 bg-cream-canvas/50 p-2">
      {err ? <p className="mb-1 font-body text-xs text-red-800">{err}</p> : null}
      <div className="flex flex-wrap items-center gap-1 border-b border-deep-soil/10 pb-1">
        {p.canSms ? (
          <button
            type="button"
            onClick={() => setMode("SMS")}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
              mode === "SMS" ? "bg-deep-soil text-cream-canvas" : "bg-white/60 text-deep-soil/70"
            }`}
          >
            SMS
          </button>
        ) : null}
        {p.canEmail ? (
          <button
            type="button"
            onClick={() => setMode("EMAIL")}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
              mode === "EMAIL" ? "bg-deep-soil text-cream-canvas" : "bg-white/60 text-deep-soil/70"
            }`}
          >
            SendGrid
          </button>
        ) : null}
        {p.canEmail && p.gmailConnected ? (
          <button
            type="button"
            onClick={() => setMode("GMAIL")}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
              mode === "GMAIL" ? "bg-washed-denim text-cream-canvas" : "bg-white/60 text-deep-soil/70"
            }`}
            title="Human email via your connected Gmail/Workspace (not for broadcasts)"
          >
            Gmail
          </button>
        ) : null}
        <span className="ml-auto text-[10px] text-deep-soil/50">
          {mode === "SMS" && !p.canSms ? "Add phone to thread" : null}
          {(mode === "EMAIL" || mode === "GMAIL") && !p.canEmail ? "Add email to thread" : null}
          {mode === "SMS" && p.smsBlocked ? ` · ${p.smsBlocked}` : null}
          {(mode === "EMAIL" || mode === "GMAIL") && p.emailBlocked ? ` · ${p.emailBlocked}` : null}
          {mode === "GMAIL" && p.gmailSendAs ? ` · from ${p.gmailSendAs}` : null}
        </span>
      </div>
      {mode === "EMAIL" || mode === "GMAIL" ? (
        <input
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="mb-1 mt-1 w-full border border-deep-soil/15 bg-white px-1.5 py-0.5 font-body text-xs"
        />
      ) : null}
      <textarea
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder={mode === "SMS" ? "SMS body…" : mode === "GMAIL" ? "Gmail body (human)…" : "SendGrid body…"}
        className="w-full resize-y border border-deep-soil/15 bg-white p-1.5 font-mono text-xs"
      />
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={
            pending ||
            (mode === "SMS" && (!p.canSms || Boolean(p.smsBlocked))) ||
            ((mode === "EMAIL" || mode === "GMAIL") && (!p.canEmail || Boolean(p.emailBlocked))) ||
            (mode === "GMAIL" && !p.gmailConnected)
          }
          onClick={send}
          className="rounded border border-red-dirt/30 bg-red-dirt px-2 py-0.5 font-body text-xs font-bold text-cream-canvas disabled:opacity-40"
        >
          {pending ? "…" : "Send"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={draft}
          className="rounded border border-deep-soil/20 bg-white px-2 py-0.5 font-body text-xs font-semibold text-deep-soil"
        >
          AI draft
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={rewrite}
          className="rounded border border-deep-soil/20 bg-white px-2 py-0.5 font-body text-xs font-semibold text-deep-soil"
        >
          AI rewrite
        </button>
        {tones.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={pending}
            onClick={() => rewriteWithTone(t.id)}
            className="rounded border border-deep-soil/10 bg-white/80 px-1.5 py-0.5 font-body text-[10px] text-deep-soil/80"
            title="Rewrite with tone"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
