"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  EP_FORUM_LAB_ANALYSIS_HREF,
  EP_FORUM_LAB_CAPITALIZE_MOVES_HREF,
  EP_FORUM_LAB_DEEP_ANALYSIS_HREF,
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  EP_FORUM_LAB_INTEGRATION_HREF,
  EP_FORUM_LAB_PREDICTED_SCRIPT_HREF,
  epForumLabAnalysisCategoryHref,
  epForumLabAnalysisItemHref,
  epForumLabCapitalizeMoveHref,
  epForumLabDeepAnalysisLessonHref,
  epForumLabIntegrationDayHref,
  epForumLabPredictedScriptPhaseHref,
} from "@/lib/election-plan/debate-prep-links";
import {
  forumAnalysisCategoryIdFromTitle,
  resolveForumAnalysisLessonFromBullet,
  type ForumAnalysisCategoryId,
} from "@/lib/election-plan/forumLabAnalysisDrillDown";
import { resolveCapitalizeMoveFromTrigger } from "@/lib/election-plan/forumLabCapitalizeMovesDrillDown";
import { resolveDeepProfessorQuoteLesson } from "@/lib/election-plan/forumLabDeepAnalysisDrillDown";
import { resolvePredictedScriptLessonFromPhase } from "@/lib/election-plan/forumLabPredictedScriptDrillDown";
import type { ForumDeepAnalysis, ForumTranscriptLabRecord } from "@/lib/intelligence/v4/forumTranscriptLab";

type Props = {
  initialRecord: ForumTranscriptLabRecord;
  openaiConfigured?: boolean;
  /** API root without trailing slash — defaults to admin intelligence route. */
  apiBase?: string;
  /** When election-plan, 7-day integration cards link to drill-down routes. */
  surface?: "admin" | "election-plan";
};

const DEFAULT_FORUM_LAB_API = "/api/admin/intelligence/forum-transcript-lab";

