import type { MeetingManifest } from "./schemas/meeting-manifest";
import type { MeetingSession, SessionAdvancePayload } from "./session-types";
import { readMeetingSession, writeMeetingSession } from "./session-store";

export function applySessionAdvance(
  meetingId: string,
  payload: SessionAdvancePayload,
  manifest: MeetingManifest,
): MeetingSession {
  const session = readMeetingSession(meetingId);
  const chapters = manifest.chapters.sort((a, b) => a.index - b.index);
  const maxIndex = chapters.length - 1;
  let idx = session.presenterChapterIndex;
  const now = new Date().toISOString();

  switch (payload.action) {
    case "start":
      session.status = "live";
      session.programStartedAt = session.programStartedAt ?? now;
      break;
    case "end":
      session.status = "ended";
      break;
    case "advance":
      idx = Math.min(idx + 1, maxIndex);
      break;
    case "back":
      idx = Math.max(idx - 1, 0);
      break;
    case "jump":
      if (payload.chapterIndex !== undefined) {
        idx = Math.max(0, Math.min(payload.chapterIndex, maxIndex));
      } else if (payload.chapterId) {
        const found = chapters.find((c) => c.id === payload.chapterId);
        if (found) idx = found.index;
      }
      break;
    case "set_demo":
      session.activeDemoId = payload.demoId ?? null;
      writeMeetingSession({ ...session, updatedAt: now });
      return readMeetingSession(meetingId);
    case "clear_demo":
      session.activeDemoId = null;
      writeMeetingSession({ ...session, updatedAt: now });
      return readMeetingSession(meetingId);
    default:
      break;
  }

  const chapter = chapters.find((c) => c.index === idx) ?? chapters[0];
  session.presenterChapterIndex = idx;
  session.currentChapterIndex = idx;
  session.currentChapterId = chapter.id;
  session.activeDemoId = null;
  if (session.status === "lobby" && payload.action === "advance") {
    session.status = "live";
    session.programStartedAt = session.programStartedAt ?? now;
  }

  return writeMeetingSession(session);
}

export function buildDemoUrl(
  demo: { path: string; presentationQuery?: Record<string, string> },
  meetingId: string,
  returnPath: string,
): string {
  const params = new URLSearchParams({
    presentation: "true",
    cpos: "1",
    meetingSession: meetingId,
    returnTo: returnPath,
    ...(demo.presentationQuery ?? {}),
  });
  return `${demo.path}?${params.toString()}`;
}
