/** Runtime meeting session — not persisted in manifest. */

export type MeetingSessionStatus = "lobby" | "live" | "paused" | "ended";

export interface MeetingSession {
  meetingId: string;
  manifestVersion: number;
  status: MeetingSessionStatus;
  currentChapterId: string;
  currentChapterIndex: number;
  activeDemoId: string | null;
  presenterChapterIndex: number;
  startedAt: string;
  programStartedAt: string | null;
  updatedAt: string;
  transport: "polling";
}

export interface MeetingSessionPublic {
  meetingId: string;
  manifestVersion: number;
  status: MeetingSessionStatus;
  currentChapterId: string;
  currentChapterIndex: number;
  activeDemoId: string | null;
  updatedAt: string;
}

export interface SessionAdvancePayload {
  action: "advance" | "back" | "jump" | "start" | "end" | "set_demo" | "clear_demo";
  chapterIndex?: number;
  chapterId?: string;
  demoId?: string | null;
}
