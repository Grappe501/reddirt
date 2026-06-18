"use client";

import { useCallback, useEffect, useState } from "react";
import type { ForumTranscriptLabRecord } from "@/lib/intelligence/v4/forumTranscriptLab";

type Props = {
  initialRecord: ForumTranscriptLabRecord;
};

export function ForumTranscriptLabClient({ initialRecord }: Props) {
  const [record, setRecord] = useState(initialRecord);
  const [title, setTitle] = useState(initialRecord.title);
  const [eventLabel, setEventLabel] = useState(initialRecord.eventLabel);
  const [pasteText, setPasteText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/intelligence/forum-transcript-lab");
    const data = (await res.json()) as { ok: boolean; record?: ForumTranscriptLabRecord };
    if (data.ok && data.record) setRecord(data.record);
  }, []);

  async function handleUpload(file: File) {
    setBusy("upload");
    setError(null);
    const form = new FormData();
    form.set("file", file);
    form.set("title", title);
    form.set("eventLabel", eventLabel);
    try {
      const res = await fetch("/api/admin/intelligence/forum-transcript-lab/upload", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { ok: boolean; record?: ForumTranscriptLabRecord; error?: string; note?: string };
      if (!data.ok) throw new Error(data.error ?? "Upload failed");
      if (data.record) setRecord(data.record);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function handlePaste() {
    setBusy("paste");
    setError(null);
    try {
      const res = await fetch("/api/admin/intelligence/forum-transcript-lab/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "paste",
          title,
          eventLabel,
          transcriptText: pasteText,
        }),
      });
      const data = (await res.json()) as { ok: boolean; record?: ForumTranscriptLabRecord; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Paste failed");
      if (data.record) setRecord(data.record);
      setPasteText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleAnalyze() {
    setBusy("analyze");
    setError(null);
    try {
      const res = await fetch("/api/admin/intelligence/forum-transcript-lab/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze" }),
      });
      const data = (await res.json()) as { ok: boolean; record?: ForumTranscriptLabRecord; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Analysis failed");
      if (data.record) setRecord(data.record);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const analysis = record.analysis;
  const hasTranscript = record.transcriptText.length >= 50;

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-950">{error}</div>
      ) : null}

      <section className="rounded-xl border border-kelly-gold/30 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">1 · Upload forum video</h2>
        <p className="mt-1 text-sm text-kelly-muted">
          Three-candidate forum with Kelly, Hammer, and Pakko. Video saves to owned media; Whisper transcribes when{" "}
          <code className="text-xs">OPENAI_API_KEY</code> is set.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold text-kelly-subtle">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded border border-kelly-text/15 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-bold text-kelly-subtle">
            Event label
            <input
              value={eventLabel}
              onChange={(e) => setEventLabel(e.target.value)}
              className="mt-1 w-full rounded border border-kelly-text/15 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-xs font-bold uppercase text-kelly-subtle">Video file (mp4, webm, mov, mp3)</span>
          <input
            type="file"
            accept="video/*,audio/*"
            disabled={busy !== null}
            className="mt-2 block w-full text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleUpload(f);
            }}
          />
        </label>
        {busy === "upload" ? <p className="mt-2 text-sm text-indigo-800">Uploading & transcribing…</p> : null}
        {record.ownedMediaAssetId ? (
          <p className="mt-2 text-xs text-emerald-800">
            Media saved ·{" "}
            <a
              href={`/api/owned-campaign-media/${record.ownedMediaAssetId}/preview`}
              className="font-bold underline"
              target="_blank"
              rel="noreferrer"
            >
              Preview
            </a>
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">2 · Or paste transcript</h2>
        <p className="mt-1 text-sm text-kelly-muted">If Whisper is unavailable, paste the full forum transcript here.</p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={8}
          placeholder="Paste forum transcript…"
          className="mt-3 w-full rounded border border-kelly-text/15 px-3 py-2 font-mono text-xs"
        />
        <button
          type="button"
          disabled={busy !== null || pasteText.length < 50}
          onClick={() => void handlePaste()}
          className="mt-3 rounded-lg bg-indigo-700 px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-50"
        >
          Save transcript
        </button>
      </section>

      <section className="rounded-xl border border-violet-200 bg-violet-50/30 p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">3 · AI analysis → debate plan</h2>
        <p className="mt-1 text-sm text-kelly-muted">
          Breaks down Hammer/Pakko themes, predicts moderator questions, and builds capitalize moves for Kelly.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!hasTranscript || busy !== null}
            onClick={() => void handleAnalyze()}
            className="rounded-lg bg-kelly-text px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-kelly-gold disabled:opacity-50"
          >
            {busy === "analyze" ? "Analyzing…" : "Run AI analysis"}
          </button>
          <span className="text-xs text-kelly-muted">
            Status: {record.analysisStatus}
            {record.transcriptText.length > 0 ? ` · ${record.transcriptText.length.toLocaleString()} chars` : ""}
          </span>
        </div>
        {record.analysisError ? (
          <p className="mt-2 text-sm text-rose-800">{record.analysisError}</p>
        ) : null}
      </section>

      {hasTranscript && !analysis ? (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-5">
          <h3 className="text-xs font-bold uppercase text-kelly-subtle">Transcript preview</h3>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-kelly-muted">
            {record.transcriptText.slice(0, 4000)}
            {record.transcriptText.length > 4000 ? "…" : ""}
          </pre>
        </section>
      ) : null}

      {analysis ? (
        <section className="space-y-6">
          <article className="rounded-xl border-2 border-kelly-gold/40 bg-kelly-text p-5 text-kelly-inverse">
            <h2 className="font-heading text-xl font-bold text-kelly-gold">Executive summary</h2>
            <p className="mt-3 text-sm leading-relaxed">{analysis.summary}</p>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            <AnalysisList title="Hammer themes" items={analysis.hammerThemes} tone="rose" />
            <AnalysisList title="Pakko themes" items={analysis.pakkoThemes} tone="amber" />
            <AnalysisList title="Kelly opportunities" items={analysis.kellyOpportunities} tone="emerald" />
            <AnalysisList title="Predicted debate questions" items={analysis.predictedDebateQuestions} tone="indigo" />
            <AnalysisList title="Watch for tells" items={analysis.watchForTells} tone="violet" />
            <AnalysisList title="Newspaper angles" items={analysis.newspaperAngles} tone="sky" />
            <AnalysisList title="Claims gate notes" items={analysis.claimsGateNotes} tone="rose" />
          </div>

          <article className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
            <h3 className="font-heading text-lg font-bold text-emerald-950">Capitalize moves — when X, say Y</h3>
            <div className="mt-4 space-y-4">
              {analysis.capitalizeMoves.map((move, i) => (
                <div key={`${move.trigger.slice(0, 24)}-${i}`} className="rounded-lg border border-emerald-200 bg-white p-4 text-sm">
                  <p className="font-bold text-rose-950">Trigger: {move.trigger}</p>
                  <p className="mt-2 font-bold text-kelly-navy">Kelly: {move.kellyLine}</p>
                  <p className="mt-1 text-xs text-kelly-muted">{move.why}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}

function AnalysisList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "rose" | "amber" | "emerald" | "indigo" | "violet" | "sky";
}) {
  const border = {
    rose: "border-rose-200",
    amber: "border-amber-200",
    emerald: "border-emerald-200",
    indigo: "border-indigo-200",
    violet: "border-violet-200",
    sky: "border-sky-200",
  }[tone];

  if (!items.length) return null;

  return (
    <article className={`rounded-xl border ${border} bg-white p-4`}>
      <h3 className="text-xs font-bold uppercase text-kelly-subtle">{title}</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-kelly-text">
        {items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
