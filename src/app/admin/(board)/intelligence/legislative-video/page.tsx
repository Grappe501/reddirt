import { LEGISLATIVE_GOVERNANCE } from "@/lib/legislature/legislativeGovernance";
import { loadSafeLegislativeVideoPageData } from "@/lib/intelligence/safeLegislativeVideoPage";
import { V4DebateWarRoomPanel } from "@/components/admin/intelligence/v4/V4DebateWarRoomPanel";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

export default async function LegislativeVideoIntelligencePage() {
  const { launchMode, registry, priority, rollup, video, claims, transcription, audioReadiness, transcriptionReadiness, p4 } =
    await loadSafeLegislativeVideoPageData();

  if (launchMode && p4) {
    return (
      <div className="mx-auto max-w-7xl p-6 text-kelly-text">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <strong>Debate launch mode</strong> — P4 film room from opposition clips/quotes JSON. Full pipeline (discovery,
          ASR, message intel) deferred to keep Netlify fast. {rollup.automationNote}
        </div>
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Legislative &amp; media command (P4)</h1>
        <V4DebateWarRoomPanel packet={p4} variant="compact" />
        <p className="mt-6 text-xs">
          <Link href="/admin/intelligence/debate-command" className="font-bold text-kelly-navy underline">
            Debate command
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <strong>INTERNAL ONLY</strong> — {LEGISLATIVE_GOVERNANCE.labels.join(" · ")}. No publish/send/export.
        Transcripts require human review. Speaker attribution must be verified before quote use.
      </div>

      <h1 className="font-heading text-2xl font-bold text-kelly-navy">Legislative Video Intelligence</h1>
      <p className="mt-1 text-sm text-kelly-muted">
        Automated Arkansas committee video discovery, transcription queue, chunking, and claim binding.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Priority bills", priority.total],
          ["Video candidates", video.totalCandidates],
          ["Transcript chunks", rollup.chunkCount],
          ["Claims linked", claims.withClaims],
          ["Transcription", transcription],
          ["Critical bills", priority.byPriority.CRITICAL],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-kelly-text/10 bg-white p-3 text-xs">
            <div className="text-kelly-muted">{label}</div>
            <div className="mt-1 text-lg font-semibold text-kelly-navy">{value}</div>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Audio / transcription readiness</h2>
        <ul className="mt-2 list-inside list-disc text-kelly-muted">
          <li>Audio extract enabled: {audioReadiness.enabled ? "yes" : "no (LEGISLATURE_AUDIO_EXTRACT=1)"}</li>
          <li>ffmpeg on PATH: {"ffmpegAvailable" in audioReadiness && audioReadiness.ffmpegAvailable ? "yes" : "no — deferred"}</li>
          <li>Transcription enabled: {transcriptionReadiness.enabled ? "yes" : "no"}</li>
          <li>OpenAI configured: {transcriptionReadiness.openaiConfigured ? "yes" : "no"}</li>
          <li>Provider status: {transcription}</li>
        </ul>
      </section>

      <section className="mt-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Critical bill processing</h2>
        <p className="mt-1 text-kelly-muted">
          {priority.byPriority.CRITICAL} CRITICAL bills · {rollup.billsMissingVideo.length} missing video
        </p>
        <Link href="/admin/intelligence" className="mt-2 inline-block underline text-kelly-navy">
          Intelligence hub →
        </Link>
      </section>

      <section className="mt-6 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Automation status</h2>
        <p className="mt-2 text-kelly-muted">{rollup.automationNote}</p>
      </section>

      <section className="mt-4 rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
        <h2 className="font-semibold text-kelly-navy">Priority bills (top 10)</h2>
        <ul className="mt-2 space-y-1">
          {registry.bills
            .filter((b) => b.priorityLevel === "CRITICAL" || b.priorityLevel === "HIGH")
            .slice(0, 10)
            .map((b) => (
              <li key={`${b.billNumber}-${b.session}`} className="text-kelly-muted">
                [{b.priorityLevel}] {b.billNumber} — {b.videoDiscoveryStatus} —{" "}
                <a href={b.billUrl} className="underline" target="_blank" rel="noreferrer">
                  bill page
                </a>
              </li>
            ))}
        </ul>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="font-semibold text-kelly-navy">Strongest clips/quotes</h2>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {rollup.strongestQuotes.length ? rollup.strongestQuotes.map((q) => <li key={q}>{q}</li>) : <li>None yet</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
          <h2 className="font-semibold text-kelly-navy">Chunks needing review</h2>
          <ul className="mt-2 list-inside list-disc text-kelly-muted">
            {rollup.quotesNeedingReview.length ? rollup.quotesNeedingReview.map((q) => <li key={q}>{q}</li>) : <li>None indexed</li>}
          </ul>
        </div>
      </section>

      <p className="mt-6 text-xs text-kelly-muted">
        <Link href="/admin/intelligence/kim-hammer/debate-prep" className="underline text-kelly-navy">
          Debate prep
        </Link>
      </p>
    </div>
  );
}
