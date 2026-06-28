import { NextResponse } from "next/server";

import { applySessionAdvance } from "@/lib/cpos/meeting-engine";
import { loadMeetingManifest } from "@/lib/cpos/load-meeting-manifest";
import { canAccessPresenterConsole } from "@/lib/cpos/presenter-auth";
import {
  readMeetingSession,
  toPublicSession,
  writeMeetingSession,
} from "@/lib/cpos/session-store";
import type { SessionAdvancePayload } from "@/lib/cpos/session-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ meetingId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { meetingId } = await context.params;
  const { manifest, warnings, source } = loadMeetingManifest(meetingId);
  const session = readMeetingSession(meetingId);

  return NextResponse.json({
    session: toPublicSession(session),
    manifestMeta: {
      id: manifest.id,
      title: manifest.title,
      chapterCount: manifest.chapters.length,
      source,
      warnings: warnings.length > 0 ? warnings : undefined,
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { meetingId } = await context.params;

  if (!(await canAccessPresenterConsole())) {
    return NextResponse.json({ error: "Presenter auth required" }, { status: 401 });
  }

  const { manifest } = loadMeetingManifest(meetingId);
  let body: SessionAdvancePayload;
  try {
    body = (await request.json()) as SessionAdvancePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.action) {
    return NextResponse.json({ error: "action required" }, { status: 400 });
  }

  const session = applySessionAdvance(meetingId, body, manifest);
  return NextResponse.json({ session: toPublicSession(session) });
}

/** Reset session to lobby — presenter only */
export async function DELETE(_request: Request, context: RouteContext) {
  const { meetingId } = await context.params;
  if (!(await canAccessPresenterConsole())) {
    return NextResponse.json({ error: "Presenter auth required" }, { status: 401 });
  }

  const { manifest } = loadMeetingManifest(meetingId);
  const first = manifest.chapters.sort((a, b) => a.index - b.index)[0];
  const now = new Date().toISOString();
  const session = writeMeetingSession({
    meetingId,
    manifestVersion: manifest.version,
    status: "lobby",
    currentChapterId: first.id,
    currentChapterIndex: first.index,
    activeDemoId: null,
    presenterChapterIndex: first.index,
    startedAt: now,
    programStartedAt: null,
    updatedAt: now,
    transport: "polling",
  });

  return NextResponse.json({ session: toPublicSession(session) });
}
