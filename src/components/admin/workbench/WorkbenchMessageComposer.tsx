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
    const trimmed = body.trim();
    if (!trimmed) {
      setErr("Add message text before sending.");
      return;
    }
    if (mode === "SMS" && trimmed.length > 1600) {
      setErr("SMS is very long (over 1600 chars); consider email or split.");
      return;
    }
    const fd = new FormData();
    fd.set("threadId", p.threadId);
    fd.set("body", trimmed);
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
    <div className="border-t border-kelly-text/10 bg-kelly-page/50 p-2">
      {err ? <p className="mb-1 font-body text-xs text-red-800">{err}</p> : null}
      <div className="flex flex-wrap items-center gap-1 border-b border-kelly-text/10 pb-1">
        {p.canSms ? (
          <button
            type="button"
            onClick={() => setMode("SMS")}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
              mode === "SMS" ? "bg-kelly-text text-kelly-page" : "bg-white/60 text-kelly-text/70"
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
              mode === "EMAIL" ? "bg-kelly-text text-kelly-page" : "bg-white/60 text-kelly-text/70"
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
              mode === "GMAIL" ? "bg-kelly-muted text-kelly-page" : "bg-white/60 text-kelly-text/70"
            }`}
            title="Human email via your connected Gmail/Workspace (not for broadcasts)"
          >
            Gmail
          </button>
        ) : null}
        <span className="ml-auto text-[10px] text-kelly-text/50">
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
          className="mb-1 mt-1 w-full border border-kelly-text/15 bg-white px-1.5 py-0.5 font-body text-xs"
        />
      ) : null}
      <textarea
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={mode === "SMS" ? 2000 : 100000}
        placeholder={mode === "SMS" ? "SMS body…" : mode === "GMAIL" ? "Gmail body (human)…" : "SendGrid body…"}
        className="w-full resize-y border border-kelly-text/15 bg-white p-1.5 font-mono text-xs"
        aria-label="Message body"
      />
      {mode === "SMS" ? (
        <p className="mt-0.5 text-[10px] text-kelly-text/45">
          {body.length} / 2000 · long SMS may split into multiple segments
        </p>
      ) : null}
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
          className="rounded border border-kelly-gold/40 bg-kelly-gold px-2 py-0.5 font-body text-xs font-bold text-kelly-navy disabled:opacity-40"
        >
          {pending ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={draft}
          className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 font-body text-xs font-semibold text-kelly-text"
        >
          AI draft
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={rewrite}
          className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 font-body text-xs font-semibold text-kelly-text"
        >
          AI rewrite
        </button>
        {tones.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={pending}
            onClick={() => rewriteWithTone(t.id)}
            className="rounded border border-kelly-text/10 bg-white/80 px-1.5 py-0.5 font-body text-[10px] text-kelly-text/80"
            title="Rewrite with tone"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
