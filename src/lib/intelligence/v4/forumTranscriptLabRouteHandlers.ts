import { randomUUID } from "node:crypto";
import { z } from "zod";
import { OwnedMediaKind, OwnedMediaRole, OwnedMediaSourceType, OwnedMediaStorageBackend } from "@prisma/client";
import { prisma } from "@/lib/db";
import { saveOwnedMediaFile, inferOwnedMediaKind } from "@/lib/owned-media/storage";
import { storageKeyToAbsoluteFilePath } from "@/lib/owned-media/paths";
import {
  loadForumTranscriptLab,
  saveForumTranscriptLab,
  type ForumTranscriptLabRecord,
} from "@/lib/intelligence/v4/forumTranscriptLab";
import { analyzeForumTranscript, analyzeForumTranscriptDeep, transcribeForumMediaFile } from "@/lib/intelligence/v4/forumTranscriptAnalysis";

const pasteSchema = z.object({
  action: z.literal("paste"),
  title: z.string().min(1).max(200),
  eventLabel: z.string().max(300).optional(),
  transcriptText: z.string().min(50),
});

const analyzeSchema = z.object({
  action: z.literal("analyze"),
});

const analyzeDeepSchema = z.object({
  action: z.literal("analyze_deep"),
});

function mergeRecord(current: ForumTranscriptLabRecord, patch: Partial<ForumTranscriptLabRecord>): ForumTranscriptLabRecord {
  return {
    ...current,
    ...patch,
    version: 2,
    updatedAt: new Date().toISOString(),
  };
}

export function getForumTranscriptLabPayload() {
  return { ok: true as const, record: loadForumTranscriptLab() };
}

export async function handleForumTranscriptLabPost(req: Request): Promise<Response> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    const title = String(form.get("title") ?? "Three-candidate SOS forum").trim();
    const eventLabel = String(form.get("eventLabel") ?? "Forum recording upload").trim();

    if (!file || !(file instanceof File) || file.size === 0) {
      return Response.json({ ok: false, error: "missing_file" }, { status: 400 });
    }

    const assetId = randomUUID();
    let saved: Awaited<ReturnType<typeof saveOwnedMediaFile>>;
    try {
      saved = await saveOwnedMediaFile({ assetId, file });
    } catch (e) {
      return Response.json(
        { ok: false, error: e instanceof Error ? e.message : "upload_failed" },
        { status: 400 },
      );
    }

    const kind = inferOwnedMediaKind(saved.mimeType);
    await prisma.ownedMediaAsset.create({
      data: {
        id: assetId,
        storageKey: saved.storageKey,
        storageBackend: OwnedMediaStorageBackend.LOCAL_DISK,
        fileName: saved.fileName,
        mimeType: saved.mimeType,
        fileSizeBytes: saved.fileSizeBytes,
        kind: Object.values(OwnedMediaKind).includes(kind as OwnedMediaKind) ? (kind as OwnedMediaKind) : OwnedMediaKind.VIDEO,
        role: OwnedMediaRole.OTHER,
        sourceType: OwnedMediaSourceType.DIRECT_UPLOAD,
        title,
        description: "Forum transcript lab — debate prep intelligence",
        contentSeries: "debate-forum-intel",
        campaignPhase: "debate-week-2026",
      },
    });

    let transcriptText = "";
    let transcriptSource: ForumTranscriptLabRecord["transcriptSource"] = "pending";

    const tx = await transcribeForumMediaFile(storageKeyToAbsoluteFilePath(saved.storageKey));
    if (tx.ok) {
      transcriptText = tx.text;
      transcriptSource = "upload_whisper";
    }

    const current = loadForumTranscriptLab();
    const record: ForumTranscriptLabRecord = mergeRecord(current, {
      title,
      eventLabel,
      ownedMediaAssetId: assetId,
      transcriptText,
      transcriptSource,
      analysis: null,
      deepAnalysis: null,
      analysisStatus: transcriptText ? "pending" : "error",
      deepAnalysisStatus: "not_started",
      analysisError: transcriptText ? null : tx.ok ? null : tx.error,
      deepAnalysisError: null,
    });
    saveForumTranscriptLab(record);

    return Response.json({
      ok: true,
      record,
      mediaPreviewUrl: `/api/owned-campaign-media/${assetId}/preview`,
      note: transcriptText
        ? "Transcript ready — run Analyze to build debate plan."
        : "Upload saved — paste transcript or enable OPENAI_API_KEY for Whisper.",
    });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const action = (json as { action?: string }).action;

  if (action === "paste") {
    const parsed = pasteSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
    }
    const current = loadForumTranscriptLab();
    const record: ForumTranscriptLabRecord = mergeRecord(current, {
      title: parsed.data.title,
      eventLabel: parsed.data.eventLabel ?? "Pasted forum transcript",
      ownedMediaAssetId: null,
      transcriptText: parsed.data.transcriptText.trim(),
      transcriptSource: "paste",
      analysis: null,
      deepAnalysis: null,
      analysisStatus: "pending",
      deepAnalysisStatus: "not_started",
      analysisError: null,
      deepAnalysisError: null,
    });
    saveForumTranscriptLab(record);
    return Response.json({ ok: true, record });
  }

  if (action === "analyze") {
    const parsed = analyzeSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "validation" }, { status: 400 });
    }
    const current = loadForumTranscriptLab();
    if (!current.transcriptText || current.transcriptText.length < 50) {
      return Response.json({ ok: false, error: "transcript_missing" }, { status: 400 });
    }
    try {
      const analysis = await analyzeForumTranscript(current.transcriptText);
      const record = mergeRecord(current, {
        analysis,
        analysisStatus: "ready",
        analysisError: null,
      });
      saveForumTranscriptLab(record);
      return Response.json({ ok: true, record });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      saveForumTranscriptLab(
        mergeRecord(current, {
          analysisStatus: "error",
          analysisError: message,
        }),
      );
      return Response.json({ ok: false, error: message }, { status: 500 });
    }
  }

  if (action === "analyze_deep") {
    const parsed = analyzeDeepSchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ ok: false, error: "validation" }, { status: 400 });
    }
    const current = loadForumTranscriptLab();
    if (!current.transcriptText || current.transcriptText.length < 50) {
      return Response.json({ ok: false, error: "transcript_missing" }, { status: 400 });
    }
    try {
      const deepAnalysis = await analyzeForumTranscriptDeep(current.transcriptText);
      const record = mergeRecord(current, {
        deepAnalysis,
        deepAnalysisStatus: "ready",
        deepAnalysisError: null,
      });
      saveForumTranscriptLab(record);
      return Response.json({ ok: true, record });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      saveForumTranscriptLab(
        mergeRecord(current, {
          deepAnalysisStatus: "error",
          deepAnalysisError: message,
        }),
      );
      return Response.json({ ok: false, error: message }, { status: 500 });
    }
  }

  return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
