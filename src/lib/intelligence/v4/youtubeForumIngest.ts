/**
 * YouTube caption fetch + optional yt-dlp audio download for forum transcript lab.
 */
import { mkdtemp, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { ACCA_2026_SOS_FORUM_EVENT } from "@/lib/intelligence/v4/forumVideoDropPath";

export function parseYoutubeVideoId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0] ?? null;
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {
    return null;
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n/g, " ")
    .trim();
}

function parseCaptionXml(xml: string): string {
  const parts: string[] = [];
  const re = /<text[^>]*start="([^"]*)"[^>]*>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const body = decodeHtmlEntities(m[2] ?? "");
    if (body) parts.push(body);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

type YoutubePlayerCaptions = {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: Array<{ baseUrl?: string; languageCode?: string }>;
    };
  };
};

async function fetchCaptionTrackUrl(videoId: string): Promise<string | null> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "Mozilla/5.0 (compatible; KellySOSForumLab/1.0)",
    },
  });
  if (!res.ok) return null;
  const html = await res.text();

  const playerMatch =
    html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]+?\})\s*;\s*(?:var|<\/script)/) ??
    html.match(/var ytInitialPlayerResponse = (\{[\s\S]+?\});/);
  if (!playerMatch?.[1]) return null;

  let player: YoutubePlayerCaptions;
  try {
    player = JSON.parse(playerMatch[1]) as YoutubePlayerCaptions;
  } catch {
    return null;
  }

  const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  if (!tracks.length) return null;

  const en =
    tracks.find((t) => t.languageCode === "en") ??
    tracks.find((t) => t.languageCode?.startsWith("en")) ??
    tracks[0];
  return en?.baseUrl ?? null;
}

export async function fetchYoutubeCaptionTranscript(
  videoId: string,
): Promise<{ ok: true; text: string; source: "youtube_captions" } | { ok: false; error: string }> {
  try {
    const trackUrl = await fetchCaptionTrackUrl(videoId);
    if (!trackUrl) {
      return {
        ok: false,
        error: "No English captions on this YouTube video — use local MP4 + Whisper or run forum:ingest-youtube-acca with yt-dlp.",
      };
    }
    const capRes = await fetch(trackUrl);
    if (!capRes.ok) return { ok: false, error: `Caption track fetch failed (${capRes.status}).` };
    const xml = await capRes.text();
    const text = parseCaptionXml(xml);
    if (text.length < 50) return { ok: false, error: "Caption track returned empty or too-short text." };
    return { ok: true, text, source: "youtube_captions" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function runCommand(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    proc.stderr?.on("data", (d) => {
      err += String(d);
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.slice(-800) || `${cmd} exited ${code}`));
    });
    proc.on("error", () => reject(new Error(`${cmd} not found on PATH.`)));
  });
}

