"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { OrchestratedDraft, WritingAudience, WritingPurpose, WritingTone } from "@/lib/communications/writing-orchestration/writing-orchestration-types";

type Props = {
  initialDraft: OrchestratedDraft;
  audiences: WritingAudience[];
  purposes: WritingPurpose[];
  tones: WritingTone[];
  massBlocked: boolean;
};

function scoreDraft(subject: string, body: string, purpose: WritingPurpose) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const hasQuestionOrReply = /\?|\breply\b|\brsvp\b|\bjoin\b|\bvolunteer\b|\bopen\b|\bcontact\b/i.test(body);
  const hasSpecificity = /\b\d+\b|\b(today|tomorrow|tonight|this week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(body);
  const subjectGood = subject.trim().length >= 18 && subject.trim().length <= 65;
  const readable = words >= 35 && words <= 350 && paragraphs >= 2;
  const noPlaceholder = !/\b(tbd|todo|lorem|insert|placeholder)\b/i.test(`${subject} ${body}`);
  const crisisSafe = purpose !== "crisis_hold" || /do not send|hold|await|approval/i.test(body);
  const checks = [
    { label: "Subject is scannable", pass: subjectGood },
    { label: "Body length is usable", pass: readable },
    { label: "Clear action or response path", pass: hasQuestionOrReply },
    { label: "Contains concrete specificity", pass: hasSpecificity },
    { label: "No obvious placeholders", pass: noPlaceholder },
    { label: "Crisis hold language preserved", pass: crisisSafe },
  ];
  const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
  return { score, words, checks };
}

export function MessageStudioClient({ initialDraft, audiences, purposes, tones, massBlocked }: Props) {
  const [audience, setAudience] = useState<WritingAudience>("volunteer");
  const [purpose, setPurpose] = useState<WritingPurpose>("welcome");
  const [tone, setTone] = useState<WritingTone>(initialDraft.tone);
  const [subject, setSubject] = useState(initialDraft.subject);
  const [body, setBody] = useState(initialDraft.body);

  const review = useMemo(() => scoreDraft(subject, body, purpose), [subject, body, purpose]);
  const warnings = useMemo(
    () => [
      ...initialDraft.warnings,
      massBlocked ? "Mass send blocked — use ECC with human approval" : "",
      "Oscar reviews the draft here; governed sending still happens in ECC.",
    ].filter(Boolean),
    [initialDraft.warnings, massBlocked],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 font-body text-kelly-text">
      <header className="border-b border-kelly-text/10 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">Oscar Message Studio V3</p>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Write, review, strengthen</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-muted">
          Shape the audience, purpose, and tone; edit freely; then use Oscar's live quality review before the draft enters the governed ECC send path.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs">Audience
              <select className="mt-1 w-full rounded border px-2 py-2" value={audience} onChange={(e) => setAudience(e.target.value as WritingAudience)}>
                {audiences.map((a) => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label className="text-xs">Purpose
              <select className="mt-1 w-full rounded border px-2 py-2" value={purpose} onChange={(e) => setPurpose(e.target.value as WritingPurpose)}>
                {purposes.map((p) => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label className="text-xs">Tone
              <select className="mt-1 w-full rounded border px-2 py-2" value={tone} onChange={(e) => setTone(e.target.value as WritingTone)}>
                {tones.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
            {warnings.map((w) => <p key={w}>{w}</p>)}
          </div>

          <label className="block text-xs font-bold">Subject
            <input className="mt-1 w-full rounded border px-3 py-2 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>

          <label className="block text-xs font-bold">Body
            <textarea className="mt-1 min-h-[320px] w-full rounded border px-3 py-3 text-sm leading-6" value={body} onChange={(e) => setBody(e.target.value)} />
          </label>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button type="button" className="rounded-lg border px-3 py-2 font-bold" onClick={() => { setSubject(initialDraft.subject); setBody(initialDraft.body); setTone(initialDraft.tone); }}>
              Reset draft
            </button>
            <span className="text-kelly-muted">CTA target: {initialDraft.cta}</span>
            <span className="text-kelly-muted">Template: {initialDraft.suggestedTemplateId ?? "custom"}</span>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border-2 border-kelly-navy/20 bg-kelly-page p-4 lg:sticky lg:top-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-subtle">Oscar live review</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-kelly-navy">{review.score}</span>
            <span className="pb-1 text-xs text-kelly-muted">/ 100 · {review.words} words</span>
          </div>
          <p className="mt-1 text-xs text-kelly-muted">Configuration: {audience.replace(/_/g, " ")} · {purpose.replace(/_/g, " ")} · {tone}</p>
          <div className="mt-4 space-y-2">
            {review.checks.map((check) => (
              <div key={check.label} className="flex items-start gap-2 text-xs">
                <span className="font-bold" aria-hidden="true">{check.pass ? "PASS" : "FIX"}</span>
                <span>{check.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t pt-3 text-[11px] text-kelly-muted">
            This is a deterministic preflight, not a prediction of persuasion or voter behavior. Final factual, compliance, strategic, and send review stays human-owned.
          </p>
        </aside>
      </div>

      <p className="text-xs">
        <Link href="/admin/workbench/email-command-center" className="font-bold text-kelly-navy underline">Open ECC for governed send path</Link>
        {" · "}
        <Link href="/admin/communications/intelligence" className="underline">Oscar intelligence dashboard</Link>
      </p>
    </div>
  );
}
