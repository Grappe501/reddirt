import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  appendManifestAsset,
  appendManualSponsorLink,
} from "@/lib/legislature/videoArchiveRoomManifest";

export const dynamic = "force-dynamic";

const manualLinkSchema = z.object({
  type: z.literal("manual_sponsor_link"),
  billNumber: z.string().min(1),
  session: z.string().min(1),
  committeeName: z.string().min(1),
  meetingDate: z.string().optional(),
  videoUrl: z.string().url(),
  sponsorLabel: z.string().optional(),
  notes: z.string().optional(),
});

const cutReadySchema = z.object({
  type: z.literal("team_cut"),
  billNumber: z.string().min(1),
  session: z.string().min(1),
  title: z.string().min(1),
  externalUrl: z.string().url().optional(),
  parentCandidateId: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
});

const uploadRefSchema = z.object({
  type: z.literal("uploaded_raw"),
  billNumber: z.string().min(1),
  session: z.string().min(1),
  title: z.string().min(1),
  externalUrl: z.string().url().optional(),
  ownedMediaAssetId: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
});

const bodySchema = z.discriminatedUnion("type", [manualLinkSchema, cutReadySchema, uploadRefSchema]);

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  if (data.type === "manual_sponsor_link") {
    const row = appendManualSponsorLink({
      billNumber: data.billNumber,
      session: data.session,
      committeeName: data.committeeName,
      meetingDate: data.meetingDate,
      videoUrl: data.videoUrl,
      sponsorLabel: data.sponsorLabel,
      notes: data.notes,
    });
    return Response.json({ ok: true, row });
  }

  if (data.type === "team_cut") {
    const row = appendManifestAsset({
      billNumber: data.billNumber,
      session: data.session,
      kind: "TEAM_CUT",
      title: data.title,
      externalUrl: data.externalUrl,
      parentCandidateId: data.parentCandidateId ?? null,
      notes: data.notes,
      createdBy: data.createdBy,
    });
    return Response.json({ ok: true, row, folder: "cut-and-ready" });
  }

  const row = appendManifestAsset({
    billNumber: data.billNumber,
    session: data.session,
    kind: "UPLOADED_RAW",
    title: data.title,
    externalUrl: data.externalUrl,
    ownedMediaAssetId: data.ownedMediaAssetId ?? null,
    notes: data.notes ?? "File upload to OwnedMediaAsset — wire multipart ingest in phase 2.",
    createdBy: data.createdBy,
  });
  return Response.json({
    ok: true,
    row,
    note: "Metadata saved. Binary upload to database storage will use MediaIngestBatch in a follow-up pass.",
  });
}