export async function downloadYoutubeAudioWithYtDlp(
  videoId: string,
  outDir: string,
): Promise<{ ok: true; audioPath: string } | { ok: false; error: string }> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const outTemplate = path.join(outDir, `${videoId}.%(ext)s`);
  try {
    await runCommand("yt-dlp", [
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "5",
      "-o",
      outTemplate,
      "--no-playlist",
      url,
    ]);
    const audioPath = path.join(outDir, `${videoId}.mp3`);
    return { ok: true, audioPath };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type IngestYoutubeForumOpts = {
  urlOrId?: string;
  title?: string;
  eventLabel?: string;
  /** Prefer Whisper via yt-dlp when available (CLI / local server). */
  preferWhisper?: boolean;
  runDiarization?: boolean;
  runAnalysis?: boolean;
  runDeepAnalysis?: boolean;
};

export type IngestYoutubeForumResult = {
  ok: boolean;
  videoId?: string;
  transcriptChars?: number;
  transcriptSource?: string;
  warnings?: string[];
  error?: string;
};

export async function ingestYoutubeForumVideo(opts: IngestYoutubeForumOpts = {}): Promise<IngestYoutubeForumResult> {
  const warnings: string[] = [];
  const videoId = parseYoutubeVideoId(opts.urlOrId ?? ACCA_2026_SOS_FORUM_EVENT.youtubeVideoId);
  if (!videoId) return { ok: false, error: "Invalid YouTube URL or video ID." };

  const lab = await import("@/lib/intelligence/v4/forumTranscriptLab");
  const { loadForumTranscriptLab, saveForumTranscriptLab } = lab;
  type ForumTranscriptLabRecord = import("@/lib/intelligence/v4/forumTranscriptLab").ForumTranscriptLabRecord;
  const { diarizeForumTranscript, analyzeForumTranscript, analyzeForumTranscriptDeep } = await import(
    "@/lib/intelligence/v4/forumTranscriptAnalysis",
  );

  let rawText = "";
  let transcriptSource: "youtube_captions" | "youtube_whisper" = "youtube_captions";

  if (opts.preferWhisper) {
    const workDir = await mkdtemp(path.join(tmpdir(), "forum-yt-"));
    try {
      const dl = await downloadYoutubeAudioWithYtDlp(videoId, workDir);
      if (dl.ok) {
        const { transcribeForumMediaChunks } = await import("@/lib/intelligence/v4/transcribeForumVideoChunks");
        const tx = await transcribeForumMediaChunks(dl.audioPath);
        warnings.push(...tx.warnings);
        if (tx.ok) {
          rawText = tx.text;
          transcriptSource = "youtube_whisper";
        } else {
          warnings.push(`Whisper failed: ${tx.error}`);
        }
      } else {
        warnings.push(`yt-dlp failed: ${dl.error}`);
      }
    } finally {
      try {
        await unlink(path.join(workDir, `${videoId}.mp3`)).catch(() => undefined);
      } catch {
        /* cleanup */
      }
    }
  }

  if (!rawText) {
    const caps = await fetchYoutubeCaptionTranscript(videoId);
    if (!caps.ok) {
      return {
        ok: false,
        error: caps.error,
        warnings,
        videoId,
      };
    }
    rawText = caps.text;
    transcriptSource = caps.source;
    warnings.push("Used YouTube captions — speaker labels added via AI diarization.");
  }

  let transcriptText = rawText;
  if (opts.runDiarization !== false) {
    try {
      transcriptText = await diarizeForumTranscript(rawText);
      transcriptSource = transcriptSource === "youtube_whisper" ? "youtube_whisper" : "youtube_captions";
    } catch (e) {
      warnings.push(`Diarization failed: ${e instanceof Error ? e.message : String(e)} — saved raw transcript.`);
    }
  }

  const current = loadForumTranscriptLab();
  let record: ForumTranscriptLabRecord = {
    ...current,
    version: 2,
    updatedAt: new Date().toISOString(),
    title: opts.title ?? ACCA_2026_SOS_FORUM_EVENT.title,
    eventLabel: opts.eventLabel ?? `${ACCA_2026_SOS_FORUM_EVENT.date} · YouTube ${videoId}`,
    ownedMediaAssetId: null,
    transcriptText,
    transcriptSource,
    analysis: null,
    deepAnalysis: null,
    analysisStatus: "pending",
    deepAnalysisStatus: "not_started",
    analysisError: null,
    deepAnalysisError: null,
  };

  if (opts.runAnalysis) {
    try {
      record = {
        ...record,
        analysis: await analyzeForumTranscript(transcriptText),
        analysisStatus: "ready",
      };
    } catch (e) {
      record = {
        ...record,
        analysisStatus: "error",
        analysisError: e instanceof Error ? e.message : String(e),
      };
    }
  }

  if (opts.runDeepAnalysis) {
    try {
      record = {
        ...record,
        deepAnalysis: await analyzeForumTranscriptDeep(transcriptText),
        deepAnalysisStatus: "ready",
      };
    } catch (e) {
      record = {
        ...record,
        deepAnalysisStatus: "error",
        deepAnalysisError: e instanceof Error ? e.message : String(e),
      };
    }
  }

  saveForumTranscriptLab(record);

  return {
    ok: true,
    videoId,
    transcriptChars: transcriptText.length,
    transcriptSource,
    warnings,
  };
}
