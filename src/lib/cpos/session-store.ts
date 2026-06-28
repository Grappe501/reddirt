import fs from "fs";
import os from "os";
import path from "path";

import { loadMeetingManifest, KICKOFF_MEETING_ID } from "./load-meeting-manifest";
import type { MeetingSession, MeetingSessionPublic } from "./session-types";

/** Warm Lambda fallback when filesystem is unavailable (Netlify). */
const memorySessions = new Map<string, MeetingSession>();

function sessionDir(): string {
  const envDir = process.env.CPOS_SESSION_DIR?.trim();
  if (envDir) return envDir;
  // Netlify/serverless: writable /tmp only (ephemeral per instance).
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "cpos-sessions");
  }
  const local = path.join(process.cwd(), ".local", "cpos-sessions");
  const data = path.join(process.cwd(), "data/cpos/sessions");
  if (process.env.NODE_ENV === "production") {
    try {
      if (!fs.existsSync(local)) fs.mkdirSync(local, { recursive: true });
      return local;
    } catch {
      return data;
    }
  }
  if (!fs.existsSync(data)) fs.mkdirSync(data, { recursive: true });
  return data;
}

function sessionFilePath(meetingId: string): string {
  return path.join(sessionDir(), `${meetingId}-live.json`);
}

function defaultSession(meetingId: string): MeetingSession {
  const { manifest } = loadMeetingManifest(meetingId);
  const firstChapter = manifest.chapters[0];
  const now = new Date().toISOString();
  return {
    meetingId,
    manifestVersion: manifest.version,
    status: "lobby",
    currentChapterId: firstChapter.id,
    currentChapterIndex: firstChapter.index,
    activeDemoId: null,
    presenterChapterIndex: firstChapter.index,
    startedAt: now,
    programStartedAt: null,
    updatedAt: now,
    transport: "polling",
  };
}

export function readMeetingSession(meetingId: string): MeetingSession {
  const cached = memorySessions.get(meetingId);
  if (cached) return cached;

  const filePath = sessionFilePath(meetingId);
  try {
    if (fs.existsSync(filePath)) {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as MeetingSession;
      if (raw.meetingId === meetingId) {
        memorySessions.set(meetingId, raw);
        return raw;
      }
    }
  } catch {
    // corrupt file — reset
  }
  const session = defaultSession(meetingId);
  return writeMeetingSession(session);
}

export function writeMeetingSession(session: MeetingSession): MeetingSession {
  const updated = { ...session, updatedAt: new Date().toISOString() };
  memorySessions.set(session.meetingId, updated);
  const dir = sessionDir();
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(sessionFilePath(session.meetingId), JSON.stringify(updated, null, 2), "utf8");
  } catch {
    // Netlify: memory map still holds state for warm instances
  }
  return updated;
}

export function toPublicSession(session: MeetingSession): MeetingSessionPublic {
  return {
    meetingId: session.meetingId,
    manifestVersion: session.manifestVersion,
    status: session.status,
    currentChapterId: session.currentChapterId,
    currentChapterIndex: session.currentChapterIndex,
    activeDemoId: session.activeDemoId,
    updatedAt: session.updatedAt,
  };
}

export function getKickoffSession(): MeetingSession {
  return readMeetingSession(KICKOFF_MEETING_ID);
}
