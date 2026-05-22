"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { OrchestratedDraft } from "@/lib/communications/writing-orchestration/writing-orchestration-types";
import type { WritingAudience, WritingPurpose, WritingTone } from "@/lib/communications/writing-orchestration/writing-orchestration-types";

type Props = {
  initialDraft: OrchestratedDraft;
  audiences: WritingAudience[];
  purposes: WritingPurpose[];
  tones: WritingTone[];
  massBlocked: boolean;
};

export function MessageStudioClient({ initialDraft, audiences, purposes, tones, massBlocked }: Props) {
  const [audience, setAudience] = useState<WritingAudience>("volunteer");
  const [purpose, setPurpose] = useState<WritingPurpose>("welcome");
  const [tone, setTone] = useState<WritingTone>(initialDraft.tone);
  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);

  const warnings = useMemo(
    () => [
      ...initialDraft.warnings,
      massBlocked ? "Mass send blocked — use ECC with human approval" : "",
      "Preview only — no send button in Message Studio V1",
    ].filter(Boolean),
    [initialDraft.warnings, massBlocked],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16 font-body text-kelly-text">
      <header className="border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Message Studio V1</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Draft assist</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Select audience and purpose. Edit draft below. Send via ECC after human approval — never from this page.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs">
          Audience
          <select
            className="mt-1 w-full rounded border px-2 py-1"
            value={audience}
            onChange={(e) => setAudience(e.target.value as WritingAudience)}
          >
            {audiences.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          Purpose
          <select
            className="mt-1 w-full rounded border px-2 py-1"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as WritingPurpose)}
          >
            {purposes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          Tone
          <select
            className="mt-1 w-full rounded border px-2 py-1"
            value={tone}
            onChange={(e) => setTone(e.target.value as WritingTone)}
          >
            {tones.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
        {warnings.map((w) => (
          <p key={w}>{w}</p>
        ))}
      </div>

      <label className="block text-xs font-bold">
        Subject
        <input
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </label>

      <label className="block text-xs font-bold">
        Body (editable)
        <textarea
          className="mt-1 min-h-[220px] w-full rounded border px-3 py-2 text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </label>

      <p className="text-xs text-kelly-muted">
        CTA hint: {initialDraft.cta} · Template: {initialDraft.suggestedTemplateId ?? "none"}
      </p>

      <p className="text-xs">
        <Link href="/admin/workbench/email-command-center" className="font-bold text-kelly-navy underline">
          Open ECC for governed send path
        </Link>
        {" · "}
        <Link href="/admin/communications/intelligence" className="underline">
          Intelligence dashboard
        </Link>
      </p>
    </div>
  );
}