export function ForumTranscriptLabClient({
  initialRecord,
  openaiConfigured = false,
  apiBase = DEFAULT_FORUM_LAB_API,
  surface = "admin",
}: Props) {
  const [record, setRecord] = useState(initialRecord);
  const [title, setTitle] = useState(initialRecord.title);
  const [eventLabel, setEventLabel] = useState(initialRecord.eventLabel);
  const [pasteText, setPasteText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(apiBase);
    const data = (await res.json()) as { ok: boolean; record?: ForumTranscriptLabRecord };
    if (data.ok && data.record) setRecord(data.record);
  }, [apiBase]);

  async function handleUpload(file: File) {
    setBusy("upload");
    setError(null);
    const form = new FormData();
    form.set("file", file);
    form.set("title", title);
    form.set("eventLabel", eventLabel);
    try {
      const res = await fetch(`${apiBase}/upload`, {
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
      const res = await fetch(`${apiBase}/upload`, {
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

  async function handleYoutubeIngest() {
    setBusy("youtube");
    setError(null);
    try {
      const res1 = await fetch(`${apiBase}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ingest_youtube",
          url: "https://youtu.be/Hl_n-A9aL1s",
          runDiarization: false,
        }),
      });
      const data1 = (await res1.json()) as {
        ok: boolean;
        record?: ForumTranscriptLabRecord;
        error?: string;
        warnings?: string[];
        note?: string;
      };
      if (!data1.ok) throw new Error(data1.error ?? "YouTube fetch failed");
      if (data1.record) setRecord(data1.record);

      if (!openaiConfigured) {
        setError("Captions saved — set OPENAI_API_KEY to label speakers and analyze.");
        return;
      }

      setBusy("diarize");
      const res2 = await fetch(`${apiBase}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "diarize" }),
      });
      const data2 = (await res2.json()) as { ok: boolean; record?: ForumTranscriptLabRecord; error?: string };
      if (!data2.ok) throw new Error(data2.error ?? "Speaker labeling failed");
      if (data2.record) setRecord(data2.record);
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
      const res = await fetch(`${apiBase}/upload`, {
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

  async function handleAnalyzeDeep() {
    setBusy("analyze_deep");
    setError(null);
    try {
      const res = await fetch(`${apiBase}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze_deep" }),
      });
      const data = (await res.json()) as { ok: boolean; record?: ForumTranscriptLabRecord; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Deep analysis failed");
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
  const deepAnalysis = record.deepAnalysis;
  const hasTranscript = record.transcriptText.length >= 50;

  return (
    <div className="space-y-8">
      <div
        className={`rounded-lg border px-4 py-3 text-sm ${
          openaiConfigured
            ? "border-emerald-300 bg-emerald-50 text-emerald-950"
            : "border-amber-300 bg-amber-50 text-amber-950"
        }`}
      >
        {openaiConfigured ? (
          <>
            <span className="font-bold">OpenAI connected.</span> Whisper transcription and v1/v2 analysis will run on
            upload. If the dev server was started before you added the key, restart it once.
          </>
        ) : (
          <>
            <span className="font-bold">OpenAI not detected in this server process.</span> Add{" "}
            <code className="text-xs">OPENAI_API_KEY</code> to <code className="text-xs">.env.local</code>, restart the
            dev server, or paste the transcript manually.
          </>
        )}
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-950">{error}</div>
      ) : null}

      <section className="rounded-xl border-2 border-kelly-gold/40 bg-kelly-gold/5 p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">0 · ACCA forum on YouTube</h2>
        <p className="mt-1 text-sm text-kelly-muted">
          Fetch captions from the three-candidate Mountain View panel, then AI labels Kelly, Hammer, Pakko, and the
          moderator so analysis can attribute quotes for debate prep.
        </p>
        <p className="mt-2 text-xs text-kelly-subtle">
          <a href="https://youtu.be/Hl_n-A9aL1s" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            youtu.be/Hl_n-A9aL1s
          </a>
          {" · "}
          Best quality: run <code className="text-[10px]">npm run forum:ingest-youtube-acca</code> locally (yt-dlp + Whisper).
        </p>
        <button
          type="button"
          disabled={busy !== null || !openaiConfigured}
          onClick={() => void handleYoutubeIngest()}
          className="mt-4 rounded-lg bg-kelly-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy === "youtube"
            ? "Fetching YouTube captions…"
            : busy === "diarize"
              ? "Labeling speakers…"
              : "Transcribe & label speakers"}
        </button>
      </section>

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
        ) : record.localVideoRelativePath ? (
          <p className="mt-2 text-xs text-emerald-800">
            Local recording on disk · {record.videoSizeBytes ? `${(record.videoSizeBytes / 1e9).toFixed(1)} GB` : "see player above"}
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
            {busy === "analyze" ? "Analyzing…" : "Run AI analysis (v1)"}
          </button>
          <button
            type="button"
            disabled={!hasTranscript || busy !== null}
            onClick={() => void handleAnalyzeDeep()}
            className="rounded-lg border-2 border-violet-700 bg-violet-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
          >
            {busy === "analyze_deep" ? "Deep analyzing…" : "Run deep analysis (v2)"}
          </button>
          <span className="text-xs text-kelly-muted">
            v1: {record.analysisStatus} · v2: {record.deepAnalysisStatus ?? "not_started"}
            {record.transcriptText.length > 0 ? ` · ${record.transcriptText.length.toLocaleString()} chars` : ""}
          </span>
        </div>
        {record.analysisError ? (
          <p className="mt-2 text-sm text-rose-800">v1: {record.analysisError}</p>
        ) : null}
        {record.deepAnalysisError ? (
          <p className="mt-2 text-sm text-rose-800">v2: {record.deepAnalysisError}</p>
        ) : null}
        <p className="mt-2 text-xs text-kelly-muted">
          v2 feeds Day 4–5 drills: speaker profiles, verbatim quotes, mock moderator script, 7-day integration map.
        </p>
      </section>

      {hasTranscript ? (
        <section className="rounded-xl border border-kelly-text/10 bg-white p-5">
          <h3 className="text-xs font-bold uppercase text-kelly-subtle">Transcript preview</h3>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-kelly-muted">
            {record.transcriptText.slice(0, 8000)}
            {record.transcriptText.length > 8000 ? "…" : ""}
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
            <AnalysisList
              title="Hammer themes"
              items={analysis.hammerThemes}
              tone="rose"
              categoryId="hammer-themes"
              surface={surface}
            />
            <AnalysisList
              title="Pakko themes"
              items={analysis.pakkoThemes}
              tone="amber"
              categoryId="pakko-themes"
              surface={surface}
            />
            <AnalysisList
              title="Kelly opportunities"
              items={analysis.kellyOpportunities}
              tone="emerald"
              categoryId="kelly-opportunities"
              surface={surface}
            />
            <AnalysisList
              title="Predicted debate questions"
              items={analysis.predictedDebateQuestions}
              tone="indigo"
              categoryId="predicted-debate-questions"
              surface={surface}
            />
            <AnalysisList
              title="Watch for tells"
              items={analysis.watchForTells}
              tone="violet"
              categoryId="watch-for-tells"
              surface={surface}
            />
            <AnalysisList
              title="Newspaper angles"
              items={analysis.newspaperAngles}
              tone="sky"
              categoryId="newspaper-angles"
              surface={surface}
            />
            <AnalysisList
              title="Claims gate notes"
              items={analysis.claimsGateNotes}
              tone="rose"
              categoryId="claims-gate-notes"
              surface={surface}
            />
          </div>

          <article className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="font-heading text-lg font-bold text-emerald-950">Capitalize moves — when X, say Y</h3>
              {surface === "election-plan" ? (
                <Link
                  href={EP_FORUM_LAB_CAPITALIZE_MOVES_HREF}
                  className="rounded-full border border-emerald-700 px-3 py-1 text-xs font-bold text-emerald-900 hover:bg-white"
                >
                  Full strategy hub →
                </Link>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-kelly-muted">
              {surface === "election-plan"
                ? "Where the debate is won in viewers' eyes — each trigger drills down to psychology, optional phrasing, and phase guidance."
                : "Rehearsed agree-add pivots from ACCA forum analysis."}
            </p>
            <div className="mt-4 space-y-4">
              {analysis.capitalizeMoves.map((move, i) => {
                const lesson = surface === "election-plan" ? resolveCapitalizeMoveFromTrigger(move.trigger) : undefined;
                const cardBody = (
                  <>
                    <p className="font-bold text-rose-950">Trigger: {move.trigger}</p>
                    <p className="mt-2 font-bold text-kelly-navy">Kelly: {move.kellyLine}</p>
                    <p className="mt-1 text-xs text-kelly-muted">{move.why}</p>
                    {lesson ? (
                      <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                        Strategy, psychology & phrasing →
                      </p>
                    ) : null}
                  </>
                );
                if (lesson) {
                  return (
                    <Link
                      key={`${move.trigger.slice(0, 24)}-${i}`}
                      href={epForumLabCapitalizeMoveHref(lesson.id)}
                      className="block rounded-lg border border-emerald-200 bg-white p-4 text-sm transition hover:border-emerald-500 hover:shadow-sm"
                    >
                      {cardBody}
                    </Link>
                  );
                }
                return (
                  <div
                    key={`${move.trigger.slice(0, 24)}-${i}`}
                    className="rounded-lg border border-emerald-200 bg-white p-4 text-sm"
                  >
                    {cardBody}
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      ) : null}

      {deepAnalysis ? <DeepAnalysisSection deep={deepAnalysis} surface={surface} /> : null}
    </div>
  );
}

function DeepAnalysisSection({
  deep,
  surface,
}: {
  deep: ForumDeepAnalysis;
  surface: "admin" | "election-plan";
}) {
  const profileLessonId = { hammer: "profile-hammer", pakko: "profile-pakko", kelly: "profile-kelly" } as const;

  return (
    <section className="space-y-6">
      <article className="rounded-xl border-2 border-violet-500/40 bg-violet-950 p-5 text-violet-50">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-heading text-xl font-bold text-violet-200">Deep analysis v2 — executive brief</h2>
          {surface === "election-plan" ? (
            <Link
              href={epForumLabDeepAnalysisLessonHref("executive-brief")}
              className="rounded-full border border-violet-300 px-3 py-1 text-xs font-bold text-violet-100 hover:bg-violet-900"
            >
              Professor study →
            </Link>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed">{deep.executiveBrief}</p>
        {surface === "election-plan" ? (
          <Link
            href={EP_FORUM_LAB_DEEP_ANALYSIS_HREF}
            className="mt-3 inline-block text-xs font-bold text-violet-200 underline"
          >
            Deep analysis v2 hub — profiles & quotes →
          </Link>
        ) : null}
      </article>

      <div className="grid gap-4 lg:grid-cols-3">
        {(["hammer", "pakko", "kelly"] as const).map((speaker) => {
          const profile = deep.speakerProfiles[speaker];
          const cardBody = (
            <>
              <p className="mt-2 text-kelly-muted">{profile.rhetoricalStyle}</p>
              {profile.favoritePhrases.length ? (
                <p className="mt-2 text-xs">
                  <span className="font-bold">Phrases:</span> {profile.favoritePhrases.join(" · ")}
                </p>
              ) : null}
              {profile.weakUnderPressure ? (
                <p className="mt-2 text-xs text-rose-900">
                  <span className="font-bold">Weak under pressure:</span> {profile.weakUnderPressure}
                </p>
              ) : null}
              {surface === "election-plan" ? (
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-kelly-navy">
                  Rhetoric forecast & strategy →
                </p>
              ) : null}
            </>
          );
          if (surface === "election-plan") {
            return (
              <Link
                key={speaker}
                href={epForumLabDeepAnalysisLessonHref(profileLessonId[speaker])}
                className="block rounded-xl border border-kelly-text/10 bg-white p-4 text-sm transition hover:border-violet-400 hover:shadow-sm"
              >
                <h3 className="text-xs font-bold uppercase text-kelly-subtle">{speaker} profile</h3>
                {cardBody}
              </Link>
            );
          }
          return (
            <article key={speaker} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
              <h3 className="text-xs font-bold uppercase text-kelly-subtle">{speaker} profile</h3>
              {cardBody}
            </article>
          );
        })}
      </div>

      {deep.verbatimQuotes.length > 0 ? (
        <article className="rounded-xl border border-amber-200 bg-amber-50/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-bold text-amber-950">Verbatim quotes (claims-gated)</h3>
            {surface === "election-plan" ? (
              <Link
                href={EP_FORUM_LAB_DEEP_ANALYSIS_HREF}
                className="rounded-full border border-amber-700 px-3 py-1 text-xs font-bold text-amber-900 hover:bg-white"
              >
                All quote lessons →
              </Link>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            {deep.verbatimQuotes.map((q, i) => {
              const lesson = surface === "election-plan" ? resolveDeepProfessorQuoteLesson(q.quote) : undefined;
              const cardBody = (
                <>
                  <p className="font-bold text-kelly-navy">
                    {q.speaker} · <span className="text-xs uppercase">{q.claimsGate}</span>
                  </p>
                  <p className="mt-1 italic">&ldquo;{q.quote}&rdquo;</p>
                  <p className="mt-1 text-xs text-kelly-muted">Stage use: {q.stageUse}</p>
                  {lesson ? (
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                      Professor breakdown →
                    </p>
                  ) : null}
                </>
              );
              if (lesson) {
                return (
                  <Link
                    key={`${q.quote.slice(0, 24)}-${i}`}
                    href={epForumLabDeepAnalysisLessonHref(lesson.id)}
                    className="block rounded-lg border border-amber-200 bg-white p-3 text-sm transition hover:border-amber-500 hover:shadow-sm"
                  >
                    {cardBody}
                  </Link>
                );
              }
              return (
                <div key={`${q.quote.slice(0, 24)}-${i}`} className="rounded-lg border border-amber-200 bg-white p-3 text-sm">
                  {cardBody}
                </div>
              );
            })}
          </div>
        </article>
      ) : null}

      {deep.predictedDebateScript.length > 0 ? (
        <article className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-bold text-indigo-950">Predicted debate script</h3>
            {surface === "election-plan" ? (
              <Link
                href={EP_FORUM_LAB_PREDICTED_SCRIPT_HREF}
                className="rounded-full border border-indigo-700 px-3 py-1 text-xs font-bold text-indigo-900 hover:bg-white"
              >
                Script professor hub →
              </Link>
            ) : null}
          </div>
          <div className="mt-4 space-y-4">
            {deep.predictedDebateScript.map((beat, i) => {
              const lesson =
                surface === "election-plan" ? resolvePredictedScriptLessonFromPhase(beat.phase) : undefined;
              const cardBody = (
                <>
                  <p className="font-bold uppercase text-indigo-900">{beat.phase}</p>
                  {beat.moderatorQuestion ? (
                    <p className="mt-2 text-kelly-muted">Q: {beat.moderatorQuestion}</p>
                  ) : null}
                  <p className="mt-1 text-rose-900">Hammer: {beat.hammerLikely}</p>
                  <p className="mt-1 text-amber-900">Pakko: {beat.pakkoLikely}</p>
                  <p className="mt-2 font-bold text-emerald-900">Kelly best: {beat.kellyBest}</p>
                  <p className="text-xs text-rose-800">Avoid: {beat.kellyAvoid}</p>
                  {lesson ? (
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-indigo-800">
                      Mock-moderator professor page →
                    </p>
                  ) : null}
                </>
              );
              if (lesson) {
                return (
                  <Link
                    key={`${beat.phase}-${i}`}
                    href={epForumLabPredictedScriptPhaseHref(lesson.id)}
                    className="block rounded-lg border border-indigo-200 bg-white p-4 text-sm transition hover:border-indigo-500 hover:shadow-sm"
                  >
                    {cardBody}
                  </Link>
                );
              }
              return (
                <div key={`${beat.phase}-${i}`} className="rounded-lg border border-indigo-200 bg-white p-4 text-sm">
                  {cardBody}
                </div>
              );
            })}
          </div>
        </article>
      ) : null}

      {deep.sevenDayIntegration.length > 0 ? (
        <article className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-bold text-emerald-950">7-day integration map</h3>
            {surface === "election-plan" ? (
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <Link
                  href={EP_FORUM_LAB_INTEGRATION_HREF}
                  className="rounded-full border border-emerald-700 px-3 py-1 text-emerald-900 hover:bg-white"
                >
                  Integration hub →
                </Link>
                <Link
                  href={EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF}
                  className="rounded-full border border-emerald-700 px-3 py-1 text-emerald-900 hover:bg-white"
                >
                  Election law study →
                </Link>
                <Link
                  href={EP_FORUM_LAB_ANALYSIS_HREF}
                  className="rounded-full border border-emerald-700 px-3 py-1 text-emerald-900 hover:bg-white"
                >
                  Analysis lessons →
                </Link>
                <Link
                  href={EP_FORUM_LAB_CAPITALIZE_MOVES_HREF}
                  className="rounded-full border border-emerald-700 px-3 py-1 text-emerald-900 hover:bg-white"
                >
                  Capitalize moves →
                </Link>
                <Link
                  href={EP_FORUM_LAB_DEEP_ANALYSIS_HREF}
                  className="rounded-full border border-emerald-700 px-3 py-1 text-emerald-900 hover:bg-white"
                >
                  Deep analysis v2 →
                </Link>
                <Link
                  href={EP_FORUM_LAB_PREDICTED_SCRIPT_HREF}
                  className="rounded-full border border-emerald-700 px-3 py-1 text-emerald-900 hover:bg-white"
                >
                  Predicted script →
                </Link>
              </div>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {deep.sevenDayIntegration.map((d) => {
              const cardBody = (
                <>
                  <p className="font-bold text-kelly-navy">
                    Day {d.dayNumber}: {d.dayTitle}
                  </p>
                  <p className="mt-1 text-kelly-muted">{d.useThisIntel}</p>
                  <p className="mt-2 font-bold text-emerald-900">Drill: {d.drillTonight}</p>
                </>
              );
              if (surface === "election-plan") {
                return (
                  <Link
                    key={d.dayNumber}
                    href={epForumLabIntegrationDayHref(d.dayNumber)}
                    className="block rounded-lg border border-emerald-200 bg-white p-3 text-xs transition hover:border-emerald-500 hover:shadow-sm"
                  >
                    {cardBody}
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-emerald-700">Drill down →</p>
                  </Link>
                );
              }
              return (
                <div key={d.dayNumber} className="rounded-lg border border-emerald-200 bg-white p-3 text-xs">
                  {cardBody}
                </div>
              );
            })}
          </div>
        </article>
      ) : null}
    </section>
  );
}

function AnalysisList({
  title,
  items,
  tone,
  categoryId,
  surface,
}: {
  title: string;
  items: string[];
  tone: "rose" | "amber" | "emerald" | "indigo" | "violet" | "sky";
  categoryId?: ForumAnalysisCategoryId;
  surface?: "admin" | "election-plan";
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

  const resolvedCategoryId = categoryId ?? forumAnalysisCategoryIdFromTitle(title);
  const linkLessons = surface === "election-plan" && resolvedCategoryId;

  return (
    <article className={`rounded-xl border ${border} bg-white p-4`}>
      <h3 className="text-xs font-bold uppercase text-kelly-subtle">
        {linkLessons ? (
          <Link href={epForumLabAnalysisCategoryHref(resolvedCategoryId)} className="hover:text-kelly-navy hover:underline">
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-kelly-text">
        {items.map((item) => {
          const lesson =
            linkLessons && resolvedCategoryId
              ? resolveForumAnalysisLessonFromBullet(resolvedCategoryId, item)
              : undefined;
          if (lesson && resolvedCategoryId) {
            return (
              <li key={item.slice(0, 48)}>
                <Link
                  href={epForumLabAnalysisItemHref(resolvedCategoryId, lesson.id)}
                  className="font-medium text-kelly-navy underline decoration-kelly-navy/30 hover:decoration-kelly-navy"
                >
                  {item}
                </Link>
              </li>
            );
          }
          return <li key={item.slice(0, 48)}>{item}</li>;
        })}
      </ul>
      {linkLessons ? (
        <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
          <Link href={epForumLabAnalysisCategoryHref(resolvedCategoryId)} className="text-kelly-navy underline">
            All {title.toLowerCase()} lessons →
          </Link>
        </p>
      ) : null}
    </article>
  );
}
